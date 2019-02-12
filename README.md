# 🕹 Gamepad

The goal of Gamepad is to provide normalized behavior and a higher-level API for interacting with the web's [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API).

Using a plugin-based architecture, Gamepad provides button and axis mappings for common controllers, allowing you to easily add support for any subset of controllers.

## Installation

- CDN global utility via https://unpkg.com/@gamepad/core
- ESM via `import { GamepadEventEmitter } from '@gamepad/core'`
- CJS via `const { GamepadEventEmitter } = require('@gamepad/core')`

## Examples

**Simple**
By default, `@gamepad/core` supports any controller with a [`standard`](https://w3c.github.io/gamepad/#remapping) mapping defined on the `Gamepad.mapping` property.

```js
import { GamepadEventEmitter } from '@gamepad/core';

new GamepadEventEmitter();

window.addEventListener('gamepadbuttondown', (event) => {
    // The value of the button pressed, considering controller layout
    // Similar to `KeyboardEvent.key`
    console.log(event.detail.button);

    // The physical button pressed
    // Similar to `KeyboardEvent.code`
    console.log(event.detail.code);
})
```

**Plugins**
Without a `standard` controller mapping, `@gamepad/core` can support any controller using a plugin to map the controller's buttons and axes. Here's an example using `@gamepad/plugin-joycon`.

```js
import { GamepadEventEmitter } from '@gamepad/core';
import joycon from '@gamepad/plugin-joycon';

new GamepadEventEmitter({
    plugins: [
        joycon()
    ]
});

window.addEventListener('gamepadbuttondown', (event) => {
    console.log(event.detail.button);
    console.log(event.detail.code);
})
```