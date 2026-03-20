/**
 * Unit tests for the diffing-based render engine:
 *   - createVNode
 *   - diff  (edge cases: empty old, empty new, mixed updates)
 *   - patch (DOM side-effects via jQuery)
 */

import $ from 'jquery'
import Pret, { createVNode, diff, patch } from '../renderEngine'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a simple <tr> vNode with one <td> child containing text content. */
const rowVNode = text =>
    createVNode('tr', null, [createVNode('td', { html: text })])

/** Build a <tr> vNode with multiple <td> children. */
const multiColRow = (...texts) =>
    createVNode('tr', null, texts.map(t => createVNode('td', { html: t })))

/**
 * JSDOM strips <tbody>/<tr>/<td> elements when they are not inside a proper
 * <table>.  Each test that exercises the DOM must use this helper so that
 * jQuery can actually append children.
 */
const makeContainer = () => {
    document.body.innerHTML = '<table><tbody id="tbody"></tbody></table>'
    return $('#tbody')
}

// ---------------------------------------------------------------------------
// createVNode
// ---------------------------------------------------------------------------

describe('createVNode', () => {
    test('returns an object with tag, attrs and children', () => {
        const vn = createVNode('tr', { className: 'row' }, [])
        expect(vn).toEqual({ tag: 'tr', attrs: { className: 'row' }, children: [] })
    })

    test('defaults missing attrs to null', () => {
        const vn = createVNode('td')
        expect(vn.attrs).toBeNull()
    })

    test('defaults missing children to null', () => {
        const vn = createVNode('td', { html: 'hello' })
        expect(vn.children).toBeNull()
    })
})

// ---------------------------------------------------------------------------
// diff – empty old list
// ---------------------------------------------------------------------------

describe('diff – empty old list', () => {
    test('every new vNode becomes an INSERT', () => {
        const oldVNodes = []
        const newVNodes = [rowVNode('A'), rowVNode('B'), rowVNode('C')]
        const patches = diff(oldVNodes, newVNodes)

        expect(patches).toHaveLength(3)
        patches.forEach((p, i) => {
            expect(p.type).toBe('INSERT')
            expect(p.index).toBe(i)
        })
    })

    test('INSERT carries the correct vNode', () => {
        const vn = rowVNode('hello')
        const patches = diff([], [vn])
        expect(patches[0].vnode).toBe(vn)
    })
})

// ---------------------------------------------------------------------------
// diff – empty new list
// ---------------------------------------------------------------------------

describe('diff – empty new list', () => {
    test('every old vNode becomes a REMOVE', () => {
        const oldVNodes = [rowVNode('X'), rowVNode('Y')]
        const patches = diff(oldVNodes, [])

        expect(patches).toHaveLength(2)
        patches.forEach(p => {
            expect(p.type).toBe('REMOVE')
        })
    })

    test('REMOVE indices are the original positions', () => {
        const oldVNodes = [rowVNode('A'), rowVNode('B'), rowVNode('C')]
        const patches = diff(oldVNodes, [])
        const indices = patches.map(p => p.index).sort((a, b) => a - b)
        expect(indices).toEqual([0, 1, 2])
    })
})

// ---------------------------------------------------------------------------
// diff – identical lists
// ---------------------------------------------------------------------------

describe('diff – identical lists', () => {
    test('produces no patches when lists are equivalent', () => {
        const vNodes = [rowVNode('same'), rowVNode('content')]
        const patches = diff(vNodes, [rowVNode('same'), rowVNode('content')])
        expect(patches).toHaveLength(0)
    })
})

// ---------------------------------------------------------------------------
// diff – mixed updates
// ---------------------------------------------------------------------------

describe('diff – mixed updates', () => {
    test('detects UPDATE for changed rows and ignores unchanged rows', () => {
        const old = [rowVNode('A'), rowVNode('B'), rowVNode('C')]
        const next = [rowVNode('A'), rowVNode('B_changed'), rowVNode('C')]
        const patches = diff(old, next)

        expect(patches).toHaveLength(1)
        expect(patches[0].type).toBe('UPDATE')
        expect(patches[0].index).toBe(1)
    })

    test('handles simultaneous insert + update + remove', () => {
        const old = [rowVNode('Keep'), rowVNode('Change'), rowVNode('Remove')]
        const next = [rowVNode('Keep'), rowVNode('Changed'), rowVNode('New')]
        const patches = diff(old, next)

        // index 0 – same → no patch
        // index 1 – changed → UPDATE
        // index 2 – 'Remove' vs 'New' → UPDATE (same length lists)
        const types = patches.map(p => p.type)
        expect(types).not.toContain('INSERT') // lengths are equal
        expect(types).not.toContain('REMOVE') // lengths are equal
        const updates = patches.filter(p => p.type === 'UPDATE')
        expect(updates.length).toBeGreaterThanOrEqual(1)
    })

    test('handles new list longer than old (INSERT at the end)', () => {
        const old = [rowVNode('A')]
        const next = [rowVNode('A'), rowVNode('B'), rowVNode('C')]
        const patches = diff(old, next)

        const inserts = patches.filter(p => p.type === 'INSERT')
        expect(inserts).toHaveLength(2)
        expect(inserts[0].index).toBe(1)
        expect(inserts[1].index).toBe(2)
    })

    test('handles old list longer than new (REMOVE at the end)', () => {
        const old = [rowVNode('A'), rowVNode('B'), rowVNode('C')]
        const next = [rowVNode('A')]
        const patches = diff(old, next)

        const removes = patches.filter(p => p.type === 'REMOVE')
        expect(removes).toHaveLength(2)
    })

    test('handles completely different lists (all UPDATEs)', () => {
        const old = [rowVNode('1'), rowVNode('2')]
        const next = [rowVNode('X'), rowVNode('Y')]
        const patches = diff(old, next)

        expect(patches).toHaveLength(2)
        patches.forEach(p => expect(p.type).toBe('UPDATE'))
    })
})

