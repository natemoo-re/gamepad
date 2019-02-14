// import * as d from './index';

export interface GamepadContext {
    readonly buttons: { value: GamepadButton, index: number }[];
    readonly axes: { value: number, index: number }[];
    readonly hand: GamepadHand;
    readonly id: string;
    readonly index: number;
    readonly mapping: GamepadMappingType;
}

// export interface GamepadPluginButton {
//     (button: GamepadButton & { index: number }, context: { gamepad: GamepadContext }): Without<d.GamepadButtonEventDetails, 'index'|'gamepad'>
// }

export interface GamepadButtonTransform {
    /**
     * Represents the value of the button pressed by the user.
     * 
     * This property takes into considerations the state of modifier buttons as well as the Gamepad layout.
     **/
    button: string;

    /** 
     * Represents the physical button pressed.
     * 
     * This property returns a value which isn't altered by Gamepad layout or the state of any modifier buttons.
     **/
    code: string;

    value: GamepadButton;
}

export interface GamepadAxisTransform {

    /**
     * Represents the horizontal position of the axis, from left (-1) to right (1)
     **/
    x: number;

    /** 
     * Represents the vertical position of the axis, from top (-1) to bottom (1)
     **/
    y: number;

    /**
     * The name of this axis. For example, 'LStick' or 'RStick'
     */
    axis: string;
}

export interface Plugin {
    name?: string;
    enabled?: (gamepad: Gamepad) => boolean;
    transform?: (context: GamepadContext) => { buttons?: (string|GamepadButtonTransform)[], axes?: GamepadAxisTransform[] };
}