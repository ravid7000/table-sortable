import $ from 'jquery'
import DataSet from '../DataSet'
import * as Utils from '../utils'

class TableSortable {
    _name = 'tableSortable'
    _defOptions = {
        element: '',
        data: [],
        columns: {},
        sorting: true,
        pagination: true,
        paginationContainer: null,
        rowsPerPage: 10,
        showPaginationLabel: true,
        processHtml: null,
        columnsHtml: null,
        searchField: null,
        responsive: [],
        dateParsing: true,
        generateUniqueIds: true,
        sortingIcons: {
            asc: '<span>▼</span>',
            dec: '<span>▲</span>',
        },
        nextText: '<span>Next</span>',
        prevText: '<span>Prev</span>',
        events: {
            onInit: null,
            onUpdate: null,
            onDistroy: null,
        },
    }
    _dataset = null
    _table = null
    _isMounted = false
    _isUpdating = false
    _sorting = {
        currentCol: '',
        dir: '',
    }
    _pagination = {
        currentPage: 0,
        totalPages: 0,
        visiblePageNumbers: 5,
    }

    constructor(options) {
        this.options = $.extend(this._defOptions, options)
        delete this._defOptions
        this._el = $(this.options.element)
        this.init()
    }

    _formatError(condition, fn, msg, ...rest) {
        Utils._invariant(condition, `${this._name}.${fn} ${msg}`, ...rest)
    }

    _hasRootElement() {
        this._formatError(this._el.length, 'element', '"%s" is not a valid root element', this._el)
    }

    _createTable() {
        this._table = $('<table></table>').addClass('gs-table')
    }

    _initDataset() {
        const { data } = this.options
        this._formatError(
            Utils._isArray(data),
            'data',
            'table-sortable only supports collections. Like: [{ key: value }, { key: value }]'
        )
        const dataset = new DataSet()
        dataset.fromCollection(data)
        this._dataset = dataset
    }

    _paginate() {
        const { paginationLength, rowsPerPage, pagination } = this.options
        if (!pagination) {
            return false
        }
        this._formatError(
            !paginationLength && !Utils._isNumber(paginationLength),
            'paginationLength',
            'has been deprecated, use "rowsPerPage" instead.'
        )
        this._formatError(
            rowsPerPage && Utils._isNumber(rowsPerPage),
            'rowsPerPage',
            'should be a number greater than zero.'
        )

        let totalPages = Math.round(this._dataset._datasetLen / rowsPerPage)
        if (totalPages === 0) {
            totalPages += 1
        }
        this._pagination.totalPages = totalPages
    }

    _getColumns() {
        const { columns } = this.options
        this._formatError(Utils._isObject(columns), 'columns', 'Invalid column type, see docs')
    }

    _canBeSorted(col, key) {
        const { sorting } = this.options
        let { currentCol, dir } = this._sorting
        if (!sorting) return col

        if (sorting && !Utils._isArray(sorting)) {
            col = $(col)
            col.click(e => {
                e.preventDefault()
                console.log('here')
                currentCol = 'key'
                this._sorting.currentCol = currentCol
            })
        }

        if (Utils._isArray(sorting)) {
            Utils._forEach(sorting, part => {
                if (key === part) {
                    col = $(col)
                    col.click(e => {
                        e.preventDefault()
                        console.log('here')
                        currentCol = 'key'
                        this._sorting.currentCol = currentCol
                    })
                }
            })
        }

        return col
    }

    _generateRows() {
        const { rowsPerPage, columns, columnsHtml, processHtml } = this.options
        const { currentPage } = this._pagination
        const from = currentPage * rowsPerPage
        const to = from + rowsPerPage
        const currentPageData = this._dataset.get(from, to)
        const tbody = $('<tbody class="gs-table-body-default"></tbody>')
        const thead = $('<thead class="gs-table-head-default"></thead>')
        const thr = $('<tr></tr>')
        const $cols = []
        const $rows = []
        const colKeys = Object.keys(columns)

        Utils._forEach(colKeys, (part, i) => {
            const tbd = $('<th></th>')
            let c
            if (Utils._isFunction(columnsHtml)) {
                c = columnsHtml(columns[part], part, i)
            } else {
                c = columns[part]
            }
            c = this._canBeSorted(c, part)
            tbd.html(c)
            $cols.push(tbd)
        })

        Utils._forEach(currentPageData, function(part, i) {
            const tbr = $('<tr></tr>')
            Utils._forEach(colKeys, key => {
                if (part[key] !== undefined) {
                    const tbd = $('<td></td>')
                    if (Utils._isFunction(processHtml)) {
                        tbd.html(processHtml(part, key))
                    } else {
                        tbd.html(part[key])
                    }
                    tbr.append(tbd)
                }
            })
            $rows.push(tbr)
        })

        thr.append($cols)
        thead.append(thr)
        tbody.append($rows)

        return { thead, tbody }
    }

    _generateTable(thead, tbody) {
        this._table.html('')
        this._table.append(thead)
        this._table.append(tbody)
    }

    _renderTable() {
        if (this._el.is('table')) {
            this._el.html(this._table.html())
        } else {
            this._el.append(this._table)
        }
    }

    init() {
        this._hasRootElement()
        this._initDataset()
        this._createTable()
        this._paginate()
        this._getColumns()
        const { thead, tbody } = this._generateRows()
        this._generateTable(thead, tbody)
        this._renderTable()
        this._isMounted = true
    }
}

export default TableSortable
