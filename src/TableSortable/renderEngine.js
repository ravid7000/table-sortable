import $ from 'jquery'
import * as utils from '../utils'

// ---------------------------------------------------------------------------
// Virtual-node helpers
// ---------------------------------------------------------------------------

/**
 * createVNode
 * Lightweight virtual-node representation.
 * @param {string} tag   – element tag name  (e.g. 'tr', 'td', 'th')
 * @param {Object} attrs – plain attribute map (className, html, text, …)
 * @param {Array}  children – array of child vNodes OR jQuery objects
 * @returns {{ tag, attrs, children }}
 */
const createVNode = (tag, attrs, children) => ({
    tag: tag || 'div',
    attrs: attrs || null,
    children: children || null,
})

// ---------------------------------------------------------------------------
// Attr helpers (kept from original implementation)
// ---------------------------------------------------------------------------

const addAttrs = (elm, attrs) => {
    if (!attrs) {
        return elm
    }
    const attrKeys = Object.keys(attrs)
    let i = 0

    while (i < attrKeys.length) {
        const key = attrKeys[i]
        const attr = attrs[key]
        if (attr === undefined) {
            i += 1
            continue
        }
        if (/^on/i.test(key) && utils._isFunction(attr)) {
            elm.on(key.replace(/^on/i, '').toLowerCase(), attr)
        } else if (key === 'text') {
            elm.text(attr)
        } else if (key === 'html') {
            elm.html(attr)
        } else if (key === 'append') {
            elm.append(attr)
        } else if (key === 'className') {
            elm.attr('class', attr)
        } else {
            elm.attr(key, attr)
        }
        i += 1
    }

    return elm
}

// ---------------------------------------------------------------------------
// DOM creation from a vNode
// ---------------------------------------------------------------------------

const createElement = ({ tag, attrs, children }) => {
    let elm = $(`<${tag}></${tag}>`)
    elm = addAttrs(elm, attrs)
    if (children) {
        _appendChildren(elm, children)
    }
    return elm
}

/** Recursively materialise children (vNode array, single vNode or jQuery) */
const _appendChildren = (parentElm, children) => {
    if (utils._isArray(children)) {
        for (let i = 0; i < children.length; i++) {
            const child = children[i]
            if (!child) continue
            if (child instanceof $ || (child && child.jquery)) {
                parentElm.append(child)
            } else if (utils._isObject(child) && child.tag) {
                parentElm.append(createElement(child))
            }
        }
    } else if (children instanceof $ || (children && children.jquery)) {
        parentElm.append(children)
    } else if (utils._isObject(children) && children.tag) {
        parentElm.append(createElement(children))
    }
    return parentElm
}

// ---------------------------------------------------------------------------
// vNode serialisation (used for change detection)
// ---------------------------------------------------------------------------

/**
 * Produce a stable string key for a vNode so we can detect changes cheaply.
 * We only need to compare the attrs object (excluding event handlers) and
 * the content of child nodes, not handlers.
 */
const _serializeAttrs = attrs => {
    if (!attrs) return ''
    const relevant = {}
    const keys = Object.keys(attrs)
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i]
        // skip event handler functions – they change every render but the
        // rendered output does not
        if (/^on/i.test(k) && utils._isFunction(attrs[k])) continue
        const v = attrs[k]
        // jQuery objects → use their outer HTML for comparison
        if (v && v.jquery) {
            relevant[k] = v[0] ? v[0].outerHTML : ''
        } else {
            relevant[k] = v
        }
    }
    return JSON.stringify(relevant)
}

const _serializeVNode = vnode => {
    if (!vnode) return 'null'
    const childStr = utils._isArray(vnode.children)
        ? vnode.children.map(_serializeVNode).join('|')
        : vnode.children && vnode.children.tag
        ? _serializeVNode(vnode.children)
        : ''
    return `${vnode.tag}:${_serializeAttrs(vnode.attrs)}:${childStr}`
}

// ---------------------------------------------------------------------------
// diff
// ---------------------------------------------------------------------------

/**
 * diff(oldVNodes, newVNodes)
 *
 * Compares two flat arrays of row-level vNodes and produces a minimal patch
 * list describing insert / update / remove operations.
 *
 * Each patch operation is one of:
 *   { type: 'INSERT', index, vnode }
 *   { type: 'UPDATE', index, vnode }
 *   { type: 'REMOVE', index }
 *
 * @param {Array} oldVNodes
 * @param {Array} newVNodes
 * @returns {Array} patchList
 */
