/*
 * table-sortable
 * version: 0.1.0
 * (c) Ravi Dhiman <ravid7000@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
*/

/* eslint no-use-before-define: 0 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
    if (val === null || val === undefined) {
        throw new TypeError('Object.assign cannot be called with null or undefined');
    }

    return Object(val);
}

function shouldUseNative() {
    try {
        if (!Object.assign) {
            return false;
        }

        var test1 = new String('abc'); // eslint-disable-line no-new-wrappers
        test1[5] = 'de';
        if (Object.getOwnPropertyNames(test1)[0] === '5') {
            return false;
        }

        var test2 = {};
        for (var i = 0; i < 10; i++) {
            test2['_' + String.fromCharCode(i)] = i;
        }
        var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
            return test2[n];
        });
        if (order2.join('') !== '0123456789') {
            return false;
        }

        var test3 = {};
        'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
            test3[letter] = letter;
        });
        if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
            return false;
        }

        return true;
    } catch (err) {
        return false;
    }
}

var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
    var from;
    var to = toObject(target);
    var symbols;

    for (var s = 1; s < arguments.length; s++) {
        from = Object(arguments[s]);

        for (var key in from) {
            if (hasOwnProperty.call(from, key)) {
                to[key] = from[key];
            }
        }

        if (getOwnPropertySymbols) {
            symbols = getOwnPropertySymbols(from);
            for (var i = 0; i < symbols.length; i++) {
                if (propIsEnumerable.call(from, symbols[i])) {
                    to[symbols[i]] = from[symbols[i]];
                }
            }
        }
    }

    return to;
};

function uniqueId(num) {
    if (num)
        return '_' + Math.random().toString(36).substr(2, num)
    return '_' + Math.random().toString(36).substr(2, 9)
}

function isArray(ar) {
    return Array.isArray(ar);
}

function isObject(obj) {
    return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object';
}

function isEmpty(obj) {
    if (isArray(obj)) {
        return obj.length === 0;
    } else if (isObject(obj)) {
        return Object.keys(obj).length === 0;
    }
    return false;
}

function isFunction(fn) {
    return fn instanceof Function;
}

function isDate(date) {
    return date instanceof Date;
}

function assign(obj, obj2) {
    return objectAssign(obj, obj2);
}

function clone(item) {
    if (Array.isArray(item)) {
        return item.slice(0);
    }
    return JSON.parse(JSON.stringify(item));
}

function reverse(arr) {
    if (isArray(arr)) {
        return arr.reverse();
    }
    return arr;
}

function map(data, cb) {
    if (isArray(data) && data.length) {
        for (var i = 0; i < data.length; i++) {
            data[i] = cb(data[i], i);
        }
        return data;
    }
    return [];
}

function filter(data, cb) {
    var filterdArray = [];
    if (isArray(data) && data.length) {
        for (var i = 0; i < data.length; i++) {
            if (cb(data[i], i)) {
                filterdArray.push(data[i]);
            }
        }
        return filterdArray;
    }
    return filterdArray;
}

function forIn(obj, cb) {
    var data = []
    if (isObject(obj)) {
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            data.push(cb(obj[keys[i]], keys[i], i));
        }
    }
    return data;
}

var sortDirection = {
    ASC: 'asc',
    DESC: 'desc'
};

var defaultConfig = {
    element: '',
    data: [],
    columns: [],
    sorting: true,
    pagination: true,
    paginationContainer: null,
    paginationLength: 5,
    showPaginationLabel: true,
    processHtml: null,
    columnsHtml: null,
    searchField: null,
    responsive: [],
    dateParsing: true,
    generateUniqueIds: true,
    sortingIcons: {
        asc: '<span>▼</span>',
        dec: '<span>▲</span>'
    },
    nextText: '<span>Next</span>',
    prevText: '<span>Prev</span>',
    events: {
        onInit: null,
        onUpdate: null,
        onDistroy: null
    }
};

var TableSortable = function () {
    function TableSortable(options) {
        _classCallCheck(this, TableSortable);

        this.config = $.extend(defaultConfig, options);
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

    _createClass(TableSortable, [{
        key: 'getOriginalData',
        value: function getOriginalData() {
            var _config = this.config,
                data = _config.data,
                columns = _config.columns,
                generateUniqueIds = _config.generateUniqueIds;

            if (generateUniqueIds)
                if (generateUniqueIds === 'number')
                    data = map(data, function(d, i) {
                        d['_gsUniqueId'] = i;
                        return d;
                    })
                else
                    data = map(data, function(d) {
                        d['_gsUniqueId'] = uniqueId();
                        return d;
                    })

            this.config.data = data;
            this.config.originalData = map(data, clone);
            this.config.originalColumns = clone(columns);
            this.config.originalPaginationLength = Math.abs(this.config.paginationLength);
            this.config.originalPagination = clone(this.config.pagination);
            this.config.paginationLength = Math.abs(this.config.paginationLength);
            this.config.originalShowPaginationLabel = clone(this.config.showPaginationLabel);
        }
    }, {
        key: 'getConfig',
        value: function getConfig() {
            return this.config;
        }
    }, {
        key: 'getData',
        value: function getData() {
            return this.config.originalData;
        }
    }, {
        key: 'getPagesOffset',
        value: function getPagesOffset(page) {
            var _config2 = this.config,
                data = _config2.data,
                pagination = _config2.pagination;

            if (!data.length) return;

            if (!pagination) {
                this.leftBase = this.currentPage;
                this.rightBase = data.length;
                return;
            }

            if (pagination && !isNaN(parseInt(pagination, 10))) {
                this.rowsOnPage = Math.abs(pagination);
            }

            this.currentPage = page;
            this.leftBase = this.currentPage * this.rowsOnPage;
            this.rightBase = Math.min(this.leftBase + this.rowsOnPage, data.length);
            return this.currentPage;
        }
    }, {
        key: 'getColumns',
        value: function getColumns() {
            var _config3 = this.config,
                columns = _config3.columns,
                responsive = _config3.responsive,
                paginationLength = _config3.paginationLength,
                pagination = _config3.pagination,
                showPaginationLabel = _config3.showPaginationLabel,
                originalColumns = _config3.originalColumns,
                originalPaginationLength = _config3.originalPaginationLength,
                originalPagination = _config3.originalPagination,
                originalShowPaginationLabel = _config3.originalShowPaginationLabel;

            if (!responsive.length) return;

            var width = window.innerWidth;
            var defaultViewPort = true;

            for (var i = 0; i < responsive.length; i++) {
                var item = responsive[i];
                var min = item.minWidth || 0;
                if (item.maxWidth && item.maxWidth > width && min < width && item.columns) {
                    if (item.columns) {
                        columns = item.columns;
                    }
                    if (item.paginationLength) {
                        paginationLength = item.paginationLength;
                    }
                    if (item.pagination !== undefined) {
                        pagination = item.pagination;
                    }
                    if (item.showPaginationLabel !== undefined) {
                        showPaginationLabel = item.showPaginationLabel;
                    }
                    defaultViewPort = false;
                    break;
                }
            }

            if (defaultViewPort) {
                columns = assign({}, originalColumns);
                paginationLength = clone(originalPaginationLength);
                pagination = clone(originalPagination);
                showPaginationLabel = clone(originalShowPaginationLabel);
            }

            this.config.columns = columns;
            this.config.paginationLength = paginationLength;
            this.config.pagination = pagination;
            this.config.showPaginationLabel = showPaginationLabel;
        }
    }, {
        key: 'generatePagination',
        value: function generatePagination() {
            var _this = this;

            var _config4 = this.config,
                data = _config4.data,
                pagination = _config4.pagination,
                nextText = _config4.nextText,
                prevText = _config4.prevText,
                paginationContainer = _config4.paginationContainer,
                paginationLength = _config4.paginationLength,
                showPaginationLabel = _config4.showPaginationLabel;

            var btnGroup = $('<div class="btn-group"></div>');
            var btnArray = [];
            var rows = data.length,
                index = 0;
            var prevBtn = $('<button class="btn btn-default prev">Prev</button>'),
                nextBtn = $('<button class="btn btn-default next">Next</button>'),
                btnDotsLeft = $('<button class="btn btn-default" disabled="true">...</button>'),
                btnDotsRight = $('<button class="btn btn-default" disabled="true">...</button>');

            if (this.btnGroup) this.btnGroup.remove();

            if (!pagination) return;
            if (rows < this.rowsOnPage && !this.isPaginationGenerated) return;

            if (nextText && nextText !== '') {
                nextBtn.html(nextText);
            }

            if (prevText && prevText !== '') {
                prevBtn.html(prevText);
            }

            while (rows > 0) {
                var btn = $('<button class="btn"></button>');
                btn.text(index + 1);
                if (this.currentPage === index) {
                    btn.addClass('btn-primary');
                } else {
                    btn.addClass('btn-default');
                }
                btn.attr('data-to', index)
                btnArray.push(btn);
                rows -= this.rowsOnPage;
                index += 1;
            }

            btnGroup.append(prevBtn);

            if (btnArray.length > paginationLength) {
                var mid = Math.floor(paginationLength / 2);

                if (this.currentPage > mid && this.currentPage < btnArray.length - mid) {
                    var l = this.currentPage - mid;
                    var r = this.currentPage + (paginationLength % 2 === 0 ? mid : mid + 1);
                    btnGroup.append(btnArray[0]);
                    btnGroup.append(btnDotsLeft);
                    map(btnArray.slice(l, r), function (elm) {
                        btnGroup.append(elm);
                        return elm
                    });
                    btnGroup.append(btnDotsRight);
                    btnGroup.append(btnArray[btnArray.length - 1]);
                } else if (this.currentPage <= mid) {
                    var _l = 0;
                    var _r = paginationLength;
                    map(btnArray.slice(_l, _r), function (elm) {
                        btnGroup.append(elm);
                        return elm
                    });
                    btnGroup.append(btnDotsRight);
                    btnGroup.append(btnArray[btnArray.length - 1]);
                } else if (this.currentPage >= btnArray.length - mid) {
                    var _l2 = btnArray.length - paginationLength;
                    var _r2 = btnArray.length;
                    btnGroup.append(btnArray[0]);
                    btnGroup.append(btnDotsLeft);
                    map(btnArray.slice(_l2, _r2), function (elm, i) {
                        btnGroup.append(elm);
                        return elm
                    });
                }
            } else {
                map(btnArray, function (elm, i) {
                    btnGroup.append(elm);
                    return elm
                });
            }

            btnGroup.append(nextBtn);

            btnGroup.click(function(e) {
                if ($(e.target).is(nextBtn)) {
                    _this.getPagesOffset(_this.currentPage + 1);
                    _this.constructTableCell();
                    _this.generatePagination();
                    _this.afterUpadte();
                } else if ($(e.target).is(prevBtn)) {
                    _this.getPagesOffset(_this.currentPage - 1);
                    _this.constructTableCell();
                    _this.generatePagination();
                    _this.afterUpadte();
                } else {
                    for (var i = 0; i < btnArray.length; i++) {
                        var b = $(btnArray[i])
                        if ($(e.target).is(b)) {
                            _this.getPagesOffset(i);
                            _this.constructTableCell();
                            _this.generatePagination();
                            _this.afterUpadte();
                        }
                    }
                }
            })

            if (this.currentPage === 0) {
                prevBtn.attr('disabled', true);
            }

            if (this.currentPage === btnArray.length - 1) {
                nextBtn.attr('disabled', true);
            }
            this.btnGroup = btnGroup;

            if (this.controlRow) {
                if (showPaginationLabel) {
                    var showLabel = '<span class="page-label">Showing ' + (this.leftBase + 1) + ' to ' + this.rightBase + ' of ' + data.length + ' entries</span>';
                    this.controlLeftCol.html(showLabel);
                }
                this.controlRightCol.html(this.btnGroup);
                if (paginationContainer)
                    $(paginationContainer).html(this.controlRow);
                else
                    this.table.after(this.controlRow);
            } else {
                if (paginationContainer)
                    $(paginationContainer).html(this.btnGroup);
                else
                    this.table.after(this.btnGroup);
            }

            this.isPaginationGenerated = true;
        }
    }, {
        key: 'constructTableObject',
        value: function constructTableObject() {
            var element = this.config.element;

            var table = '';
            if ($(element).is('table')) {
                table = $(element);
            } else {
                table = $('<table></table>');
                $(element).append(table);
            }
            table.addClass('gs-table');
            return table;
        }
    }, {
        key: 'constructControlObject',
        value: function constructControlObject() {
            var row = $('<div class="row"></div>');
            var colLeft = $('<div class="col-md-6"></div>');
            var colRight = $('<div class="col-md-6"></div>');
            colRight.css('text-align', 'right');
            row.append(colLeft).append(colRight);
            this.controlRow = row;
            this.controlLeftCol = colLeft;
            this.controlRightCol = colRight;
        }
    }, {
        key: 'constructTableCell',
        value: function constructTableCell() {
            var _this2 = this;

            var _config5 = this.config,
                data = _config5.data,
                columns = _config5.columns,
                sorting = _config5.sorting,
                processHtml = _config5.processHtml,
                columnsHtml = _config5.columnsHtml,
                sortingIcons = _config5.sortingIcons;


            this.table.html('');

            if (!data.length || isEmpty(columns)) return '';

            var tbody = $('<tbody class="gs-table-body-default"></tbody>'),
                thead = $('<thead class="gs-table-head-default"></thead>'),
                thr = $('<tr></tr>');

            forIn(columns, function (value, key, i) {
                var tbd = $('<th></th>');
                if (isFunction(columnsHtml)) {
                    tbd.html(columnsHtml(value, key, i));
                } else {
                    tbd.html(value);
                }
                tbd = _this2.addSorting(tbd, sorting, key, value, sortingIcons)
                thr.append(tbd);
            });

            thead.append(thr);

            map(data.slice(this.leftBase, this.rightBase), function (row, i) {
                var tbr = $('<tr></tr>');
                forIn(columns, function (val, key) {
                    if (row[key] !== undefined) {
                        var tbd = $('<td></td>');
                        if (isFunction(processHtml)) {
                            tbd.html(processHtml(row, key, uniqueId(6)));
                        } else {
                            tbd.html(row[key]);
                        }
                        tbr.append(tbd);
                    }
                });
                tbody.append(tbr);
                return data;
            });

            this.table.append(thead);
            this.table.append(tbody);
        }
    }, {
        key: 'addSorting',
        value: function addSorting(col, sorting, key, value, sortingIcons) {
            if (!sorting || !value) return col;
            var _this = this;
            if (isArray(sorting)) {
                if (sorting.indexOf(key) !== -1) {
                    if (key === _this.sortingKey) {
                        if (!_this.sortDirection || _this.sortDirection === sortDirection.ASC)
                            col.append(sortingIcons.asc);
                        else
                            col.append(sortingIcons.dec);
                    }

                    col.css('cursor', 'pointer');
                    col.click(function () {
                        _this.sortData(key);
                    });
                }
                return col;
            }

            if (value !== '') {
                if (key === _this.sortingKey) {
                    if (!_this.sortDirection || _this.sortDirection === sortDirection.ASC)
                        col.append(sortingIcons.asc);
                    else
                        col.append(sortingIcons.dec);
                }
                col.css('cursor', 'pointer');
                col.click(function () {
                    _this.sortData(key);
                });
            }
            return col;
        }
    }, {
        key: 'onTableResize',
        value: function onTableResize() {
            var _this3 = this;

            $(window).on('resize', function () {
                if (_this3.prevScreenWidth !== window.innerWidth) {
                    _this3.getColumns();
                    _this3.update();
                }
            });
        }
    }, {
        key: 'sortData',
        value: function sortData(sortKey) {
            var _config6 = this.config,
                data = _config6.data,
                dateParsing = _config6.dateParsing;

            if (this.sortingKey === sortKey) {
                if (this.sortDirection === sortDirection.ASC) {
                    this.config.data = data.sort(function (a, b) {
                        if (dateParsing) {
                            if (sortKey.toLowerCase().indexOf('date') !== -1 || isDate(a[sortKey])) {
                                var dateA = new Date(a[sortKey]);
                                var dateB = new Date(b[sortKey]);
                                return dateA - dateB;
                            }
                        }
                        if (a[sortKey] < b[sortKey]) return -1;
                        if (a[sortKey] > b[sortKey]) return 1;
                        return 0;
                    });
                    this.sortDirection = sortDirection.DESC;
                } else if (this.sortDirection === sortDirection.DESC) {
                    this.config.data = reverse(data.sort(function (a, b) {
                        if (dateParsing) {
                            if (sortKey.toLowerCase().indexOf('date') !== -1 || isDate(a[sortKey])) {
                                var dateA = new Date(a[sortKey]);
                                var dateB = new Date(b[sortKey]);
                                return dateA - dateB;
                            }
                        }
                        if (a[sortKey] < b[sortKey]) return -1;
                        if (a[sortKey] > b[sortKey]) return 1;
                        return 0;
                    }));
                    this.sortDirection = sortDirection.ASC;
                }
            } else {
                this.config.data = data.sort(function (a, b) {
                    if (dateParsing) {
                        if (sortKey.toLowerCase().indexOf('date') !== -1 || isDate(a[sortKey])) {
                            var dateA = new Date(a[sortKey]);
                            var dateB = new Date(b[sortKey]);
                            return dateA - dateB;
                        }
                    }
                    if (a[sortKey] < b[sortKey]) return -1;
                    if (a[sortKey] > b[sortKey]) return 1;
                    return 0;
                });
                this.sortDirection = sortDirection.DESC;
            }
            this.sortingKey = sortKey;
            this.constructTableCell();
            this.afterUpadte();
        }
    }, {
        key: 'searchText',
        value: function searchText(query) {
            var _config7 = this.config,
                originalData = _config7.originalData,
                columns = _config7.columns;

            this.isUpdating = true;
            if (!query) {
                this.config.data = originalData.slice();
                return this.update();
            }
            this.config.data = filter(originalData.slice(), function (row) {
                var found = false;
                forIn(columns, function (val, key) {
                    if (String(row[key]).toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                        found = true;
                    }
                });
                return found;
            });
            return this.update();
        }
    }, {
        key: 'handleSearchField',
        value: function handleSearchField() {
            var _this4 = this;

            var searchField = this.config.searchField;

            if (!searchField || !$(searchField).is('input')) return;
            $(searchField).on('keyup', function (e) {
                if (_this4.isUpdating) return false;
                _this4.searchText(e.target.value);
            });
        }
    }, {
        key: 'update',
        value: function update() {
            if (this.isDistroyed) return;
            this.currentPage = 0;
            this.getColumns();
            this.getPagesOffset(this.currentPage);
            this.generatePagination();
            this.constructTableCell();
            this.afterUpadte();
            this.isUpdating = false;
        }
    }, {
        key: 'updateDataset',
        value: function updateDataset(data) {
            if (this.isDistroyed) return;
            this.config.data = data;
            this.config.originalData = map(data, clone)
            this.update();
        }
    }, {
        key: 'distroy',
        value: function distroy() {
            if (this.table) this.table.remove();

            if (this.btnGroup) this.btnGroup.remove();

            if (this.controlRow) this.controlRow.remove();

            this.isDistroyed = true;
            this.afterDistroy();
        }
    }, {
        key: 'rebuild',
        value: function rebuild(options) {
            if (!this.isDistroyed) return;
            if (options) {
                this.config = $.extend(defaultConfig, options);
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
    }, {
        key: 'afterInit',
        value: function afterInit() {
            if (this.config.events && isFunction(this.config.events.onInit)) {
                this.config.events.onInit.call(this);
            }
        }
    }, {
        key: 'afterUpadte',
        value: function afterUpadte() {
            if (this.config.events && isFunction(this.config.events.onUpdate)) {
                this.config.events.onUpdate.call(this);
            }
        }
    }, {
        key: 'afterDistroy',
        value: function afterDistroy() {
            if (this.config.events && isFunction(this.config.events.onDistroy)) {
                this.config.events.onDistroy.call(this);
            }
        }
    }]);

    return TableSortable;
}();

(function ($) {
    if (!$) {
        throw new Error('Table Sortable: jQuery is not defind.')
    }
    $.fn.tableSortable = function (options) {
        options.element = this;
        return new TableSortable(options);
    };
    // eslint-disable-next-line
})(jQuery);
