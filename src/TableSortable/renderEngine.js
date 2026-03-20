import $ from 'jquery'
import * as utils from '../utils'

const constructNode = (node, attrs, children) => ({
    node,
    attrs,
    children,
})

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
            continue
        }
        if (/^on/.test(key) && attr) {
            elm.on(key.replace(/^on/, '').toLowerCase(), attr)
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

const createElement = ({ node, attrs, children }) => {
    let pretNode = $(`<${node}></${node}>`)
    return addAttrs(pretNode, attrs)
}

const renderElement = (pretObj, rootNode, isChild) => {
    if (!isChild) {
        rootNode.empty()
    }
    if (utils._isArray(pretObj)) {
        const pretElm = []
        for (let i = 0; i < pretObj.length; i++) {
            let elm = createElement(pretObj[i])
            if (pretObj[i].children) {
                elm = renderElement(pretObj[i].children, elm, true)
            }
            pretElm.push(elm)
        }
        rootNode.append(pretElm)
    } else if (utils._isObject(pretObj)) {
        let elm = createElement(pretObj)
        if (pretObj.children) {
            elm = renderElement(pretObj.children, elm, true)
        }
        rootNode.append(elm)
    }
    return rootNode
}

const Pret = () => {
    return {
        createElement: constructNode,
        render: renderElement,
    }
}

export default Pret
