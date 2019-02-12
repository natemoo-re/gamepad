export * from '@gamepad/core';

export type JoyconMode = 'single' | 'dual';

export interface PluginOptions {
    /** 
     * Determines how multiple Joycon connections should be handled 
     **/
    mode?: 'single' | 'dual'
}

export interface PluginTransformResults extends Gamepad {
    buttons: (GamepadButton & { key: string })[]
}