const diff = (oldVNodes, newVNodes) => {
    const patches = []
    const oldLen = (oldVNodes || []).length
    const newLen = (newVNodes || []).length
    const maxLen = Math.max(oldLen, newLen)

    for (let i = 0; i < maxLen; i++) {
        if (i >= oldLen) {
            // new node beyond old list → INSERT
            patches.push({ type: 'INSERT', index: i, vnode: newVNodes[i] })
        } else if (i >= newLen) {
            // old node with no new counterpart → REMOVE (use oldLen - 1 .. newLen)
            patches.push({ type: 'REMOVE', index: i })
        } else {
            // both exist – compare serialised forms
            const oldKey = _serializeVNode(oldVNodes[i])
            const newKey = _serializeVNode(newVNodes[i])
            if (oldKey !== newKey) {
                patches.push({ type: 'UPDATE', index: i, vnode: newVNodes[i] })
            }
            // else: no change → skip (this is the "leave untouched" case)
        }
    }

    return patches
}

// ---------------------------------------------------------------------------
// patch
// ---------------------------------------------------------------------------

/**
 * patch(domContainer, patchList)
 *
 * Applies a patch list produced by `diff` to a live DOM container (jQuery
 * wrapper).  Only the rows listed in the patch list are mutated; all other
 * rows are left completely untouched.
 *
 * @param {jQuery} domContainer – the <tbody> or <thead> element
 * @param {Array}  patchList    – output of diff()
 */
const patch = (domContainer, patchList) => {
    if (!patchList || !patchList.length) {
        return
    }

    // Sort patches: process REMOVEs from highest index to lowest so that
    // removing a row does not shift the indices of subsequent rows.
    const removes = patchList
        .filter(p => p.type === 'REMOVE')
        .sort((a, b) => b.index - a.index)
    const inserts = patchList
        .filter(p => p.type === 'INSERT')
        .sort((a, b) => a.index - b.index)
    const updates = patchList.filter(p => p.type === 'UPDATE')

    // --- REMOVES ---
    removes.forEach(({ index }) => {
        const children = domContainer.children()
        if (index < children.length) {
            $(children[index]).remove()
        }
    })

    // --- UPDATES ---
    updates.forEach(({ index, vnode }) => {
        const children = domContainer.children()
        if (index < children.length) {
            const newElm = createElement(vnode)
            $(children[index]).replaceWith(newElm)
        }
    })

    // --- INSERTS ---
    inserts.forEach(({ index, vnode }) => {
        const newElm = createElement(vnode)
        const children = domContainer.children()
        if (index >= children.length) {
            domContainer.append(newElm)
        } else {
            $(children[index]).before(newElm)
        }
    })
}

// ---------------------------------------------------------------------------
// renderElement (backward-compatible full render, used for initial mount)
// ---------------------------------------------------------------------------

const renderElement = (pretObj, rootNode, isChild) => {
    if (!isChild) {
        rootNode.empty()
    }
    if (utils._isArray(pretObj)) {
        const pretElm = []
        for (let i = 0; i < pretObj.length; i++) {
            pretElm.push(createElement(pretObj[i]))
        }
        rootNode.append(pretElm)
    } else if (utils._isObject(pretObj) && pretObj.tag) {
        rootNode.append(createElement(pretObj))
    }
    return rootNode
}

/**
 * renderColGroup
 *
 * Builds a `<colgroup>` element containing one `<col>` per column,
 * applying per-column CSS widths from `columnWidths` where provided.
 *
 * @param {string[]}             colKeys      - Ordered array of column keys.
 * @param {Object<string,string>} columnWidths - Map of columnKey → CSS width string.
 * @returns {jQuery} The constructed `<colgroup>` jQuery element.
 */
const renderColGroup = (colKeys, columnWidths) => {
    if (!columnWidths || Object.keys(columnWidths).length === 0) {
        return null
    }
    const colgroup = $('<colgroup></colgroup>')
    colKeys.forEach(key => {
        const col = $('<col />')
        if (columnWidths[key]) {
            col.css('width', columnWidths[key])
        }
        colgroup.append(col)
    })
    return colgroup
}

// ---------------------------------------------------------------------------
// Pret factory (public API)
// ---------------------------------------------------------------------------

/**
 * Pret()
 * Returns the render engine instance used by TableSortable.
 *
 * Additions over the original API:
 *   engine.createVNode(tag, attrs, children) – alias for createElement
 *   engine.diff(oldVNodes, newVNodes)        – produce patch list
 *   engine.patch(domContainer, patchList)    – apply patch list
 */
const Pret = () => {
    return {
        // legacy API (kept for backward compatibility)
        createElement: createVNode,
        render: renderElement,
        renderColGroup,

        // new diffing API
        createVNode,
        diff,
        patch,
    }
}

export { createVNode, diff, patch }
export default Pret
