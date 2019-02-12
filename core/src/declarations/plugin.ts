import * as d from './index';

type Without<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export interface GamepadContext {
    readonly hand: GamepadHand;
    readonly id: string;
    readonly index: number;
    readonly mapping: GamepadMappingType;
}

export interface GamepadPluginButton {
    (button: GamepadButton & { index: number }, context: { gamepad: GamepadContext }): Without<d.GamepadButtonEventDetails, 'index'|'gamepad'>
}

export interface Plugin {
    name?: string;
    enabled?: (gamepad: Gamepad) => boolean;
    button?: GamepadPluginButton;
    axis?: (axis: number, context: any) => any;
}