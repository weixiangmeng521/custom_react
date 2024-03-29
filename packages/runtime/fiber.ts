import { debug } from "console";
import { arraysEqual } from "./helper";
import { requestIdleCallback, IdleObject } from "./requestIdleCallback";


// fiber node interface
export type Fiber = {
    tag?: string,
    type?: string | ((props: FiberProps) => Fiber),
    // 单链表树结构
    parent?: Fiber,
    child?: Fiber | null,
    sibling?: Fiber | null,
    // 在渲染完成之后他们会交换位置
    alternate?: Fiber | null,
    // 跟当前Fiber相关本地状态（比如浏览器环境就是DOM节点）
    stateNode?: HTMLElement | Text,
    props: FiberProps,
    partialState?: Fiber | null,
    // Effect 相关的
    effectTag?: EffectTag,
    hooks?: [],
    dom?: Text | HTMLElement | null,
}


export type PropsType = string | string[] | Fiber[] | Fiber | EventListenerOrEventListenerObject;


export type FiberProps = {
    [key: string]: PropsType,
    children: Fiber[],
}


// effect name
export type PLACEMENT = 0b000001;
export type UPDATE    = 0b000010;
export type DELETION  = 0b000100;
// value
export const PLACEMENT: PLACEMENT = 0b00001;
export const UPDATE: UPDATE = 0b00010;
export const DELETION: DELETION = 0b00100;
// union type
export type EffectTag = PLACEMENT | UPDATE | DELETION;



export interface Effect {
    tag: EffectTag;
    fiber: Fiber;
}




let nextUnitOfWork: Fiber | null | undefined = null;
let currentRoot: Fiber | null = null;
let wipRoot: Fiber | null = null;
let deletions: Fiber[] = [];
let hookIndex: number = 0;





// create virual element
function createElement(
    type: (string | (() => Fiber)),
    props?: {
        [key: string]: PropsType,
    } | null,
    ...children: (Fiber[] | string[])
): Fiber {
    return {
        type: type,
        props: {
            ...props,
            children: children.map((child: Fiber | string) =>
                typeof child === "object" ? child : createTextElement(child)
            )
        },
    }
}

// create text virtual element
function createTextElement(text: string): Fiber {
    return {
        type: "TEXT",
        props: {
            nodeValue: text,
            children: [],
        },
    }
}

// create html dom by virtual dom
function createDom(vdom: Fiber) {
    const dom = vdom.type === "TEXT"
        ? document.createTextNode("")
        : document.createElement((vdom.type as string) || "div");

    // debugger;
    updateDom(dom, { children: [] }, vdom.props)
    return dom;
}


// update dom 
function updateDom(dom: any, prevProps: FiberProps | null, nextProps: FiberProps = { children: [] }) {
    // Your logic to update DOM attributes, event listeners, etc.
    // Remove old attributes
    const isEvent = (name: string) => name.startsWith("on");
    const isAttribute = (name: string) => !isEvent(name) && name !== "children";

    // Add new attributes
    Object.keys(nextProps).filter(isAttribute).forEach((name: string) => {
        if (!isSameProps(prevProps ?? { children: [] }, nextProps)) {
            // exclude children
            if (name !== "children") {
                dom[name] = nextProps[name];
            }
        }
    });


    // Add or remove event listeners
    Object.keys(nextProps).filter(isEvent).forEach(name => {
        const eventType = name.toLowerCase().substring(2);
        // exclude Fiber, Fiber[], string[]
        if (Array.isArray(nextProps[name]) || typeof nextProps[name] === "object") return;

        const oldHandlerStr = (nextProps ?? { children: [] })[name] as string;

        // update, remove old handler, add new handler.
        const oldHandler = new Function(oldHandlerStr) as EventListenerOrEventListenerObject;
        const newHandler = new Function(nextProps[name] as string) as EventListenerOrEventListenerObject;
       
        debugger;

        // is not same
        if (oldHandlerStr !== nextProps[name]) {
            dom.removeEventListener(eventType, oldHandler);
            dom.addEventListener(eventType, newHandler);
            return;
        }
        // bind event
        dom.addEventListener(eventType, newHandler);
        // debugger;
    })
}



// final commit root
function commitRoot() {
    deletions.forEach(commitWork)
    commitWork(wipRoot?.child);
    currentRoot = wipRoot;
    wipRoot = null;
}



// applying the changes to the actual DOM based on the effects specified
function commitWork(fiber: Fiber | null | undefined) {
    if (!fiber) return

    let domParentFiber = fiber.parent
    while (domParentFiber && !domParentFiber.dom) {
        domParentFiber = domParentFiber.parent
    }
    const domParent = domParentFiber?.dom

    if (domParent && fiber.effectTag === PLACEMENT && fiber.dom) {
        // If the fiber has the PLACEMENT effect, append the DOM node to its parent
        domParent.appendChild(fiber.dom)

    } else if (
        // If the fiber has the UPDATE effect, update the DOM node with new props
        domParent && fiber.effectTag === UPDATE && fiber.dom
    ) {
        updateDom(
            fiber.dom,
            fiber.alternate?.props ?? null,
            fiber.props
        );

        // If the fiber has the DELETION effect, remove the DOM node from its parent    
    } else if (domParent && fiber.effectTag === DELETION) {
        commitDeletion(fiber, domParent);
    }


    commitWork(fiber.child)
    commitWork(fiber.sibling)
}




