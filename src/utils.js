export const _isArray = arr => Array.isArray(arr)

export const _isNumber = num => typeof num === 'number'

export const _isObject = obj => typeof obj === 'object'

export const _isFunction = fun => typeof fun === 'function'

export const _isString = str => typeof str === 'string'

export const _isDate = str => {
    if (Object.prototype.toString.call(str) === '[object Date]') {
        if (_isNumber(str.getTime())) {
            return true
        }
    } else if (_isString(str)) {
        const d = new Date(str)
        if (_isNumber(d.getTime())) {
            return true
        }
    }
    return false
}

export const _sort = (arr, order) => {
    return arr.sort((a, b) => {
        if (order === 'asc') {
            return parseInt(a, 10) - parseInt(b, 10)
        }
        return parseInt(b, 10) - parseInt(a, 10)
    })
}

export const _keys = obj => {
    if ('keys' in Object) {
        return Object.keys(obj)
    }
    return Object.getOwnPropertyNames(obj)
}

export const _forEach = (arr, callback) => {
    _invariant(_isArray(arr), 'ForEach requires array input')
    if (!arr.length) {
        return []
    }

    if (!_isFunction(callback)) {
        callback = () => {}
    }

    let i = 0,
        len = arr.length

    while (i < len) {
        callback(arr[i], i)
        i += 1
    }
    return arr
}

export const _invariant = (condition, format, ...rest) => {
    let error
    if (!condition) {
        const args = [...rest]
        let argIndex = 0
        error = new Error(format.replace(/%s/g, () => args[argIndex++]))
        error.name = 'TableSortable Violation'
        error.framesToPop = 1
        throw error
    }
}

export const _nativeCompare = (value, other) => {
    if (value !== other) {
        if (_isNumber(value)) {
            return parseFloat(value) > parseFloat(other) ? 1 : -1
        }

        if (_isDate(value)) {
            const d1 = new Date(value)
            const d2 = new Date(other)
            return d1.getTime() > d2.getTime() ? 1 : -1
        }

        if (_isString(value)) {
            return value > other ? 1 : -1
        }

        return 1
    }
    return 0
}

export const debounce = (func, delay) => {
    let timer
    return function() {
        const context = this
        clearTimeout(timer)
        timer = window.setTimeout(() => func.apply(context, arguments), delay)
    }
}