// ---------------------------------------------------------------------------
// diff – null / undefined inputs
// ---------------------------------------------------------------------------

describe('diff – null/undefined inputs', () => {
    test('treats null old list as empty', () => {
        const patches = diff(null, [rowVNode('A')])
        expect(patches).toHaveLength(1)
        expect(patches[0].type).toBe('INSERT')
    })

    test('treats null new list as empty', () => {
        const patches = diff([rowVNode('A')], null)
        expect(patches).toHaveLength(1)
        expect(patches[0].type).toBe('REMOVE')
    })

    test('returns empty patch list when both are null', () => {
        const patches = diff(null, null)
        expect(patches).toHaveLength(0)
    })
})

// ---------------------------------------------------------------------------
// patch – DOM side-effects
// ---------------------------------------------------------------------------

describe('patch – DOM side-effects', () => {
    test('INSERT appends a new row to an empty container', () => {
        const container = makeContainer()
        const patches = [{ type: 'INSERT', index: 0, vnode: rowVNode('hello') }]
        patch(container, patches)
        expect(container.children().length).toBe(1)
        expect(container.find('td').text()).toBe('hello')
    })

    test('INSERT adds multiple rows in order', () => {
        const container = makeContainer()
        const patches = [
            { type: 'INSERT', index: 0, vnode: rowVNode('first') },
            { type: 'INSERT', index: 1, vnode: rowVNode('second') },
        ]
        patch(container, patches)
        const rows = container.find('tr')
        expect(rows.length).toBe(2)
        expect($(rows[0]).find('td').text()).toBe('first')
        expect($(rows[1]).find('td').text()).toBe('second')
    })

    test('REMOVE deletes the correct row and leaves others untouched', () => {
        const container = makeContainer()
        // Seed the container with 3 rows
        container.append('<tr><td>A</td></tr><tr><td>B</td></tr><tr><td>C</td></tr>')
        const patches = [{ type: 'REMOVE', index: 1 }]
        patch(container, patches)
        const rows = container.find('tr')
        expect(rows.length).toBe(2)
        expect($(rows[0]).find('td').text()).toBe('A')
        expect($(rows[1]).find('td').text()).toBe('C')
    })

    test('REMOVE multiple rows (highest index removed first)', () => {
        const container = makeContainer()
        container.append(
            '<tr><td>A</td></tr><tr><td>B</td></tr><tr><td>C</td></tr><tr><td>D</td></tr>'
        )
        const patches = [
            { type: 'REMOVE', index: 1 },
            { type: 'REMOVE', index: 3 },
        ]
        patch(container, patches)
        const rows = container.find('tr')
        expect(rows.length).toBe(2)
        expect($(rows[0]).find('td').text()).toBe('A')
        expect($(rows[1]).find('td').text()).toBe('C')
    })

    test('UPDATE replaces only the targeted row', () => {
        const container = makeContainer()
        container.append('<tr><td>old</td></tr><tr><td>untouched</td></tr>')
        const untouchedRow = container.find('tr').eq(1)[0]

        const patches = [{ type: 'UPDATE', index: 0, vnode: rowVNode('new') }]
        patch(container, patches)

        const rows = container.find('tr')
        expect(rows.length).toBe(2)
        expect($(rows[0]).find('td').text()).toBe('new')
        // The second row DOM node should be the same reference
        expect(rows[1]).toBe(untouchedRow)
    })

    test('untouched rows are not mutated during a mixed patch', () => {
        const container = makeContainer()
        container.append(
            '<tr><td>keep</td></tr><tr><td>change</td></tr>'
        )
        const keptRow = container.find('tr').eq(0)[0]

        const patches = [{ type: 'UPDATE', index: 1, vnode: rowVNode('changed') }]
        patch(container, patches)

        expect(container.find('tr').eq(0)[0]).toBe(keptRow)
        expect(container.find('tr').eq(1).find('td').text()).toBe('changed')
    })

    test('empty patch list leaves DOM untouched', () => {
        const container = makeContainer()
        container.append('<tr><td>stable</td></tr>')
        const before = container.html()
        patch(container, [])
        expect(container.html()).toBe(before)
    })

    test('null patch list leaves DOM untouched', () => {
        const container = makeContainer()
        container.append('<tr><td>stable</td></tr>')
        const before = container.html()
        patch(container, null)
        expect(container.html()).toBe(before)
    })
})

// ---------------------------------------------------------------------------
// Pret factory
// ---------------------------------------------------------------------------

describe('Pret factory', () => {
    test('exposes createElement, render, createVNode, diff, patch', () => {
        const engine = Pret()
        expect(typeof engine.createElement).toBe('function')
        expect(typeof engine.render).toBe('function')
        expect(typeof engine.createVNode).toBe('function')
        expect(typeof engine.diff).toBe('function')
        expect(typeof engine.patch).toBe('function')
    })

    test('engine.diff delegates to the exported diff function', () => {
        const engine = Pret()
        const patches = engine.diff([], [rowVNode('x')])
        expect(patches[0].type).toBe('INSERT')
    })

    test('engine.patch delegates to the exported patch function', () => {
        const container = makeContainer()
        const engine = Pret()
        engine.patch(container, [{ type: 'INSERT', index: 0, vnode: rowVNode('y') }])
        expect(container.find('td').text()).toBe('y')
    })
})
