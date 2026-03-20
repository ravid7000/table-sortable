/**
 * Unit tests for the windowed-slice computation in virtualization.js
 */
import { computeWindow } from '../../TableSortable/virtualization'

describe('computeWindow', () => {
    // Basic visible window calculation
    test('returns full range when all rows fit in viewport', () => {
        const result = computeWindow(10, 0, 500, 40, 0)
        // 10 rows × 40 px = 400 px, fits inside 500 px viewport
        expect(result.startIndex).toBe(0)
        expect(result.endIndex).toBe(10)
    })

    test('returns startIndex 0 when scrollTop is 0', () => {
        const result = computeWindow(100, 0, 200, 40, 0)
        expect(result.startIndex).toBe(0)
        // visible rows: ceil((0 + 200) / 40) = 5
        expect(result.endIndex).toBe(5)
    })

    test('advances startIndex when user scrolls down', () => {
        // scrollTop = 400, rowHeight = 40 → first visible = floor(400/40) = 10
        const result = computeWindow(100, 400, 200, 40, 0)
        expect(result.startIndex).toBe(10)
    })

    test('endIndex does not exceed totalRows', () => {
        const result = computeWindow(15, 400, 200, 40, 5)
        expect(result.endIndex).toBeLessThanOrEqual(15)
    })

    test('startIndex is clamped to 0 with overscan applied', () => {
        // scrollTop small enough that firstVisible - overscan < 0
        const result = computeWindow(100, 40, 200, 40, 5)
        // firstVisible = floor(40/40) = 1; 1 - 5 = -4 → clamped to 0
        expect(result.startIndex).toBe(0)
    })

    test('includes overscan rows above and below', () => {
        // scrollTop = 200, rowHeight = 40 → firstVisible = 5, lastVisible = ceil(400/40) = 10
        const result = computeWindow(100, 200, 200, 40, 3)
        expect(result.startIndex).toBe(2)   // 5 - 3
        expect(result.endIndex).toBe(13)    // 10 + 3
    })

    test('returns { 0, 0 } for zero totalRows', () => {
        const result = computeWindow(0, 0, 500, 40, 5)
        expect(result.startIndex).toBe(0)
        expect(result.endIndex).toBe(0)
    })

    test('returns { 0, 0 } for zero rowHeight', () => {
        const result = computeWindow(100, 0, 500, 0, 5)
        expect(result.startIndex).toBe(0)
        expect(result.endIndex).toBe(0)
    })

    test('handles large scroll position near end of list', () => {
        // 100 rows × 40 px = 4000 px total; scrollTop = 3800
        const result = computeWindow(100, 3800, 200, 40, 2)
        expect(result.startIndex).toBeGreaterThanOrEqual(92) // 95 - 2 - 1
        expect(result.endIndex).toBe(100)                   // clamped at totalRows
    })

    test('startIndex is always <= endIndex', () => {
        const cases = [
            [10, 0, 100, 40, 3],
            [10, 0, 500, 40, 5],
            [5, 80, 40, 40, 2],
            [50, 1000, 300, 50, 10],
        ]
        cases.forEach(([total, scroll, vh, rh, os]) => {
            const { startIndex, endIndex } = computeWindow(total, scroll, vh, rh, os)
            expect(startIndex).toBeLessThanOrEqual(endIndex)
        })
    })
})
