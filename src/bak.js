import defaultConfig from './config'


const sortDirection = {
    ASC: 'asc',
    DESC: 'desc'
}

class TableSortable {
    constructor(options) {
        this.config = $.extend(defaultConfig, options)
        this.sortingKey = null;
        this.sortDirection = null;
        this.currentPage = 0;
        this.rowsOnPage = 5;
        this.isUpdating = false;
        this.prevScreenWidth = window.innerWidth;
        this.isPaginationGenerated = false;
        this.isDistroyed = false;
        this.table = this.constructTableObject();
        this.getOriginalData();
        this.getColumns();
        this.getPagesOffset(this.currentPage);
        this.constructControlObject();
        this.generatePagination();
        this.constructTableCell();
        this.handleSearchField();
        this.onTableResize();
        this.afterInit();
    }

    getOriginalData() {
        const { data, columns } = this.config;
        this.config.originalData = map(data, clone);
        this.config.originalColumns = clone(columns)
        this.config.originalPaginationLength = Math.abs(this.config.paginationLength)
        this.config.originalPagination = clone(this.config.pagination)
        this.config.paginationLength = Math.abs(this.config.paginationLength)
        this.config.originalShowPaginationLabel = clone(this.config.showPaginationLabel)
    }

    getConfig() {
        return this.config;
    }

    getPagesOffset(page) {
        const { data, pagination } = this.config;
        if (!data.length) return;

        if (!pagination) {
            this.leftBase = this.currentPage;
            this.rightBase = data.length;
            return;
        }

        if (pagination && !isNaN(parseInt(pagination, 10))) {
            this.rowsOnPage = Math.abs(pagination)
        }

        this.currentPage = page;
        this.leftBase = this.currentPage * this.rowsOnPage;
        this.rightBase = this.leftBase + this.rowsOnPage;
        return;
    }

    getColumns() {
        let {
            columns,
            responsive,
            paginationLength,
            pagination,
            showPaginationLabel,
            originalColumns,
            originalPaginationLength,
            originalPagination,
            originalShowPaginationLabel
        } = this.config;
        if (!responsive.length) return;

        const width = window.innerWidth;
        let defaultViewPort = true;

        for (let i = 0; i < responsive.length; i++) {
            let item = responsive[i];
            let min = item.minWidth || 0
            if (item.maxWidth && item.maxWidth > width && min < width && item.columns) {
                if (item.columns) {
                    columns = item.columns
                }
                if (item.paginationLength) {
                    paginationLength = item.paginationLength
                }
                if (item.pagination !== undefined) {
                    pagination = item.pagination
                }
                if (item.showPaginationLabel !== undefined) {
                    showPaginationLabel = item.showPaginationLabel
                }
                defaultViewPort = false
                break;
            }
        }

        if (defaultViewPort) {
            columns = assign({}, originalColumns)
            paginationLength = clone(originalPaginationLength)
            pagination = clone(originalPagination)
            showPaginationLabel = clone(originalShowPaginationLabel)
        }

        this.config.columns = columns;
        this.config.paginationLength = paginationLength;
        this.config.pagination = pagination;
        this.config.showPaginationLabel = showPaginationLabel;
    }

