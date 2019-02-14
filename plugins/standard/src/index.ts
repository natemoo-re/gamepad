import * as d from './declarations';

// 'a',
// 'b',
// 'x',
// 'y',
// 'leftTop',
// 'rightTop',
// 'leftTrigger',
// 'rightTrigger',
// 'select',
// 'start',
// 'leftStick',
// 'rightStick',
// 'dpadUp',
// 'dpadDown',
// 'dpadLeft',
// 'dpadRight'

export default function standard(opts?: d.PluginOptions) {
    const buttonMap = ['a', 'x', 'b', 'y', 'sl', 'sr', '-', '-', 'minus', 'plus', 'lstick', 'rstick', 'home', 'screenshot', 'bumper', 'trigger'];

    return {
        name: 'standard',
        enabled: (gamepad: Gamepad) => (gamepad.mapping === 'standard'),
        // transform: (gamepad: Gamepad): d.PluginTransformResults => {
        //     if (gamepad.id.indexOf('Joy-Con') === -1) return;

        //     const side = gamepad.id.charAt(9);
        //     const buttons = gamepad.buttons.map((b, index) => ({ ...b, key: buttonMap[index] }));

        //     return {
        //         ...gamepad,
        //         buttons
        //     }
        // }
    }
}

