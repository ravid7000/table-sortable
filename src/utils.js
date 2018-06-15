/*
 * table-sortable
 * version: 0.1.0
 * (c) Ravi Dhiman <ravid7000@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
*/

export function isArray(ar) {
    return Array.isArray(ar)
}

export function isObject(obj) {
    return typeof obj === 'object'
}

export function isEmpty(obj) {
    if (isArray(obj)) {
        return obj.length === 0
    } else if (isObject(obj)) {
        return Object.keys(obj).length === 0
    }
    return false;
}

export function isFunction(fn) {
    return fn instanceof Function;
}

export function isDate(date) {
    return date instanceof Date;
}

export function assign(obj, obj2) {
    return Object.assign(obj, obj2)
}

export function clone(item) {
    if (Array.isArray(item)) {
        return item.slice(0)
    }
    return JSON.parse(JSON.stringify(item))
}

export function reverse(arr) {
    if (isArray(arr)) {
        return arr.reverse()
    }
    return arr;
}

export function map(data, cb) {
    if (isArray(data) && data.length) {
        for (var i = 0; i < data.length; i++) {
            data[i] = cb(data[i], i)
        }
        return data;
    }
    return []
}

export function filter(data, cb) {
    var filterdArray = []
    if (isArray(data) && data.length) {
        for (var i = 0; i < data.length; i++) {
            if (cb(data[i], i)) {
                filterdArray.push(data[i])
            }
        }
        return filterdArray;
    }
    return filterdArray
}

export function forIn(obj, cb) {
    if (isObject(obj)) {
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            cb(obj[keys[i]], keys[i])
        }
    }
}
