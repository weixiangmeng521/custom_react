import type { Fiber, FiberProps } from "./fiber"
import { createDom } from "./fiber";
import { arraysEqual, objectsEqual } from "./helper";


export interface Diff {
    type: string;
    node: Fiber;
    props?: FiberProps;
}


export function diff(oldNode: Fiber, newNode: Fiber): Diff[] {
    const diffs: Diff[] = [];
    diffNode(oldNode, newNode, diffs);
    return diffs;
}

function diffNode(oldNode: Fiber | undefined, newNode: Fiber | undefined, diffs: Diff[]) {
    if (!oldNode) {
        if (newNode) {
            diffs.push({ type: "CREATE", node: newNode });
        }
    } else if (!newNode) {
        diffs.push({ type: "DELETE", node: oldNode });
    } else if (!isSameType(oldNode, newNode)) {
        diffs.push({ type: "REPLACE", node: newNode });
    } else {
        const propsDiff = diffProps(oldNode.props, newNode.props);
        if (propsDiff.length > 0) {
            const fiberProps = diffTuple2FiberProps(propsDiff, newNode);
            diffs.push({ type: "UPDATE_PROPS", node: newNode, props: fiberProps});
        }
        diffChildren(oldNode, newNode, diffs);
    }
}

// create differed props object
function diffTuple2FiberProps(propsDiff: string[], newNode: Fiber):FiberProps {
    const fiberProps: FiberProps = { children: [] };
    propsDiff.forEach((prop) => {
        (fiberProps as any)[prop] = newNode.props[prop];
    });
    return fiberProps;
}


function isSameType(fiber1: Fiber, fiber2: Fiber): boolean {
    return fiber1.type === fiber2.type;
}


function diffProps(oldProps: FiberProps, newProps: FiberProps): string[] {
    const propsDiff: string[] = [];
    const allProps = { ...oldProps, ...newProps };

    for (const key in allProps) {
        const oldPropValue: string | string[] | Fiber[] | Fiber | EventListenerOrEventListenerObject = oldProps[key];
        const newPropValue: string | string[] | Fiber[] | Fiber | EventListenerOrEventListenerObject = newProps[key];

        if (
            (Array.isArray(oldPropValue) || oldPropValue instanceof Object) &&
            (Array.isArray(newPropValue) || newPropValue instanceof Object)
        ) {
            // If both values are either arrays or instances of Fiber, 
            // consider them as children Fiber nodes
            // Ignore them, don't compare
            continue;
            
        } else if (Array.isArray(oldPropValue) && Array.isArray(newPropValue)) {
            // If both values are string[], then compare
            if (!arraysEqual(oldPropValue, newPropValue)) {
                propsDiff.push(key);
            }
        } else if (typeof oldPropValue === 'string' && typeof newPropValue === 'string') {
            // If both values are strings, then compare
            if (oldPropValue !== newPropValue) {
                propsDiff.push(key);
            }
        } else {
            // Default comparison for other types
            if (oldPropValue !== newPropValue) {
                propsDiff.push(key);
            }
        }
    }


    return propsDiff;
}




function diffChildren(oldNode: Fiber, newNode: Fiber, diffs: Diff[]) {
    const oldChildren = oldNode.props.children || [];
    const newChildren = newNode.props.children || [];
    const maxLength = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < maxLength; i++) {
        diffNode(oldChildren[i], newChildren[i], diffs);
    }
}

// Example usage
// const oldNode: Fiber = /* old virtual tree */;
// const newNode: Fiber = /* new virtual tree */;

// const diffs = diff(oldNode, newNode);

// Apply the changes to the actual DOM
// patch(document.getElementById("app")!, diffs);

export function patch(node: HTMLElement | null, diffs: Diff[]) {
    if(!node)return;
    for (const diff of diffs) {
        switch (diff.type) {
            case "CREATE":
                createNode(node, diff.node);
                break;
            case "DELETE":
                deleteNode(node, diff.node);
                break;
            case "REPLACE":
                replaceNode(node, diff.node);
                break;
            case "UPDATE_PROPS":
                const fiberProps = diff.props ?? { children: [] };
                const diffProps = Object.keys(diff.props ?? { children: [] });
                updateProps(node, fiberProps, diffProps);
                break;
        }
    }
}

function createNode(parent: HTMLElement, newNode: Fiber) {
    const dom = createDom(newNode);
    parent.appendChild(dom);
}

function deleteNode(parent: HTMLElement, oldNode: Fiber) {
    const dom = findDom(parent, oldNode);
    if (dom) {
        parent.removeChild(dom);
    }
}

function replaceNode(parent: HTMLElement, newNode: Fiber) {
    const dom = findDom(parent, newNode);
    if (dom) {
        parent.replaceChild(createDom(newNode), dom);
    }
}

function updateProps(node: HTMLElement, newProps: FiberProps, propKeys: string[]) {
    if(!newProps) return;
    // Remove old props
    for (const key in node) {
        if (!(key in newProps)) {
            delete (node as any)[key];
        }
    }

    // Update or add new props
    for (const key of propKeys) {
        if (key !== 'children') {
            (node as any)[key] = newProps[key];
        }
    }
}

function findDom(parent: HTMLElement, node: Fiber): HTMLElement | Text | null {
    // Your logic to find the corresponding DOM node based on the Fiber node
    return null;
}

