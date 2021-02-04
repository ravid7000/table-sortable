import * as Utils from '../utils'

class DataSet {
    _name = 'dataset'
    dataset = null
    _cachedData = null
    _datasetLen = 0
    _outLen = 10
    sortDirection = {
        ASC: 'asc',
        DESC: 'desc',
    }

    _formatError(condition, fn, msg, ...rest) {
        Utils._invariant(condition, `${this._name}.${fn} ${msg}`, ...rest)
    }

    _hasDataset() {
        this._formatError(
            this.dataset !== null,
            'data',
            'No source collection is provided. Add your collection to dataset with "dataset.fromCollection([{}])" method.'
        )
    }

    fromCollection(data) {
        this._formatError(
            Utils._isArray(data),
            'fromCollection',
            'Requires dataset to be a collection, like [{ }]'
        )
        this.dataset = data
        this._cachedData = JSON.stringify(data)
        this._datasetLen = data.length
    }

    top(len) {
        this._hasDataset()
        if (len) {
            this._formatError(Utils._isNumber(len), 'top', 'Requires length to be a number')
            return this.dataset.slice(0, len)
        }
        return this.dataset.slice(0, this._outLen)
    }

    bottom(len) {
        this._hasDataset()
        if (len) {
            this._formatError(Utils._isNumber(len), 'bottom', 'Requires length to be a number')
            len = Math.max(this._datasetLen - len, 0)
            return this.dataset.slice(len, this._datasetLen)
        }
        len = Math.max(this._datasetLen - this._outLen, 0)
        return this.dataset.slice(len, this._datasetLen)
    }

    get(from, to) {
        this._hasDataset()
        this._formatError(Utils._isNumber(from), 'get', 'Requires "from" to be a number')
        this._formatError(Utils._isNumber(to), 'get', 'Requires "to" to be a number')
        this._formatError(!(from > to), 'get', '"from" cannot be greater than "to"')
        from = Math.max(from, 0)
        to = Math.min(to, this._datasetLen)
        return this.dataset.slice(from, to)
    }

    sort(column, direction) {
        this._hasDataset()
        this._formatError(Utils._isString(column), 'sort', 'Requires "column" type of string')
        this._formatError(Utils._isString(direction), 'sort', 'Requires "direction" type of string')
        this._formatError(
            direction === 'asc' || direction === 'desc',
            'sort',
            '"%s" is invalid sort direction. Use "dataset.sortDirection.ASC" or "dataset.sortDirection.DESC".',
            direction
        )
        const head = this.top(1)[0]
        this._formatError(
            typeof head[column] !== 'undefined',
            'sort',
            'Column name "%s" does not exist in collection',
            column
        )

        if (this.sortDirection.ASC === direction) {
            this.dataset.sort(function(object, other) {
                return Utils._nativeCompare(object[column], other[column])
            })
        } else {
            this.dataset.sort(function(object, other) {
                return Utils._nativeCompare(other[column], object[column])
            })
        }
        return this.top(this._datasetLen)
    }

    pushData(data) {
        if (Utils._isArray(data)) {
            Array.prototype.push.apply(this.dataset, data)
        }
    }

    lookUp(str, columns) {
        if (Utils._isString(str) || Utils._isNumber(str)) {
            const cachedData = JSON.parse(this._cachedData)
            if (str === '') {
                this.dataset = cachedData
            } else {
                this.dataset = Utils._filter(cachedData, item =>
                    Utils.lookInObject(item, str, columns)
                )
            }
            this._datasetLen = this.dataset.length
        }
    }
}

export default DataSet
