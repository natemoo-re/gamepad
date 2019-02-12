import * as d from './declarations';

class EventEmitter<T> {

    private opts: d.EventOptions;
    
    constructor(private eventName: string, opts: d.EventOptions = {}) {
        const { bubbles = true, cancelable = true, composed = true } = opts;
        this.opts = { bubbles, cancelable, composed };
    }

    emit = (detail?: T): void => {
        const { bubbles, cancelable, composed } = this.opts;
        const event = new CustomEvent<T>(this.eventName, { bubbles, cancelable, composed, detail });
        document.dispatchEvent(event);
    };

}

const buttondown = new EventEmitter<d.GamepadButtonEvent>('gamepadbuttondown');
const buttonpress = new EventEmitter<d.GamepadButtonEvent>('gamepadbuttonpress');
const buttonup = new EventEmitter<d.GamepadButtonEvent>('gamepadbuttonup');

const axischange = new EventEmitter('gamepadaxischange');

const Events = {
    buttondown,
    buttonpress,
    buttonup,
    axischange
};

export default Events;