    generatePagination() {
        const {
            data,
            pagination,
            nextText,
            prevText,
            paginationContainer,
            paginationLength,
            showPaginationLabel
        } = this.config;
        const btnGroup = $('<div class="btn-group"></div>')
        const btnArray = []
        let rows = data.length, index = 0;
        const prevBtn = $('<button class="btn btn-default prev">Prev</button>'),
            nextBtn = $('<button class="btn btn-default next">Next</button>'),
            btnDotsLeft = $('<button class="btn btn-default" disabled="true">...</button>'),
            btnDotsRight = $('<button class="btn btn-default" disabled="true">...</button>')

        if (this.btnGroup)
            this.btnGroup.remove()

        if (!pagination) return;
        if (rows < this.rowsOnPage && !this.isPaginationGenerated) return;

        if (nextText && nextText !== '') {
            nextBtn.html(nextText)
        }

        if (prevText && prevText !== '') {
            prevBtn.html(prevText)
        }

        while(rows > 0) {
            let btn = $('<button class="btn"></button>')
            btn.text(index + 1)
            if (this.currentPage === index) {
                btn.addClass('btn-primary')
            } else {
                btn.addClass('btn-default')
            }
            btnArray.push(btn)
            rows -= this.rowsOnPage
            index += 1
        }

        btnGroup.append(prevBtn)

        if (btnArray.length > paginationLength) {
            const mid = Math.floor(paginationLength / 2)

            if (this.currentPage > mid && this.currentPage < btnArray.length - mid) {
                let l = this.currentPage - mid;
                let r = this.currentPage + (paginationLength % 2 === 0 ? mid : mid + 1);
                btnGroup.append(btnArray[0])
                btnGroup.append(btnDotsLeft)
                map(btnArray.slice(l, r), elm => {
                    btnGroup.append(elm)
                })
                btnGroup.append(btnDotsRight)
                btnGroup.append(btnArray[btnArray.length - 1])
            } else if (this.currentPage <= mid) {
                let l = 0;
                let r = paginationLength;
                map(btnArray.slice(l, r), elm => {
                    btnGroup.append(elm)
                })
                btnGroup.append(btnDotsRight)
                btnGroup.append(btnArray[btnArray.length - 1])
            } else if (this.currentPage >= btnArray.length - mid) {
                let l = btnArray.length - paginationLength;
                let r = btnArray.length;
                btnGroup.append(btnArray[0])
                btnGroup.append(btnDotsLeft)
                map(btnArray.slice(l, r), elm => {
                    btnGroup.append(elm)
                })
            }
        } else {
            map(btnArray, (elm, i) => {
                btnGroup.append(elm)
            })
        }

        map(btnArray, (elm, i) => {
            $(elm).click(() => {
                this.getPagesOffset(i)
                this.constructControlObject()
                this.generatePagination();
                this.constructTableCell();
                this.afterUpadte()
            })
        })

        btnGroup.append(nextBtn)

        if (this.currentPage === 0) {
            prevBtn.attr('disabled', true)
        } else {
            prevBtn.click(() => {
                this.getPagesOffset(this.currentPage - 1)
                this.constructControlObject()
                this.generatePagination();
                this.constructTableCell();
                this.afterUpadte()
            })
        }

        if (this.currentPage === btnArray.length - 1) {
            nextBtn.attr('disabled', true)
        } else {
            nextBtn.click(() => {
                this.getPagesOffset(this.currentPage + 1)
                this.constructControlObject()
                this.generatePagination();
                this.constructTableCell();
                this.afterUpadte()
            })
        }

        this.btnGroup = btnGroup

        if (this.controlRow) {
            if (showPaginationLabel) {
                const showLabel = '<span>Showing ' + (this.leftBase + 1) + ' to ' + this.rightBase + ' of ' + data.length + ' entries</span>';
                this.controlLeftCol.html(showLabel)
            }
            this.controlRightCol.html(this.btnGroup)
            if (paginationContainer)
                $(paginationContainer).html(this.controlRow)
            else {
                this.table.after(this.controlRow)
            }
        } else {
            if (paginationContainer)
                $(paginationContainer).html(this.btnGroup)
            else {
                this.table.after(this.btnGroup)
            }
        }

        this.isPaginationGenerated = true;
    }

    constructTableObject() {
        const { element } = this.config
        let table = ''
        if ($(element).is('table')) {
            table = $(element)
        } else {
            table = $('<table></table>')
            $(element).append(table)
        }
        table.addClass('table')
        return table;
    }

    constructControlObject() {
        const row = $('<div class="row"></div>')
        const colLeft = $('<div class="col-md-6"></div>')
        const colRight = $('<div class="col-md-6"></div>')
        colRight.css('text-align', 'right')
        row.append(colLeft)
            .append(colRight)
        this.controlRow = row;
        this.controlLeftCol = colLeft;
        this.controlRightCol = colRight;
    }

    constructTableCell() {
        const { data, columns, sorting, processHtml, columnsHtml } = this.config;

        this.table.html('');

        if (!data.length || isEmpty(columns)) return ''

        let tbody = $('<tbody class="table-body-default"></tbody>'),
            thead = $('<thead class="table-head-default"></thead>'),
            thr = $('<tr></tr>')

        forIn(columns, (value, key) => {
            let tbd = $('<th></th>')
            if (isFunction(columnsHtml)) {
                tbd.html(columnsHtml(value, key))
            } else {
                tbd.html(value)
            }
            if (sorting) {
                if (key === this.sortingKey) {
                    if (!this.sortDirection || this.sortDirection === sortDirection.ASC)
                        tbd.append('<span>▼</span>')
                    else
                        tbd.append('<span>▲</span>')
                }
                tbd.css('cursor', 'pointer')
                tbd.click(() => {
                    this.sortData(key)
                })
            }
            thr.append(tbd)
        })

        thead.append(thr)

        map(data.slice(this.leftBase, this.rightBase), (row, i) => {
            let tbr = $('<tr></tr>')
            forIn(columns, (val, key) => {
                if (row[key] !== undefined) {
                    let tbd = $('<td></td>')
                    if (isFunction(processHtml)) {
                        tbd.html(processHtml(row, key))
                    } else {
                        tbd.html(row[key])
                    }
                    tbr.append(tbd)
                }
            })
            tbody.append(tbr)
            return data;
        })

        this.table.append(thead)
        this.table.append(tbody)
    }

