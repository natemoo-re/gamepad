import * as d from './declarations';
import memoize from 'fast-memoize';

export const memoizePlugin = (plugin: d.Plugin): d.Plugin => {
    let memoized: any = {};
    for (let [key, fn] of Object.entries(plugin)) {
        memoized[key] = memoize(fn);
    }
    return memoized as d.Plugin;
}