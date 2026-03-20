/**
 * virtualization.js
 * Row virtualization and infinite-scroll pagination engine for TableSortable.
 *
 * Provides:
 *  - computeWindow(totalRows, scrollTop, viewportHeight, rowHeight, overscan)
 *      → { startIndex, endIndex }
 *  - VirtualizationEngine class that manages windowed rendering and
 *    infinite-scroll data loading.
 */

import $ from 'jquery'
import { debounce, _isFunction } from '../utils'

/**
 * computeWindow
 * Pure utility – calculates the visible row slice given scroll position.
 *
 * @param {number} totalRows       – total number of rows in the dataset
 * @param {number} scrollTop       – current scrollTop of the scroll container
 * @param {number} viewportHeight  – visible height of the scroll container (px)
 * @param {number} rowHeight       – fixed height of a single row (px)
 * @param {number} overscan        – number of extra rows to render above/below
 * @returns {{ startIndex: number, endIndex: number }}
 */
export function computeWindow(totalRows, scrollTop, viewportHeight, rowHeight, overscan) {
    if (totalRows <= 0 || rowHeight <= 0) {
        return { startIndex: 0, endIndex: 0 }
    }

    const firstVisible = Math.floor(scrollTop / rowHeight)
    const lastVisible = Math.ceil((scrollTop + viewportHeight) / rowHeight)

    const startIndex = Math.max(0, firstVisible - overscan)
    const endIndex = Math.min(totalRows, lastVisible + overscan)

    return { startIndex, endIndex }
}

/**
 * VirtualizationEngine
 * Manages windowed rendering of a <tbody> and infinite-scroll loading.
 *
 * Usage:
 *   const engine = new VirtualizationEngine(options)
 *   engine.attach(scrollContainer, tbody)
 *   engine.update(totalRows)   // called by TableSortable after each render
 *   engine.detach()            // called on destroy
 */
export class VirtualizationEngine {
    /**
     * @param {object} opts
     * @param {number}   opts.rowHeight             – fixed row height in px (required)
     * @param {number}   [opts.overscan=5]           – extra rows to keep rendered
     * @param {number}   [opts.scrollThreshold=200]  – px from bottom to trigger load
     * @param {Function} [opts.onLoadMore]           – callback(currentPage, rowsLoaded)
     */
    constructor(opts = {}) {
        this.rowHeight = opts.rowHeight || 40
        this.overscan = opts.overscan !== undefined ? opts.overscan : 5
        this.scrollThreshold = opts.scrollThreshold !== undefined ? opts.scrollThreshold : 200
        this.onLoadMore = _isFunction(opts.onLoadMore) ? opts.onLoadMore : null

        this._scrollContainer = null
        this._tbody = null
        this._allRows = []       // jQuery row elements (full list)
        this._totalRows = 0
        this._currentPage = 0
        this._loading = false

        this._startIndex = 0
        this._endIndex = 0

        // Bound / debounced handlers stored so we can remove them later
        this._onScroll = debounce(this._handleScroll.bind(this), 50)
    }

    /**
     * attach – connect the engine to the DOM
     * @param {jQuery} scrollContainer – the element that actually scrolls
     * @param {jQuery} tbody           – the <tbody> whose rows we manage
     */
    attach(scrollContainer, tbody) {
        this._scrollContainer = scrollContainer
        this._tbody = tbody
        scrollContainer.on('scroll.virtualization', this._onScroll)
    }

    /**
     * detach – remove event listeners and release DOM references
     */
    detach() {
        if (this._scrollContainer) {
            this._scrollContainer.off('scroll.virtualization')
            this._scrollContainer = null
        }
        this._tbody = null
        this._allRows = []
    }

    /**
     * update – call this after the tbody has been (re-)populated by the normal
     * rendering path.  We snapshot the real rows, then apply windowing.
     *
     * @param {number} totalRows – total dataset row count
     */
    update(totalRows) {
        if (!this._tbody) return

        this._totalRows = totalRows

        // Snapshot real <tr> elements that the render engine just produced
        // (they are all present in the DOM at this point)
        this._allRows = this._tbody.children('tr').toArray().map(el => $(el).clone(true))

        // Apply the initial window based on current scroll position
        this._applyWindow()
    }

    // ── private ──────────────────────────────────────────────────────────────

    _handleScroll() {
        this._applyWindow()
        this._checkLoadMore()
    }

    _getScrollMetrics() {
        const el = this._scrollContainer[0]
        if (!el) return { scrollTop: 0, viewportHeight: 300 }
        return {
            scrollTop: el.scrollTop,
            viewportHeight: el.clientHeight || el.offsetHeight || 300,
        }
    }

    _applyWindow() {
        if (!this._tbody || this._allRows.length === 0) return

        const { scrollTop, viewportHeight } = this._getScrollMetrics()
        const { startIndex, endIndex } = computeWindow(
            this._allRows.length,
            scrollTop,
            viewportHeight,
            this.rowHeight,
            this.overscan
        )

        // Avoid unnecessary DOM work
        if (startIndex === this._startIndex && endIndex === this._endIndex) return
        this._startIndex = startIndex
        this._endIndex = endIndex

        this._patchTbody(startIndex, endIndex)
    }

    /**
     * _patchTbody – replace tbody contents with:
     *   top spacer  (startIndex rows worth of height)
     *   visible rows [startIndex, endIndex)
     *   bottom spacer (remaining rows worth of height)
     */
    _patchTbody(startIndex, endIndex) {
        const colCount = this._getColumnCount()
        const nodes = []

        // Top spacer
        if (startIndex > 0) {
            nodes.push(this._createSpacer(startIndex, colCount))
        }

        // Visible rows
        for (let i = startIndex; i < endIndex; i++) {
            if (this._allRows[i]) {
                nodes.push(this._allRows[i])
            }
        }

        // Bottom spacer
        const remaining = this._allRows.length - endIndex
        if (remaining > 0) {
            nodes.push(this._createSpacer(remaining, colCount))
        }

        this._tbody.empty()
        this._tbody.append(nodes)
    }

    /**
     * _createSpacer – a single <tr> with height to represent hidden rows
     */
    _createSpacer(rowCount, colCount) {
        const height = rowCount * this.rowHeight
        const td = $('<td></td>')
            .attr('colspan', colCount || 1)
            .attr('data-virtualization-spacer', rowCount)
            .css({ height: height + 'px', padding: 0, border: 0 })
        return $('<tr></tr>')
            .addClass('gs-virtual-spacer')
            .css({ height: height + 'px' })
            .append(td)
    }

    _getColumnCount() {
        if (!this._tbody) return 1
        const firstRow = this._allRows[0]
        if (!firstRow) return 1
        return firstRow.find('td').length || 1
    }

    /**
     * _checkLoadMore – fire onLoadMore when close to the bottom of the scroll
     * container.  The rowsLoaded argument is taken from _totalRows so that the
     * consumer always receives the up-to-date dataset size.
     */
    _checkLoadMore() {
        if (!this._scrollContainer || !this.onLoadMore || this._loading) return

        const el = this._scrollContainer[0]
        if (!el) return

        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
        if (distanceFromBottom <= this.scrollThreshold) {
            this._loading = true
            const result = this.onLoadMore(this._currentPage, this._totalRows)
            this._currentPage += 1
            if (result && _isFunction(result.then)) {
                result.then(newRows => {
                    this._loading = false
                }).catch(() => {
                    this._loading = false
                })
            } else {
                // Synchronous path – release the loading flag immediately so
                // that subsequent scroll events can trigger again.
                this._loading = false
            }
        }
    }
}

export default VirtualizationEngine
