export interface EventOptions {
    bubbles?: boolean;
    cancelable?: boolean;
    composed?: boolean;
}

export interface GamepadButtonEventDetails {

    gamepad: Readonly<Gamepad>;

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

    index: number;
}

export type GamepadButtonEvent = CustomEvent<GamepadButtonEventDetails>;