// handling the deletion of a fiber and its associated DOM nodes.
function commitDeletion(fiber: Fiber | undefined | null, domParent: HTMLElement | Text) {
    if (!fiber) return
    if (fiber.dom) {
        // If the fiber has a DOM node, remove it from the parent
        if (domParent.contains(fiber.dom)) {
            domParent.removeChild(fiber.dom);
        }
    } else {
        // If the fiber doesn't have a DOM node, recursively commit deletion for its children
        commitDeletion(fiber.child, domParent)
    }
}





// It's responsible for advancing the unit of work (a fiber) and performing the necessary updates to the virtual DOM based on the fiber's type
function performUnitOfWork(fiber: Fiber): Fiber | undefined {
    // Perform different tasks based on the type of the fiber
    const isFunctionComponent = typeof fiber.type === 'function';
    if (isFunctionComponent) {
        updateFunctionComponent(fiber)
    } else {
        updateHostComponent(fiber)
    }

    // Return the next unit of work (fiber)
    if (fiber.child) return fiber.child;

    // If no child, traverse the sibling or move up to the parent's sibling
    let nextFiber: Fiber | undefined = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) return nextFiber.sibling
        nextFiber = nextFiber.parent
    }
}





// Example function to update a function component
function updateFunctionComponent(fiber: Fiber) {
    wipRoot = fiber
    hookIndex = 0;
    wipRoot.hooks = [];

    const fn = fiber.type as ((props: FiberProps) => Fiber);
    const children = [fn(fiber.props)]
    reconcileChildren(fiber, children)
}





// Example function to update a host component
function updateHostComponent(fiber: Fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }
    reconcileChildren(fiber, fiber.props?.children || [])
}





// check are props same
function isSameProps(oldProps: FiberProps, newProps: FiberProps): boolean {
    const allProps = { ...oldProps, ...newProps };

    for (const key in allProps) {
        const oldPropValue: PropsType = oldProps[key];
        const newPropValue: PropsType = newProps[key];

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
            if (!arraysEqual<string | string[] | Fiber[] | Fiber>(oldPropValue, newPropValue)) {
                return false;
            }
        } else if (typeof oldPropValue === 'string' && typeof newPropValue === 'string') {
            // If both values are strings, then compare
            if (oldPropValue !== newPropValue) {
                return false;
            }
        } else {
            // Default comparison for other types
            if (oldPropValue !== newPropValue) {
                return false;
            }
        }
    }

    return true;
}




// It is responsible for comparing the new set of children with the old set of children 
// and making the necessary updates to the virtual DOM.
function reconcileChildren(wipFiber: Fiber, elements: Fiber[]) {
    let index = 0;
    let oldFiber = wipFiber.alternate?.child;
    let prevSibling: Fiber | null = null;
    while (index < elements.length || oldFiber) {
        let element = elements[index]
        let newFiber: Fiber | null = null;

        const sameType = oldFiber && element && element.type === oldFiber.type && isSameProps(oldFiber.props, element.props);
        // if(wipFiber.alternate){ debugger}
        if (sameType) {
            // Update the existing fiber with new props
            newFiber = {
                type: oldFiber?.type,
                props: element.props,
                dom: oldFiber?.dom,
                parent: wipFiber,
                alternate: { ...(oldFiber ?? { props: { children: [] } }) },
                effectTag: UPDATE,
            }
        }

        if (!sameType && element) {
            // Create a new fiber for a new element
            newFiber = {
                type: element.type,
                props: element.props,
                dom: createDom({ type: element.type, props: element.props }),
                parent: wipFiber,
                alternate: null,
                effectTag: PLACEMENT,
            }
        }
        // Mark the old fiber for deletion
        if (!sameType && oldFiber) {
            oldFiber.effectTag = DELETION;
            deletions.push(oldFiber);
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling
        }
        if (index === 0) {
            // Set the child of the current fiber
            wipFiber.child = newFiber
        } else if (element && prevSibling) {
            // Set the sibling of the previous fiber
            prevSibling.sibling = newFiber
        }

        prevSibling = newFiber
        index++

    }
}




// The render function in your Fiber reconciliation system is responsible for initiating the rendering process. 
// It creates the root of the virtual DOM tree (wipRoot), sets the initial unit of work (nextUnitOfWork), 
// and kicks off the rendering process using requestIdleCallback. 
function render(element: Fiber, container: HTMLElement | Text | null) {
    if (!container) return;
    // wipFiber =>  "Work in Progress Fiber" 
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        // 上一次渲染所使用的 Fiber 树则被保存为上一个版本的 Fiber 树，并被存储在 alternate 字段中
        alternate: currentRoot,
    }

    // Initialize the list of deletions
    deletions = [];

    // Set the initial unit of work to the root
    nextUnitOfWork = wipRoot;

    // Kick off the rendering process
    requestIdleCallback(workLoop);

}


// The workLoop function in your Fiber reconciliation system is responsible for iteratively performing units of work until there are no more units of work (nextUnitOfWork becomes null)
function workLoop(deadline: IdleObject) {
    let shouldYield = false;

    // Continue the loop until there are no more units of work or time expires
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }

    // If there are no more units of work and the root is set, commit the changes
    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }

    // Log the remaining time in the console for debugging
    // console.log(deadline.timeRemaining());
    requestIdleCallback(workLoop);
}





export {
    render,
    createElement,
    createTextElement,
}