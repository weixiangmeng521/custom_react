import { createElement, createTextElement, Fiber } from "./fiber";
import { parse } from "./html_parser/index";


type AttributeType = {
    key: string,
    value: string,
}

type Node = {
    attributes?: AttributeType[],
    children?: Node[],
    position?: number,
    tagName?: string,
    type: string,
    content?: string,
}





// convert html tree to Fibertree
export const toFiberTree = (html:string) => {
    const tree:Node[] = parse(html);

    
    // obj array to obj
    const mergeAttr = (node:Node) => {
        const attrs:AttributeType[] = node?.attributes ?? [];
        
        // create object
        const obj:({[key:string]:string}) = {};
        attrs && attrs.forEach((item:AttributeType) => {
            const key = item.key;
            const value = item.value;
            obj[key] = value;
        });
        return obj;
    }
    
    // recursive
    const recursive = (node?:Node):Fiber|undefined => {
        if(!node) return;
        
        const childrenNodes:Fiber[] = [];
        node.children?.forEach((item:Node) => {
            const childNode = recursive(item);
            if(childNode) childrenNodes.push(childNode);
        })

        if(node.type === "text"){
            node.type = "TEXT";
            return createTextElement(node.content ?? "");
        }

        return createElement(
            node.tagName ?? "",
            mergeAttr(node),
            ...childrenNodes,
        );
    }
    return recursive(tree[0]);
}