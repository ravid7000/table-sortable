import $ from 'jquery'
import TableSortable from '..'
import { data, columns } from '../__mock__/data'

const rootElm = '#root'

beforeAll(() => {
    document.body.innerHTML = `
        <div id="root"></div>
    `
})

describe('Table Sortable Pagination:', () => {
    test('should not render pagination', () => {
        const table = new TableSortable({
            element: rootElm,
            data,
            columns,
            pagination: false,
        })
        expect(table._pagination.elm).toStrictEqual(null)
    })
    test('should render pagination', () => {
        new TableSortable({
            element: rootElm,
            data,
            columns,
        })
        expect($(rootElm).find('.gs-pagination').length).toStrictEqual(1)
    })
    test('check prev button text', () => {
        const prevText = 'test me'
        new TableSortable({
            element: rootElm,
            data,
            columns,
            prevText,
        })
        const buttons = $(rootElm)
            .find('.gs-pagination')
            .find('button')
        const prevButton = $(buttons[0])
        expect(prevButton.text()).toStrictEqual(prevText)
    })
    test('check next button text', () => {
        const nextText = 'test me'
        new TableSortable({
            element: rootElm,
            data,
            columns,
            nextText,
        })
        const buttons = $(rootElm)
            .find('.gs-pagination')
            .find('button')
        const nextButton = $(buttons[buttons.length - 1])
        expect(nextButton.text()).toStrictEqual(nextText)
    })
    test('should render all buttons', () => {
        const totalBtns = 5
        new TableSortable({
            element: rootElm,
            data,
            columns,
        })
        const buttons = $(rootElm)
            .find('.gs-pagination')
            .find('button')
        expect(buttons.length).toStrictEqual(totalBtns)
    })
    test('simulate prev button click', () => {
        const table = new TableSortable({
            element: rootElm,
            data,
            columns,
        })
        let buttons = $(rootElm)
            .find('.gs-pagination')
            .find('button')
        const nextBtn = buttons[buttons.length - 1]
        $(nextBtn).click()
        expect(table._pagination.currentPage).toStrictEqual(1)
        buttons = $(rootElm)
            .find('.gs-pagination')
            .find('button')
        const prevBtn = buttons[0]
        $(prevBtn).click()
        expect(table._pagination.currentPage).toStrictEqual(0)
    })
    test('simulate next button click', () => {
        const table = new TableSortable({
            element: rootElm,
            data,
            columns,
        })
        const buttons = $(rootElm)
            .find('.gs-pagination')
            .find('button')
        const nextBtn = buttons[buttons.length - 1]
        expect(table._pagination.currentPage).toStrictEqual(0)
        $(nextBtn).click()
        expect(table._pagination.currentPage).toStrictEqual(1)
    })
    test('simulate button 2 click', () => {
        const table = new TableSortable({
            element: rootElm,
            data,
            columns,
        })
        const buttons = $(rootElm)
            .find('.gs-pagination')
            .find('button')
        const button2 = buttons[2]
        expect($(button2).text()).toStrictEqual('2')
        $(button2).click()
        expect(table._pagination.currentPage).toStrictEqual(1)
    })
    test('prev button should be disabled when current page 0', () => {
        new TableSortable({
            element: rootElm,
            data,
            columns,
        })
        const buttons = $(rootElm)
            .find('.gs-pagination')
            .find('button')
        expect($(buttons[0]).attr('disabled')).toStrictEqual('disabled')
    })
    test('next button should be disabled when current page == totalPage', () => {
        const table = new TableSortable({
            element: rootElm,
            data,
            columns,
        })
        table.setPage(table._pagination.totalPages - 1)
        const buttons = $(rootElm)
            .find('.gs-pagination')
            .find('button')
        expect($(buttons[buttons.length - 1]).attr('disabled')).toStrictEqual('disabled')
    })
    test('button should have active class for currentPage', () => {
        new TableSortable({
            element: rootElm,
            data,
            columns,
        })
        const buttons = $(rootElm)
            .find('.gs-pagination')
            .find('button')
        expect($(buttons[1]).hasClass('active')).toStrictEqual(true)
    })
    test('buttons should have data-page attribute', () => {
        new TableSortable({
            element: rootElm,
            data,
            columns,
        })
        const buttons = $(rootElm)
            .find('.gs-pagination')
            .find('button')
        const totalButton = buttons.length - 3
        const hasDataPageFor = []
        Array.from(buttons).forEach(btn => {
            if ($(btn).attr('data-page')) {
                hasDataPageFor.push($(btn).attr('data-page'))
            }
        })
        expect(totalButton).toStrictEqual(hasDataPageFor.length)
    })
})
