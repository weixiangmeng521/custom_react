import { parse } from "./html_paser/index.mjs"
import { unescapedString } from "./html_paser/escape.mjs"
import { consola } from "consola";

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

// parse template string syntax
function parseTemplateSyntax(template) {
    // 正则表达式匹配{{变量名}}
    const regex = /\{\{([^}]+)\}\}/g;
    const result = template.replace(regex, (_, variable) => "${" + variable + "}");
    return result;
}



// Convert HTML tree to Fiber tree
// TODO: 支持模版语法
// TODO: 支持属性绑定
// TODO: 支持DOM属性
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
            let content = node.content ?? "";
            content = parseTemplateSyntax(content);
            content = unescapedString(content);
            return createTextElement(content);
        }
        return createElement(
            node.tagName ?? "",
            convertAttributesToObject(node),
            ...childrenNodes,
        );
    };

    return recursive(tree[0]);
};



// Convert HTML tree to Fiber tree text
export const toFiberTreeText = (html) => {
    const tree = parse(html)
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
            let content = node.content ?? "";
            content = parseTemplateSyntax(content);
            content = content.replace(/\n/g, '');
            content = unescapedString(content);
            return `createTextElement(\`${content}\`)`;
        }
        const _attribute = JSON.stringify(convertAttributesToObject(node));
        const template = `createElement("${node.tagName ?? ""}", ${_attribute}, ${childrenNodes.join(",")})`;
        return template;
    };

    return recursive(tree[0]);
}