    onTableResize() {
        $(window).on('resize', () => {
            if (this.prevScreenWidth !== window.innerWidth) {
                this.getColumns();
                this.update();
            }
        })
    }

    sortData(sortKey) {
        const { data, dateParsing } = this.config;
        if (this.sortingKey === sortKey) {
            if (this.sortDirection === sortDirection.ASC) {
                this.config.data = data.sort((a, b) => {
                    if (dateParsing) {
                        if (sortKey.toLowerCase().indexOf('date') !== -1 || isDate(a[sortKey])) {
                            const dateA = new Date(a[sortKey])
                            const dateB = new Date(b[sortKey])
                            return dateA - dateB
                        }
                    }
                    if (a[sortKey] < b[sortKey]) return -1;
                    if(a[sortKey] > b[sortKey]) return 1;
                    return 0;
                })
                this.sortDirection = sortDirection.DESC
            } else if (this.sortDirection === sortDirection.DESC) {
                this.config.data = reverse(data.sort((a, b) => {
                    if (dateParsing) {
                        if (sortKey.toLowerCase().indexOf('date') !== -1 || isDate(a[sortKey])) {
                            const dateA = new Date(a[sortKey])
                            const dateB = new Date(b[sortKey])
                            return dateA - dateB
                        }
                    }
                    if (a[sortKey] < b[sortKey]) return -1;
                    if(a[sortKey] > b[sortKey]) return 1;
                    return 0;
                }))
                this.sortDirection = sortDirection.ASC
            }
        } else {
            this.config.data = sortBy(data, sortKey)
            this.sortDirection = sortDirection.DESC
        }
        this.sortingKey = sortKey
        this.constructTableCell();
        this.afterUpadte();
    }

    searchText(query) {
        const { originalData, columns } = this.config
        this.isUpdating = true;
        if (!query) {
            this.config.data = originalData.slice();
            return this.update();
        }
        this.config.data = filter(originalData.slice(), row => {
            let found = false;
            forIn(columns, (val, key) => {
                if (String(row[key]).toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                    found = true;
                }
            })
            return found;
        })
        return this.update();
    }

    handleSearchField() {
        const { searchField } = this.config;
        if (!searchField || !$(searchField).is('input')) return;
        $(searchField).on('keyup', e => {
            if (this.isUpdating) return false
            this.searchText(e.target.value)
        })
    }

    update() {
        if (this.isDistroyed) return;
        this.currentPage = 0;
        this.getColumns();
        this.getPagesOffset(this.currentPage);
        this.generatePagination();
        this.constructTableCell();
        this.afterUpadte();
        this.isUpdating = false;
    }

    distroy() {
        if (this.table)
            this.table.remove()

        if (this.btnGroup)
            this.btnGroup.remove()

        if (this.controlRow)
            this.controlRow.remove()

        this.isDistroyed = true;
        this.afterDistroy()
    }

    rebuild(options) {
        if (!this.isDistroyed) return;
        if (options) {
            this.config = $.extend(defaultConfig, options)
        }

        this.sortingKey = null;
        this.sortDirection = null;
        this.currentPage = 0;
        this.rowsOnPage = 5;
        this.isUpdating = false;
        this.prevScreenWidth = window.innerWidth;
        this.isPaginationGenerated = false;
        this.isDistroyed = false;
        this.table = this.constructTableObject();
        this.getOriginalData();
        this.getColumns();
        this.getPagesOffset(this.currentPage);
        this.constructControlObject();
        this.generatePagination();
        this.constructTableCell();
        this.handleSearchField();
        this.onTableResize();
        this.afterInit();
    }

    afterInit() {
        if (this.config.events && isFunction(this.config.events.onInit)) {
            this.config.events.onInit.call(this)
        }
    }

    afterUpadte() {
        if (this.config.events && isFunction(this.config.events.onUpdate)) {
            this.config.events.onUpdate.call(this)
        }
    }

    afterDistroy() {
        if (this.config.events && isFunction(this.config.events.onDistroy)) {
            this.config.events.onDistroy.call(this)
        }
    }
}

(() => {
    $.fn.tableSortable = function(options) {
        options.element = this;
        return new TableSortable(options)
    }
})()
