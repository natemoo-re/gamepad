// import { EventEmitter } from './events';
import merge from 'lodash.merge';
import isEqual from 'lodash.isequal';
import * as d from './declarations';
import { memoizePlugin } from './utils';
import Events from './events';


export class GamepadEventEmitter {

    private rafId: number;

    private plugins: d.Plugin[] = [];
    private enabledPlugins: Map<string, d.Plugin[]> = new Map();
    private connected: string[] = [];

    private context = new Map<string, d.GamepadContext>();

    constructor(opts: { plugins?: d.Plugin[] } = {}) {
        const { plugins = [] } = opts;

        this.plugins = plugins.map(p => memoizePlugin(p));

        window.addEventListener('gamepadconnected', this.onGamepadConnected);
        window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected);
    }

    public destroy() {
        window.removeEventListener('gamepadconnected', this.onGamepadConnected);
        window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected);
    }

    private getGamepadContext = (gamepad: Gamepad): d.GamepadContext => {
        let context: d.GamepadContext = this.context.get(gamepad.id);
        if (!context) {
            context = {
                hand: gamepad.hand,
                id: gamepad.id,
                index: gamepad.index,
                mapping: gamepad.mapping
            };
            this.context.set(gamepad.id, context);
        }
        return context;
    }

    private onGamepadConnected = (event: GamepadEvent) => {
        const { gamepad } = event;
        this.getGamepadContext(gamepad);

        this.connected.push(gamepad.id);
        this.setEnabledPlugins(gamepad);

        if (typeof this.rafId === 'undefined') {
            this.rafId = requestAnimationFrame(() => this.run());
        }
    }

    private onGamepadDisconnected = (event: GamepadEvent) => {
        const { gamepad } = event;
        this.connected = [...this.connected].filter(id => id !== gamepad.id);

        if (!this.connected.length) {
            cancelAnimationFrame(this.rafId);
        }
    }

    private setEnabledPlugins(gamepad: Gamepad) {
        for (let plugin of this.plugins) {
            if (typeof plugin.enabled === 'function') {
                const enabled = plugin.enabled(gamepad) || false;
                if (enabled) {
                    const existing = this.enabledPlugins.get(gamepad.id) || [];
                    this.enabledPlugins.set(gamepad.id, [...existing, plugin]);
                }
            }
        }
    }

    // private prevTimestamp: number[] = [];
    // private prevState: Gamepad[] = [];
    // private map = new Map<number, Gamepad>();
    private previousTimestamp: Map<string, number> = new Map();
    private previousButtons: Map<string, Readonly<GamepadButton>[]> = new Map();
    private previousAxes: Map<string, number[]> = new Map();

    private handleGamepadState(gamepad: Gamepad) {
        const current = Object.freeze(merge({}, gamepad));
        const context = this.context.get(gamepad.id);
        const { id, timestamp } = current;

        const plugins = this.enabledPlugins.get(id) || [];

        const previous = {
            buttons: this.previousButtons.get(id),
            axes: this.previousAxes.get(id)
        }

        const buttons = current.buttons.map(b => Object.freeze(merge({}, b)));
        const axes = [...current.axes];

        if (this.previousTimestamp.get(id) !== timestamp) {
            if (previous.buttons) {
                buttons.forEach((button, index) => {
                    const prev = previous.buttons[index];
                    if (!isEqual(prev, button)) {
                        let transformed = plugins[0].button({ ...button, index }, { gamepad: context });

                        if (button.pressed) {
                            Events.buttondown.emit({ ...transformed, index, gamepad: current } as any);
                        } else {
                            Events.buttonup.emit({ ...transformed, index, gamepad: current } as any);
                        }
                    }
                })
            }

            if (previous.axes) {
                axes.forEach((axis, index) => {
                    const prev = previous.axes[index];
                    if (!isEqual(prev, axis)) {
                        let transformed: any = axis;
                        for (let plugin of plugins) {
                            if (typeof plugin.axis === 'function') {
                                transformed = plugin.axis({ ...transformed, index }, { gamepad: context });
                            }
                        }

                        console.log('axischange', transformed);
                        Events.axischange.emit(transformed);
                    }
                })
            }

            this.previousTimestamp.set(id, timestamp);
            this.previousButtons.set(id, buttons);
            this.previousAxes.set(id, axes);
        } else {
            previous.buttons.forEach((button, index) => {
                if (button.pressed) {
                    let transformed: any = button;
                    for (let plugin of plugins) {
                        transformed = plugin.button({ ...transformed, index }, { gamepad: context });
                    }
                    Events.buttonpress.emit(transformed);
                }
            })
            // console.log(previous.buttons[0], buttons[0]);
        }
    }

    private run() {
        if (!this.connected || (this.connected && !this.connected.length)) {
            cancelAnimationFrame(this.rafId);
            return;
        };
        const gamepads = navigator.getGamepads();

        for (const gamepad of Object.values(gamepads).filter(x => x)) {
            this.handleGamepadState(gamepad);
        }

        // if (prevState) {
        //     if (prevState[0].buttons[0].pressed) {
        //         console.log('keydown');
        //         console.log('keypress');
        //         if (state[0].buttons[0].pressed) {
        //             console.log('keyup');
        //         }
        //     }
        // }

        this.rafId = requestAnimationFrame(() => this.run());
        // for (let connected of this.connected) {
        //     // const previous = prevState.find(gamepad => gamepad.id === connected.originalId);
        //     // const current = state.find(gamepad => gamepad.id === connected.originalId);

        //     if (previous) {
        //         for (let [i, button] of Object.entries(current.buttons)) {
        //             const index = Number.parseInt(i);
        //             const previousButton = previous.buttons[index];

        //             if (index === 0) {
        //                 console.log(button, previousButton);
        //                 if (button.pressed) {
        //                     return;
        //                 }
        //             }

        //             // if (button.value !== previousButton.value) {
        //             //     console.log('Different!', index);
        //             // }
        //         }
        //     }
        //     // const gamepad = gamepads.find(g => g.id === connected.originalId);
        //     // console.log(connected);
        // }
    }

}
