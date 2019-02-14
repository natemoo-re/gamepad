import * as d from './declarations';
import memoize from 'fast-memoize';

export const memoizePlugin = (plugin: d.Plugin): d.Plugin => {
    let memoized: any = {};
    for (let [key, fn] of Object.entries(plugin)) {
        if (typeof fn === 'function') {
            memoized[key] = memoize(fn);
        } else {
            memoized[key] = fn;
        }
    }
    return memoized as d.Plugin;
}

// export const diff = (current: T, previous: T): Partial<T> => {
//     let isDiff = false;
//     for (let [key, value] of Object.entries(current)) {
//         if (!isDiff) isDiff = (value !== previous[key]);
//     }
//     return isDiff;
// }