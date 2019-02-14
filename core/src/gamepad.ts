// import { EventEmitter } from './events';
import merge from 'lodash.merge';
// import isEqual from 'lodash.isequal';
import * as d from './declarations';
import { memoizePlugin } from './utils';
// import memoize from 'fast-memoize';
import Events from './events';


export class GamepadEventEmitter {

    private rafId: number;

    private plugins: d.Plugin[] = [];
    private enabledPlugins: Map<string, d.Plugin> = new Map();
    private connected: string[] = [];

    private context = new Map<string, d.GamepadContext>();

    constructor(opts: { plugins?: d.Plugin[] } = {}) {
        const { plugins = [] } = opts;

        this.plugins = plugins.map(p => memoizePlugin(p));

        window.addEventListener('gamepadconnected', this.onGamepadConnected);
        window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected);
    }

    public unsubscribe() {
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
                mapping: gamepad.mapping,
                buttons: [],
                axes: []
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
        
        this.previous.set(gamepad.id, { timestamp: -1, buttons: [], axes: [] });

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
            if (typeof plugin.enabled === 'function' && !this.enabledPlugins.has(gamepad.id)) {
                const enabled = plugin.enabled(gamepad) || false;
                if (enabled) {
                    this.enabledPlugins.set(gamepad.id, plugin);
                }
            }
        }
    }

    freeze = (gamepad: Gamepad) => Object.freeze({ ...merge({}, gamepad), ...{ buttons: gamepad.buttons.map(({ pressed, touched, value }) => ({ pressed, touched, value })), axes: gamepad.axes.map(n => n) } });

    diff = (previous: any, transformed: any) => {
        const buttons: d.GamepadButtonTransform[] = transformed.buttons.filter((button: any, index: number) => {
            const prev = previous.buttons[index];
            if (!prev) return false;
            return (prev.value.value !== button.value.value)
        })
        const axes: d.GamepadAxisTransform[] = transformed.axes.filter((axis: any, index: number) => {
            const prev = previous.axes[index];
            if (!prev) return false;
            return (prev.x !== axis.x || prev.y !== axis.y);
        })

        return { buttons, axes }
    }

    private previous: Map<string, { timestamp: number, buttons: d.GamepadButtonTransform[], axes: d.GamepadAxisTransform[] }> = new Map();

    private handleGamepadState(state: Gamepad) {
        const id = state.id;

        const current = this.freeze(state);
        const previous = this.previous.get(id);
        
        if (previous.timestamp !== current.timestamp) {
            const plugin = this.enabledPlugins.get(id);
            const transformed: { buttons: d.GamepadButtonTransform[], axes: d.GamepadAxisTransform[] } = plugin.transform(current);
            const diff = this.diff(previous, transformed);

            for (const button of diff.buttons) {
                const prev = previous.buttons.find(b => b.button === button.button && b.code === button.code);
                if (!prev.value.pressed && button.value.pressed) {
                    Events.buttondown.emit({ ...button, gamepad: current } as any);
                } else if (prev.value.pressed && !button.value.pressed) {
                    Events.buttonup.emit({ ...button, gamepad: current } as any);
                }
            }
            for (const axis of diff.axes) {
                Events.axischange.emit({ ...axis, gamepad: current } as any);
            }
            

            const { timestamp } = current;
            const { buttons, axes } = transformed;
            this.previous.set(id, { timestamp, buttons, axes });
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

        this.rafId = requestAnimationFrame(() => this.run());
    }

}
