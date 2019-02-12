import * as d from './declarations';

const sides: Map<string, string> = new Map();
const getSide = (id: string) => {
    let side = sides.get(id);
    if (!side) {
        side = id.charAt(9).toUpperCase();
        sides.set(id, side)
    }
    return side;
}

const getButton = (code: string, side: string) => {
    switch (code) {
        case 'Trigger': return `Z${side}`;
        case 'Bumper': return side;
        case 'A': return (side === 'L') ? 'ArrowLeft' : code;
        case 'X': return (side === 'L') ? 'ArrowDown' : code;
        case 'B': return (side === 'L') ? 'ArrowUp' : code;
        case 'Y': return (side === 'L') ? 'ArrowRight' : code;
        default: return code;
    }
}

export default function joycon(opts: d.PluginOptions = {}): d.Plugin {
    const { mode = null } = opts;
    console.log(mode);

    const buttonMap = ['A', 'X', 'B', 'Y', 'SL', 'SR', '-', '-', 'Minus', 'Plus', 'LStick', 'RStick', 'Home', 'Screenshot', 'Bumper', 'Trigger'];

    return {
        name: 'joycon',
        enabled: (gamepad: Gamepad) => (gamepad.id.indexOf('Joy-Con') > -1),
        button: (state, context) => {
            const { gamepad } = context;
            const { index } = state;
            
            const side = getSide(gamepad.id);
            const code = buttonMap[index];
            let button = getButton(code, side);

            return { code, button };
        },
        axis: (value, context) => {
            console.log(context);
            const index = 9;
            
            let state: { x: number, y: number } | number = value;
            if (index === 9) {
                value = Math.round(value / (2 / 7) + 3.5);
                switch (value) {
                    case 8: 
                        state = { x: 0, y: 0 };
                        break;
                    case 7: 
                        state = { x: 1, y: -1 };
                        break;
                    case 6: 
                        state = { x: 0, y: -1 };
                        break;
                    case 5: 
                        state = { x: -1, y: -1 };
                        break;
                    case 4: 
                        state = { x: -1, y: 0 };
                        break;
                    case 3: 
                        state = { x: -1, y: 1 };
                        break;
                    case 2: 
                        state = { x: 0, y: 1 };
                        break;
                    case 1: 
                        state = { x: 1, y: 1 };
                        break;
                    case 0: 
                        state = { x: 1, y: 0 };
                        break;
                }
            }
            return { state, axis: 'left' };
        }
        // mapping: (gamepad: Gamepad) => {
        //     // buttons[0]	Bottom button in right cluster
        //     // buttons[1]	Right button in right cluster
        //     // buttons[2]	Left button in right cluster
        //     // buttons[3]	Top button in right cluster
        //     // buttons[4]	Top left front button
        //     // buttons[5]	Top right front button
        //     // buttons[6]	Bottom left front button
        //     // buttons[7]	Bottom right front button
        //     // buttons[8]	Left button in center cluster
        //     // buttons[9]	Right button in center cluster
        //     // buttons[10]	Left stick pressed button
        //     // buttons[11]	Right stick pressed button
        //     // buttons[12]	Top button in left cluster
        //     // buttons[13]	Bottom button in left cluster
        //     // buttons[14]	Right button in left cluster
        //     // buttons[15]	Left button in left cluster

        //     // axes[0]	Horizontal axis for left stick (negative left/positive right)
        //     // axes[1]	Vertical axis for left stick (negative up/positive down)
        //     // axes[2]	Horizontal axis for right stick (negative left/positive right)
        //     // axes[3]	Vertical axis for right stick (negative up/positive down)
        // },
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

 