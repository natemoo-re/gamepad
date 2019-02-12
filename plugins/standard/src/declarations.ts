export interface PluginOptions {

}

export interface PluginTransformResults extends Gamepad {
    buttons: (GamepadButton & { key: string })[]
}
