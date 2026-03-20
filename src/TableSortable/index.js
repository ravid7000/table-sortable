/**
 * Ravi Dhiman <ravid7000@gmail.com>
 * TableSortable
 */

import $ from 'jquery'
import DataSet from '../DataSet'
import Pret from './renderEngine'
import * as Utils from '../utils'
import VirtualizationEngine from './virtualization'
import { normalizeOptions } from './options'
import './index.scss'

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
        formatCell: null,
        formatHeader: null,
        searchField: null,
        responsive: {},
        totalPages: 0,
        sortingIcons: {
            asc: '<span>▼</span>',
            desc: '<span>▲</span>',
        },
        nextText: '<span>Next</span>',
        prevText: '<span>Prev</span>',
        tableWillMount: () => {},
        tableDidMount: () => {},
        tableWillUpdate: () => {},
        tableDidUpdate: () => {},
        tableWillUnmount: () => {},
        tableDidUnmount: () => {},
        onPaginationChange: null,
        // ── Virtualization / infinite-scroll options ──────────────────────
        paginationMode: 'paginated', // 'paginated' | 'infinite-scroll'
        overscan: 5,
        rowHeight: 40,
        scrollThreshold: 200,
        onLoadMore: null,
    }
    _styles = null
    _dataset = null
    _table = null
    _thead = null
    _tbody = null
    _isMounted = false
    _isUpdating = false
    _sorting = {
        currentCol: '',
        dir: '',
    }
    _pagination = {
        elm: null,
        currentPage: 0,
        totalPages: 1,
        visiblePageNumbers: 5,
    }
    _cachedOption = null
    _cachedViewPort = -1
    _virtualization = null   // VirtualizationEngine instance (infinite-scroll mode)

    // vNode caches – used by the diff/patch system to avoid full re-renders
    _lastHeaderVNodes = null
    _lastBodyVNodes = null

    constructor(options) {
        this.options = normalizeOptions(options || {})
        this._rootElement = $(this.options.element)
        this.engine = Pret()
        this.optionDepreciation()
        this.init()
        this._debounceUpdateTable()
    }

    optionDepreciation() {
        const { options } = this
        this.logWarn(options.columnsHtml, 'columnsHtml', 'has been deprecated. Use formatHeader()')
        this.logWarn(options.processHtml, 'processHtml', 'has been deprecated. Use formatCell()')
        this.logWarn(
            options.dateParsing,
            'dateParsing',
            'has been deprecated. It is true by default.'
        )
        this.logWarn(
            options.generateUniqueIds,
            'generateUniqueIds',
            'has been deprecated. It is true by default.'
        )
        this.logWarn(
            options.showPaginationLabel,
            'showPaginationLabel',
            'has been deprecated. It is true by default.'
        )
        this.logWarn(
            options.paginationLength,
            'paginationLength',
            'has been deprecated. Use rowsPerPage'
        )
    }

    /**
     * logError
     * @param {bool} condition
     * @param {string} fn
     * @param {string} msg
     * @param  {*} rest
     */
    logError(condition, fn, msg, ...rest) {
        Utils._invariant(condition, `${this._name}.${fn} ${msg}`, ...rest)
    }

    logWarn(condition, opt, msg) {
        if (condition) {
            console.warn(`${this._name}.options.${opt} ${msg}`)
        }
    }

    emitLifeCycles(key, ...rest) {
        if (!this.options) {
            return
        }
        const { options } = this
        if (Utils._isFunction(options[key])) {
            options[key].apply(this, rest)
        }
    }

    setPage(pageNo, data) {
        this.logError(Utils._isNumber(pageNo), 'setPage', 'expect argument as number')
        const { totalPages } = this._pagination
        if (Utils._isNumber(pageNo) && Utils._inRange(pageNo, [0, totalPages])) {
            this._pagination.currentPage = pageNo
            if (data) {
                this._dataset.pushData(data)
            }
            this.updateTable()
        }
    }

    updateRowsPerPage(rowsPerPage) {
        this.logError(
            Utils._isNumber(rowsPerPage),
            'updateRowsPerPage',
            'expect argument as number'
        )
        if (rowsPerPage) {
            this._pagination.currentPage = 0 // Reset pagination
            this.options.rowsPerPage = rowsPerPage
            this.updateTable()
        }
    }

    lookUp(val, cols = []) {
        const { columns } = this.options
        this.logError(
            cols && Utils._isArray(cols),
            'lookUp',
            'second argument must be array of keys'
        )
        if (!cols.length) {
            cols = columns
        }
        this._pagination.currentPage = 0
        this._dataset.lookUp(val, Utils._keys(cols))
        this.debounceUpdateTable()
    }

    _bindSearchField() {
        const self = this
        const { searchField } = this.options
        if (!searchField) {
            return
        }
        const field = $(searchField)
        this.logError(
            field.length,
            'searchField',
            '"%s" is not a valid DOM element or string',
            field
        )
        field.on('input', function() {
            const val = $(this).val()
            self.lookUp(val)
        })
        this.options.searchField = field
    }

    /**
     * _validateRootElement
     */
    _validateRootElement() {
        this.logError(
            this._rootElement.length,
            'element',
            '"%s" is not a valid root element',
            this._rootElement
        )
    }

    /**
     * _createTable
     */
    _createTable() {
        const { tableClassName } = this.options
        this._table = $('<table></table>').addClass('table gs-table')
        if (tableClassName) {
            this._table.addClass(tableClassName)
        }
    }

    /**
     * _initDataset
     */
    _initDataset() {
        const { data } = this.options
        this.logError(
            Utils._isArray(data),
            'data',
            'table-sortable only supports collections. Like: [{ key: value }, { key: value }]'
        )
        const dataset = new DataSet()
        dataset.fromCollection(data)
        this._dataset = dataset
    }

    /**
     * _validateColumns
     */
    _validateColumns() {
        const { columns } = this.options
        this.logError(Utils._isObject(columns), 'columns', 'Invalid column type, see docs')
    }

    sortData(column) {
        let { dir, currentCol } = this._sorting
        if (column !== currentCol) {
            dir = ''
        }
        if (!dir) {
            dir = this._dataset.sortDirection.ASC
        } else if (dir === this._dataset.sortDirection.ASC) {
            dir = this._dataset.sortDirection.DESC
        } else if (dir === this._dataset.sortDirection.DESC) {
            dir = this._dataset.sortDirection.ASC
        }
        currentCol = column
        this._sorting = {
            dir,
            currentCol,
        }
        this._dataset.sort(currentCol, dir)
        this.updateCellHeader()
    }

    /**
     * _addColSorting
     * @param {[]} col
     * @param {string} key
     * @return {{ col }}
     */
    _addColSorting(col, key) {
        const { sorting } = this.options
        const self = this
        if (!sorting) return col

        if (sorting && !Utils._isArray(sorting)) {
            col = $(col)
            col.attr('role', 'button')
            col.addClass('gs-button')
            if (key === this._sorting.currentCol && this._sorting.dir) {
                col.append(this.options.sortingIcons[this._sorting.dir])
            }
            col.click(function(e) {
                self.sortData(key)
            })
        }

        if (Utils._isArray(sorting)) {
            Utils._forEach(sorting, part => {
                if (key === part) {
                    col = $(col)
                    col.attr('role', 'button')
                    col.addClass('gs-button')
                    if (key === this._sorting.currentCol && this._sorting.dir) {
                        col.append(this.options.sortingIcons[this._sorting.dir])
                    }
                    col.click(function(e) {
                        self.sortData(key)
                    })
                }
            })
        }

        return col
    }

    /**
     * getCurrentPageIndex
     * @returns {{ from: Number, to: Number? }} obj
     */
    getCurrentPageIndex() {
        const { _datasetLen } = this._dataset
        const { pagination, rowsPerPage, paginationMode } = this.options
        const { currentPage } = this._pagination // current page in pagination

        // In infinite-scroll mode show all rows (no pagination slicing)
        if (paginationMode === 'infinite-scroll') {
            return { from: 0 }
        }

        if (!pagination) {
            return {
                from: 0,
            }
        }
        let from = currentPage * rowsPerPage // list start index
        const to = Math.min(from + rowsPerPage, _datasetLen)
        from = Math.min(from, to)
        return {
            from,
            to,
        }
    }

    /**
     * _resolveNoDataTemplate
     * @returns {string} HTML string for the empty-state row.
     */
    _resolveNoDataTemplate() {
        const { noDataTemplate, columns } = this.options
        const colSpan = Utils._keys(columns).length || 1
        let content = '<em>No data available</em>'
        if (Utils._isFunction(noDataTemplate)) {
            content = noDataTemplate()
        } else if (Utils._isString(noDataTemplate) && noDataTemplate) {
            content = noDataTemplate
        }
        return `<tr><td colspan="${colSpan}" class="gs-no-data">${content}</td></tr>`
    }

    // -----------------------------------------------------------------------
    // vNode builders – produce the virtual representation that will be
    // compared against the previous render to compute the minimal diff.
    // -----------------------------------------------------------------------

    /**
     * _buildHeaderVNodes
     * Builds the list of vNodes representing the single header <tr>.
     * Returns an array with one element (the <tr> vNode).
     */
    _buildHeaderVNodes() {
        const { columns, formatHeader, headerRenderers } = this.options
        const colKeys = Utils._keys(columns)
        const cols = []

        Utils._forEach(colKeys, (part, i) => {
            let c = columns[part]

            // headerRenderers take priority per-column
            if (headerRenderers && Utils._isFunction(headerRenderers[part])) {
                c = headerRenderers[part](columns[part])
            } else if (Utils._isFunction(formatHeader)) {
                c = formatHeader(columns[part], part, i)
            }

            c = this._addColSorting($('<span></span>').html(c), part)
            cols.push(this.engine.createVNode('th', { html: c }))
        })

        return [this.engine.createVNode('tr', null, cols)]
    }

    /**
     * _buildBodyVNodes
     * Builds the list of vNodes representing each data <tr> row.
     * Returns null when there is no data (signals empty-state to _renderBody).
     */
    _buildBodyVNodes() {
        const engine = this.engine
        const { columns, formatCell, cellRenderers, rowClassFn } = this.options
        const { from, to } = this.getCurrentPageIndex()

        let currentPageData = []
        if (to === undefined) {
            currentPageData = this._dataset.top()
        } else {
            currentPageData = this._dataset.get(from, to)
        }

        // Signal empty-state to _renderBody
        if (!currentPageData || currentPageData.length === 0) {
            return null
        }

        const colKeys = Utils._keys(columns)
        const rows = []

        Utils._forEach(currentPageData, function(part, i) {
            const cols = []
            Utils._forEach(colKeys, key => {
                if (part[key] !== undefined) {
                    let tbd
                    // cellRenderers take priority per-column
                    if (cellRenderers && Utils._isFunction(cellRenderers[key])) {
                        tbd = engine.createVNode('td', { html: cellRenderers[key](part[key], part) })
                    } else if (Utils._isFunction(formatCell)) {
                        tbd = engine.createVNode('td', { html: formatCell(part, key) })
                    } else {
                        tbd = engine.createVNode('td', { html: part[key] })
                    }
                    cols.push(tbd)
                }
            })

            // Compute row class
            let rowClass = null
            if (Utils._isFunction(rowClassFn)) {
                rowClass = rowClassFn(part, i)
            }

            const rowAttrs = rowClass ? { className: rowClass } : null
            rows.push(engine.createVNode('tr', rowAttrs, cols))
        })
        const result = engine.render(rows, parentElm)

        // ── Infinite-scroll: hand off to VirtualizationEngine ────────────
        if (this.options.paginationMode === 'infinite-scroll' && this._virtualization) {
            this._virtualization.update(this._dataset._datasetLen)
        }

        return result
    }

    // -----------------------------------------------------------------------
    // Rendering helpers
    // -----------------------------------------------------------------------

    /**
     * _renderHeader
     * On first call (no parentElm) performs a full render into a new <thead>.
     * On subsequent calls uses diff + patch for incremental updates.
     */
    _renderHeader(parentElm) {
        const newVNodes = this._buildHeaderVNodes()

        if (!parentElm) {
            // Initial render – full build
            parentElm = $('<thead class="gs-table-head"></thead>')
            this.engine.render(newVNodes, parentElm)
            this._lastHeaderVNodes = newVNodes
        } else {
            // Incremental update via diff + patch
            const patches = this.engine.diff(this._lastHeaderVNodes || [], newVNodes)
            this.engine.patch(parentElm, patches)
            this._lastHeaderVNodes = newVNodes
        }

        // Apply sticky header if requested
        const { stickyHeader } = this.options
        if (stickyHeader) {
            parentElm.addClass('gs-sticky-header')
        } else {
            parentElm.removeClass('gs-sticky-header')
        }

        return parentElm
    }

    /**
     * _renderColGroup
     * Builds and inserts a <colgroup> into the table when columnWidths are set.
     */
    _renderColGroup() {
        const { columns, columnWidths } = this.options
        if (!columnWidths || Utils._keys(columnWidths).length === 0) {
            return
        }
        const colKeys = Utils._keys(columns)
        const colgroup = this.engine.renderColGroup(colKeys, columnWidths)
        if (colgroup) {
            // Remove any existing colgroup first
            this._table.find('colgroup').remove()
            this._table.prepend(colgroup)
        }
    }

    /**
     * _renderBody
     * On first call (no parentElm) performs a full render into a new <tbody>.
     * On subsequent calls uses diff + patch for incremental updates.
     */
    _renderBody(parentElm) {
        const { onRowClick } = this.options
        const newVNodes = this._buildBodyVNodes()

        if (!parentElm) {
            // Initial render – full build
            parentElm = $('<tbody class="gs-table-body"></tbody>')
        }

        // Handle empty-state
        if (!newVNodes) {
            parentElm.empty().html(this._resolveNoDataTemplate())
            this._lastBodyVNodes = []
            return parentElm
        }

        if (!this._lastBodyVNodes) {
            this.engine.render(newVNodes, parentElm)
        } else {
            // Incremental update via diff + patch
            const patches = this.engine.diff(this._lastBodyVNodes, newVNodes)
            this.engine.patch(parentElm, patches)
        }
        this._lastBodyVNodes = newVNodes

        // Bind onRowClick handlers
        if (Utils._isFunction(onRowClick)) {
            const { from, to } = this.getCurrentPageIndex()
            const currentPageData = to === undefined
                ? this._dataset.top()
                : this._dataset.get(from, to)
            const trElements = parentElm.find('tr')
            currentPageData.forEach(function(rowData, idx) {
                $(trElements[idx]).off('click').on('click', function(e) {
                    onRowClick(rowData, idx, e)
                })
            })
        }

        return parentElm
    }

    /**
     * _createCells
     * @returns {{ thead: [], tbody: [] }}
     */
    _createCells() {
        const thead = this._renderHeader()
        const tbody = this._renderBody()
        return { thead, tbody }
    }

    onPaginationBtnClick(dir, currPage) {
        let { totalPages, currentPage } = this._pagination
        const { onPaginationChange } = this.options
        if (dir === 'up') {
            if (currentPage < totalPages - 1) {
                currentPage += 1
            }
        } else if (dir === 'down') {
            if (currentPage >= 0) {
                currentPage -= 1
            }
        }
        const setPage = pageNo => this.setPage(pageNo)
        if (Utils._isFunction(onPaginationChange)) {
            const cp = !isNaN(currPage) ? currPage : currentPage
            onPaginationChange.apply(this, [cp, setPage])
        } else {
            if (currPage !== undefined) {
                this._pagination.currentPage = currPage
            } else {
                this._pagination.currentPage = currentPage
            }
            this.updateTable()
        }
    }

    renderPagination(parentElm) {
        const self = this
        const engine = this.engine
        const { pagination, paginationContainer, prevText, nextText } = this.options
        const { currentPage, totalPages, visiblePageNumbers } = this._pagination
        const visiblePages = Math.min(totalPages, visiblePageNumbers)
        let visibleLeft = 0
        let visibleRight = Math.min(totalPages, visibleLeft + visiblePages)
        if (currentPage > visiblePages / 2 && currentPage < totalPages - visiblePages / 2) {
            visibleLeft = currentPage - Math.floor(visiblePages / 2)
            visibleRight = Math.min(totalPages, visibleLeft + visiblePages)
        } else if (currentPage > totalPages - visiblePages / 2) {
            visibleLeft = totalPages - visiblePages
            visibleRight = totalPages
        }
        if (!parentElm) {
            parentElm = $('<div class="gs-pagination"></div>')
            if ($(paginationContainer).length) {
                $(paginationContainer).append(parentElm)
            } else {
                this._table.after(parentElm)
            }
        }

        if (!pagination) {
            return parentElm
        }

        const buttons = []
        const prevBtn = engine.createElement('button', {
            className: 'btn btn-default',
            html: prevText,
            disabled: currentPage === 0,
            onClick: () => self.onPaginationBtnClick('down'),
        })
        buttons.push(prevBtn)
        const btnDots = engine.createElement('button', {
            className: 'btn btn-default',
            disabled: true,
            text: '...',
        })

        if (currentPage > visiblePages / 2) {
            buttons.push(btnDots)
        }

        let i = visibleLeft
        while (i < visibleRight) {
            const btn = engine.createElement('button', {
                className: currentPage === i ? 'btn btn-primary active' : 'btn btn-default',
                onClick: function() {
                    let currPage = parseInt($(this).attr('data-page'), 10)
                    if (Number.isNaN(currPage)) {
                        currPage = parseInt($(this).text() - 1)
                    }
                    self.onPaginationBtnClick(null, currPage)
                },
                text: i + 1,
                'data-page': i,
            })
            buttons.push(btn)
            i += 1
        }

        if (currentPage < totalPages - visiblePages / 2) {
            buttons.push(btnDots)
        }

        const nextBtn = engine.createElement('button', {
            className: 'btn btn-default',
            html: nextText,
            disabled: currentPage >= totalPages - 1,
            onClick: () => self.onPaginationBtnClick('up'),
        })
        buttons.push(nextBtn)
        parentElm.append(buttons)
        const { from, to } = this.getCurrentPageIndex()
        const showLabel = engine.createElement('span', {
            text: `Showing ${Math.min(to, from + 1)} to ${to} of ${this._dataset._datasetLen} rows`,
        })
        const pageColLeft = engine.createElement(
            'div',
            {
                className: 'col-md-6',
            },
            showLabel
        )
        const btnWrapper = engine.createElement(
            'div',
            {
                className: 'btn-group d-flex justify-content-end',
            },
            buttons
        )
        const pageColRight = engine.createElement(
            'div',
            {
                className: 'col-md-6',
            },
            btnWrapper
        )
        const pageRow = engine.createElement(
            'div',
            {
                className: 'row',
            },
            [pageColLeft, pageColRight]
        )
        return engine.render(pageRow, parentElm)
    }

    createPagination() {
        const { rowsPerPage, pagination, totalPages, paginationMode } = this.options

        // In infinite-scroll mode pagination buttons are hidden
        if (paginationMode === 'infinite-scroll') {
            if (this._pagination.elm) {
                this._pagination.elm.hide()
            }
            return false
        }

        if (!pagination) {
            return false
        }

        this.logError(
            rowsPerPage && Utils._isNumber(rowsPerPage),
            'rowsPerPage',
            'should be a number greater than zero.'
        )

        this.logError(
            Utils._isNumber(totalPages),
            'totalPages',
            'should be a number greater than zero.'
        )

        let totalP = totalPages ? totalPages : Math.ceil(this._dataset._datasetLen / rowsPerPage)
        if (0 >= totalP) {
            totalP = 1
        }
        this._pagination.totalPages = totalP
        if (this._pagination.elm) {
            this.renderPagination(this._pagination.elm)
        } else {
            this._pagination.elm = this.renderPagination()
        }
    }

    /**
     * _generateTable
     * @param {[]]} thead
     * @param {[]} tbody
     */
    _generateTable(thead, tbody) {
        this._table.html('')
        this._table.append(thead)
        this._table.append(tbody)
        this._thead = thead
        this._tbody = tbody
    }

    /**
     * _renderTable
     */
    _renderTable() {
        if (this._rootElement.is('table')) {
            this._rootElement.html(this._table.html())
        } else {
            const div = this.engine.createElement('div', {
                className: 'gs-table-container',
                append: this._table,
            })
            this._rootElement = this.engine.render(div, this._rootElement)
        }
    }

    _initStyles() {
        const { responsive } = this.options
        if (responsive) {
            return
        }
        const css =
            '.gs-table-container .table{table-layout:fixed}@media(max-width:767px){.gs-table-container{overflow:auto;max-width:100%}}'
        const style = $('<style></style>')
        style.attr('id', 'gs-table')
        style.html(css)
        $('head').append(style)
        this._styles = style
    }

    /**
     * _initVirtualization
     * Set up the VirtualizationEngine when paginationMode === 'infinite-scroll'.
     */
    _initVirtualization() {
        const { paginationMode, rowHeight, overscan, scrollThreshold, onLoadMore } = this.options

        if (paginationMode !== 'infinite-scroll') {
            return
        }

        // Tear down any existing engine first
        if (this._virtualization) {
            this._virtualization.detach()
        }

        this._virtualization = new VirtualizationEngine({
            rowHeight,
            overscan,
            scrollThreshold,
            onLoadMore: Utils._isFunction(onLoadMore)
                ? (page, rowsLoaded) => {
                      const result = onLoadMore(page, rowsLoaded)
                      if (result && Utils._isFunction(result.then)) {
                          return result.then(newRows => {
                              if (Array.isArray(newRows) && newRows.length) {
                                  this._dataset.pushData(newRows)
                                  this.updateTable()
                              }
                          })
                      }
                  }
                : null,
        })

        // The scroll container is the gs-table-container div (or the root element)
        const scrollContainer = this._rootElement.find('.gs-table-container')
        const container = scrollContainer.length ? scrollContainer : this._rootElement

        // Make the container scrollable if not already
        if (container.css('overflow-y') === 'visible' || !container.css('overflow-y')) {
            container.css({ 'overflow-y': 'auto', position: 'relative' })
        }

        this._virtualization.attach(container, this._tbody)
        // Perform the initial window calculation now that the tbody is populated
        this._virtualization.update(this._dataset._datasetLen)
    }

    /**
     * init
     * @description Initial rendering
     */
    init() {
        this.emitLifeCycles('tableWillMount')
        this._validateRootElement()
        this._initDataset()
        this._createTable()
        this._validateColumns()
        const { thead, tbody } = this._createCells()
        this._generateTable(thead, tbody)
        this._renderColGroup()
        this._renderTable()
        this.createPagination()
        this._bindSearchField()
        this._initStyles()
        this._initVirtualization()
        this._isMounted = true
        this.emitLifeCycles('tableDidMount')
        if (this._cachedViewPort === -1) {
            this.resizeSideEffect()
        }
    }

    /**
     * Updation phase
     * 1. When clicked on sorting
     * 2. When clicked on pagination
     * 3. When external data changed
     *
     * Uses diff + patch so only changed rows are mutated in the DOM.
     */

    _debounceUpdateTable() {
        this.debounceUpdateTable = Utils.debounce(this.updateTable, 400)
    }

    updateTable() {
        if (this._isUpdating) {
            return
        }

        this.emitLifeCycles('tableWillUpdate')
        this._isUpdating = true
        this._renderHeader(this._thead)
        this._renderBody(this._tbody)
        this._renderColGroup()
        this.createPagination()
        this._isUpdating = false
        this.emitLifeCycles('tableDidUpdate')
    }

    updateCellHeader() {
        if (this._isUpdating) {
            return
        }

        this._isUpdating = true
        this.emitLifeCycles('tableWillUpdate')
        this._renderHeader(this._thead)
        this._renderBody(this._tbody)
        this._renderColGroup()
        this._isUpdating = false
        this.emitLifeCycles('tableDidUpdate')
    }

    resizeSideEffect() {
        const mkRes = Utils.debounce(this.makeResponsive, 500)
        window.addEventListener('resize', mkRes.bind(this))
        this.makeResponsive()
    }

    makeResponsive() {
        const { responsive } = this.options
        const { innerWidth } = window
        const keys = Utils._sort(Utils._keys(responsive), 'desc')
        let minPort

        this.logError(
            Utils._isObject(responsive),
            'responsive',
            'Invalid type of responsive option provided: "%s"',
            responsive
        )

        Utils._forEach(keys, viewPort => {
            if (parseInt(viewPort, 10) > innerWidth) {
                minPort = viewPort
            }
        })

        if (this._cachedViewPort === minPort) {
            return
        }
        this._cachedViewPort = minPort
        const resOptions = responsive[minPort]
        if (Utils._isObject(resOptions)) {
            if (!this._cachedOption) {
                this._cachedOption = $.extend({}, this.options)
            }
            this.options = $.extend(this.options, resOptions)
            this.refresh()
        } else if (this._cachedOption) {
            this.options = $.extend({}, this._cachedOption)
            this._cachedOption = null
            this._cachedViewPort = -1
            this.refresh()
        }
        return
    }

    /**
     * public APIs
     */
    setData = (data, columns, pushData) => {
        this.logError(Utils._isArray(data), 'setData', 'expect first argument as array of objects')
        this.logError(Utils._isObject(columns), 'setData', 'expect second argument as objects')
        if (this._isMounted && data) {
            if (pushData) {
                this._dataset.pushData(data)
            } else {
                this._dataset.fromCollection(data)
            }
            if (columns) {
                this.options.columns = columns
            }
            // Reset vNode caches so next render does a clean diff from scratch
            this._lastHeaderVNodes = null
            this._lastBodyVNodes = null
            this.refresh()
        }
    }

    /**
     * getData
     * @returns {[{}]}
     */
    getData = () => {
        if (this._isMounted) {
            return this._dataset.top()
        }
        return []
    }

    /**
     * getCurrentPageData
     * @returns {[{}]}
     */
    getCurrentPageData = () => {
        if (this._isMounted) {
            const { rowsPerPage } = this.options
            const { currentPage } = this._pagination
            const from = currentPage * rowsPerPage
            const to = from + rowsPerPage
            return this._dataset.get(from, to)
        }
        return []
    }

    /**
     * refresh
     * @description This method will distroy and create a fresh table.
     * @param {boolean?} hardRefresh
     */
    refresh = hardRefresh => {
        if (hardRefresh) {
            this.distroy()
            this.create()
        } else if (this._isMounted) {
            this.updateTable()
        }
    }

    /**
     * distroy
     * @description This method will distroy table.
     */
    distroy = () => {
        if (this._isMounted) {
            this.emitLifeCycles('tableWillUnmount')

            // Detach virtualization engine if active
            if (this._virtualization) {
                this._virtualization.detach()
                this._virtualization = null
            }

            this._table.remove()
            if (this._styles && this._styles.length) {
                this._styles.remove()
                this._styles = null
            }
            this._dataset = null
            this._table = null
            this._thead = null
            this._tbody = null
            if (this._pagination.elm) {
                this._pagination.elm.remove()
            }
            this._pagination = {
                elm: null,
                currentPage: 0,
                totalPages: 0,
                visiblePageNumbers: 5,
            }
            this._isMounted = false
            this._isUpdating = false
            this._sorting = {
                currentCol: '',
                dir: '',
            }
            this._cachedViewPort = -1
            this._cachedOption = null
            // Reset vNode caches
            this._lastHeaderVNodes = null
            this._lastBodyVNodes = null
            this.emitLifeCycles('tableDidUnmount')
        }
    }

    /**
     * create
     * @description This method will create a fresh table.
     */
    create = () => {
        if (!this._isMounted) {
            this.init()
        }
    }
}

if (process.env.NODE_ENV === 'production') {
    window.Pret = Pret()
    window.TableSortable = TableSortable
    window.DataSet = DataSet
    ;(function($) {
        $.fn.tableSortable = function(options) {
            options.element = $(this)
            return new window.TableSortable(options)
        }
        // eslint-disable-next-line no-undef
    })(jQuery)
}

export default TableSortable
