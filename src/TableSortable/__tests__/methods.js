import $ from 'jquery'
import TableSortable from '..'
import { data, columns } from '../__mock__/data'

const rootElm = '#root'

beforeAll(() => {
    document.body.innerHTML = `
        <div id="root"></div>
    `
})
describe('Table Sortable Methods:', () => {
    test('check searchField', () => {
        jest.useFakeTimers()
        const searchInput = $('<input type="text" />')
        const table = new TableSortable({
            element: rootElm,
            data,
            columns,
            searchField: searchInput,
        })
        searchInput.val(18).trigger('input')
        jest.runAllTimers()
        expect(table._dataset._datasetLen).toStrictEqual(1)
        expect(
            $(rootElm)
                .find('tbody')
                .find('tr').length
        ).toStrictEqual(1)
        searchInput.val('').trigger('input')
        jest.runAllTimers()
        expect(table._dataset._datasetLen).toStrictEqual(data.length)
        expect(
            $(rootElm)
                .find('tbody')
                .find('tr').length
        ).toStrictEqual(10)
    })
})
