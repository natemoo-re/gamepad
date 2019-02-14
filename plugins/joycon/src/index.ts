import * as d from './declarations';

export default function joycon(_opts: d.PluginOptions = {}): d.Plugin {
    const buttonMap = ['A', 'X', 'B', 'Y', 'SL', 'SR', '-', '-', 'Minus', 'Plus', 'LStick', 'RStick', 'Home', 'Screenshot', 'Bumper', 'Trigger'];

    const getAxisValue = (value: number | GamepadButton[]) => {
        if (!Array.isArray(value)) {
            value = Math.round(value / (2 / 7) + 3.5) as number;
            switch (value) {
                case 8: return { x: 0, y: 0 };
                case 7: return { x: 1, y: -1 };
                case 6: return { x: 0, y: -1 };
                case 5: return { x: -1, y: -1 };
                case 4: return { x: -1, y: 0 };
                case 3: return { x: -1, y: 1 };
                case 2: return { x: 0, y: 1 };
                case 1: return { x: 1, y: 1 };
                case 0: return { x: 1, y: 0 };
            }
        }

        const [{ value: XL }, { value: XR }, { value: YT }, { value: YB }] = value as GamepadButton[];
        const x = (XR * -1) || (XL) || 0;
        const y = (YT * -1) || (YB) || 0;
        return { x, y };
    }

    const sides: Map<string, string> = new Map();
    const getSide = (id: string) => {
        let side = sides.get(id);
        if (!side) {
            side = id[id.indexOf('Joy-Con') + 9].toUpperCase();
            if (['L', 'R'].includes(side)) {
                sides.set(id, side);
            } else {
                sides.set(id, null);
            }
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

    return {
        name: 'joycon',
        enabled: (gamepad: Gamepad) => (gamepad.id.indexOf('Joy-Con') > -1),
        transform: (context: Gamepad) => {
            const mapping: 'chrome' | 'firefox' = (context.buttons.length === 20) ? 'firefox' : 'chrome';
            const side = getSide(context.id);

            let buttons: d.GamepadButtonTransform[];
            let axes: d.GamepadAxisTransform[];

            if (mapping === 'chrome') {
                buttons = context.buttons.map((value: GamepadButton, index: number) => {
                    const code = buttonMap[index];
                    const button = getButton(code, side);
                    return { button, code, value };
                });
                axes = [{ ...getAxisValue(context.axes[9]), axis: `${side}Stick` }];
            } else if (mapping === 'firefox') {
                buttons = context.buttons.slice(0, 16).map((value: GamepadButton, index: number) => {
                    const code = buttonMap[index];
                    const button = getButton(code, side);
                    return { button, code, value };
                });
                axes = [{ ...getAxisValue(context.buttons.slice(-4)), axis: `${side}Stick` }];
            }
            
            return { buttons, axes };
        }
    }
}

 