import { data } from '../../TableSortable/__mock__/data'
import DataSet from '../'

describe('Dataset', () => {
    test('lookUp dataset', () => {
        const dataset = new DataSet()
        dataset.fromCollection(data)
        dataset.lookUp('40PM')
        expect(dataset.dataset.length).toStrictEqual(9)
        dataset.lookUp('')
        expect(dataset.dataset).toStrictEqual(data)
        dataset.lookUp(0)
        expect(dataset.dataset.length).toStrictEqual(data.length)
        dataset.lookUp('0')
        expect(dataset.dataset.length).toStrictEqual(data.length)
    })
})
