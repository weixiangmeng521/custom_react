import { parse } from "./html_paser/index.mjs"
import { unescapedString } from "./html_paser/escape.mjs"


// create virual element
export function createElement(type, props, ...children) {
    return {
        type: type,
        props: Object.assign(
            {},
            props,
            {
                children: children.map((child) =>
                    typeof child === "object" ? child : createTextElement(child)
                ),
            }
        ),
    };
}

// create text virtual element
export function createTextElement(text) {
    return {
        type: "TEXT",
        props: {
            nodeValue: text,
            children: [],
        },
    };
}



// Convert HTML tree to Fiber tree
export const toFiberTree = (html) => {
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
  
    // Recursive function to traverse the HTML tree
    const recursive = (node) => {
        if (!node) return;
        const childrenNodes = (node.children || []).map((item) => recursive(item)).filter(Boolean);
        if (node.type === "text") {
            const content = unescapedString(node.content);
            return createTextElement(content ?? "");
        }
        return createElement(
            node.tagName ?? "",
            convertAttributesToObject(node),
            ...childrenNodes,
        );
    };
  
    return recursive(tree[0]);
};
  