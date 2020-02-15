import * as Utils from '../utils'

describe('Utils:', () => {
    test('check _isArray', () => {
        expect(Utils._isArray([])).toStrictEqual(true)
        expect(Utils._isArray(new Array(1))).toStrictEqual(true)
        expect(Utils._isArray(Array.from([]))).toStrictEqual(true)
        expect(typeof Utils._isArray).toStrictEqual('function')
        expect(Utils._isArray({})).toStrictEqual(false)
        expect(Utils._isArray(1)).toStrictEqual(false)
        expect(Utils._isArray('[]')).toStrictEqual(false)
        expect(Utils._isArray('{}')).toStrictEqual(false)
        expect(Utils._isArray()).toStrictEqual(false)
        expect(Utils._isArray(null)).toStrictEqual(false)
    })
    test('check _isNumber', () => {
        expect(Utils._isNumber(1)).toStrictEqual(true)
        expect(typeof Utils._isNumber).toStrictEqual('function')
        expect(Utils._isNumber({})).toStrictEqual(false)
        expect(Utils._isNumber('[]')).toStrictEqual(false)
        expect(Utils._isNumber('{}')).toStrictEqual(false)
        expect(Utils._isNumber()).toStrictEqual(false)
        expect(Utils._isNumber(null)).toStrictEqual(false)
    })
    test('check _isObject', () => {
        expect(Utils._isObject({})).toStrictEqual(true)
        expect(typeof Utils._isObject).toStrictEqual('function')
        expect(Utils._isObject(Object())).toStrictEqual(true)
        expect(Utils._isObject(null)).toStrictEqual(true)
        expect(Utils._isObject(Object.create(null))).toStrictEqual(true)
        expect(Utils._isObject(Object.assign({}))).toStrictEqual(true)
        expect(Utils._isObject('[]')).toStrictEqual(false)
        expect(Utils._isObject('{}')).toStrictEqual(false)
    })
    test('check _isFunction', () => {
        expect(Utils._isFunction(Function)).toStrictEqual(true)
        expect(typeof Utils._isFunction).toStrictEqual('function')
        expect(Utils._isFunction(() => {})).toStrictEqual(true)
        expect(Utils._isFunction('[]')).toStrictEqual(false)
        expect(Utils._isFunction('{}')).toStrictEqual(false)
    })
    test('check _isDate', () => {
        expect(Utils._isDate(new Date())).toStrictEqual(true)
        expect(typeof Utils._isDate).toStrictEqual('function')
        expect(Utils._isDate(() => {})).toStrictEqual(false)
        expect(Utils._isDate('')).toStrictEqual(true)
    })
    test('check _isString', () => {
        expect(Utils._isString('')).toStrictEqual(true)
        expect(typeof Utils._isString).toStrictEqual('function')
        expect(Utils._isString(() => {})).toStrictEqual(false)
        expect(Utils._isString(121)).toStrictEqual(false)
    })
    test('check _sort', () => {
        expect(Utils._sort([3, 1, 5, 19, 20], 'asc')).toStrictEqual([1, 3, 5, 19, 20])
        expect(typeof Utils._sort).toStrictEqual('function')
        expect(Utils._sort([3, 1, 5, 19, 20])).toStrictEqual([20, 19, 5, 3, 1])
        expect(Utils._sort([1])).toStrictEqual([1])
    })
    test('check _keys', () => {
        expect(Utils._keys({ a: '', b: '' })).toStrictEqual(['a', 'b'])
        expect(typeof Utils._keys).toStrictEqual('function')
        expect(Utils._keys([3, 1])).toStrictEqual(['0', '1'])
        expect(Utils._keys([1])).toStrictEqual(['0'])
    })
    test('check _forEach', () => {
        const callback = jest.fn()
        Utils._forEach([1, 2, 3, 4], callback)
        expect(callback).toHaveBeenCalledTimes(4)
        expect(typeof Utils._forEach).toStrictEqual('function')
        expect(Utils._forEach([3, 1])).toStrictEqual([3, 1])
    })
    test('check _invariant', () => {
        try {
            expect(typeof Utils._invariant).toStrictEqual('function')
            Utils._invariant(null, 'Some error occured')
        } catch (err) {
            expect('TableSortable Violation: Some error occured').toStrictEqual(
                `${err.name}: ${err.message}`
            )
        }
    })
})
