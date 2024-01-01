import { parse } from "./html_paser/index.mjs"
import { unescapedString } from "./html_paser/escape.mjs"
import { consola } from "consola";

// parse template string syntax
function parseTemplateSyntax(template) {
    // 正则表达式匹配{{变量名}}
    const regex = /\{\{([^}]+)\}\}/g;
    const result = template.replace(regex, (_, variable) => "${" + variable + "}");
    return result;
}

/**
 * valid syntax like: 
 * eg: (item, index) in items
 * eg: (item) in items
 * eg: item in items
 * @param {*} forConditionStr 
 */
const isValidForLoop = (forConditionStr) => {
    if(!forConditionStr) return false;
    return true;
}


// Convert HTML tree to Fiber tree text
export const toFiberTreeText = (html) => {
    const tree = parse(html);

    // Convert attribute array to object
    const convertAttributesToObject = (node) => {
        const attrs = node?.attributes ?? [];
        const obj = {};
        attrs.forEach((item) => {
            const key = item.key;
            const value = item.value;
            obj[key] = value;
        });
        return obj;
    };

    // display text element
    const displayTextElement = (node) => {
        let content = node.content ?? "";
        content = parseTemplateSyntax(content);
        content = content.replace(/\n/g, '');
        content = unescapedString(content);
        return `createTextElement(displayTplStr(\`${content}\`))`;
    }

    // display element
    const displayElement = (node, childrenNodes) => {
        const _attribute = JSON.stringify(convertAttributesToObject(node));
        const _childrenNodesString = childrenNodes.length === 0 ? "null" : childrenNodes.join(",");
        const template = `createElement("${node.tagName ?? ""}", ${_attribute}, ${_childrenNodesString})`;
        return template;
    }

    
    // TODO: attribute setter


    // TODO: if condition render


    // `for loop` display elements list
    const displayElementsList = (childNode, syntax, recursiveFn) => {
        const match = syntax.match(/\((\w+),\s*(\w+)\)\s+in\s+(\w+\.\w+)/);
        if (!match) {
            // TODO: parse throw err.
            return;
        }
        const [_, item, index] = match;
        const items = (syntax.split(" in ")[1] || "").trim();

        // remove attribute "for" and copy
        const attrList = childNode["attributes"] || [];
        for (let i = 0; i < attrList.length; i++) {
            const attr = attrList[i];
            if(attr["key"] === "for") attrList.splice(i, 1);
            i--;
        }
        return `...displayTplList(${items}, ((${item}, ${index}) => ${recursiveFn(childNode)}) || [])`;
    }


    /**
     * Recursive function to traverse the HTML tree
     * @param {Fiber} node 
     * @param {object} _context for loop's callback argument
     * @returns 
     */
    const recursive = (node, _context) => {
        if (!node) return;
        const childrenNodes = (node.children || []).map((childNode) => {

            // for "for" condition
            const forCondtionArr = (childNode["attributes"] || []).filter((item) => item["key"] === "for");
            if (
                forCondtionArr.length > 0 &&
                forCondtionArr[forCondtionArr.length - 1] &&
                forCondtionArr[forCondtionArr.length - 1]["value"] &&
                isValidForLoop(forCondtionArr[forCondtionArr.length - 1]["value"])
            ) return displayElementsList(childNode, forCondtionArr[forCondtionArr.length - 1]["value"], recursive);

            return recursive(childNode);
        }).filter(Boolean);

        // display text element
        if (node.type === "text") return displayTextElement(node);
        // display element
        return displayElement(node, childrenNodes);
    };

    return recursive(tree[0]);
}

