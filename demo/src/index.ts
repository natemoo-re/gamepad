import { GamepadEventEmitter, GamepadButtonEvent } from '@gamepad/core';
import joycon from '@gamepad/plugin-joycon';

new GamepadEventEmitter()

window.addEventListener('gamepadbuttondown', (event: GamepadButtonEvent) => {
    console.log(event.detail.button);
})

// window.addEventListener('gamepadaxischange', (event) => {
//     console.log(event.detail.code);
// })