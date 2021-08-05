import { requestIdleCallback, IdleObject } from "./requestIdleCallback";

export interface Fiber{
    tag?: string,
    type?: string | ((props:FiberProps) => Fiber),
    parent?: Fiber,
    child?: Fiber | null,
    sibling?: Fiber | null,
    alternate?: Fiber | null,
    stateNode?: HTMLElement | Text,
    props: FiberProps,
    partialState?: Fiber | null,
    effectTag?: string,
    hooks?: [],
    dom?: Text | HTMLElement | null,
}

export interface FiberProps {
    [key:string]:string | string[] | Fiber[] | Fiber | EventListenerOrEventListenerObject,
    children: Fiber[],
}


let nextUnitOfWork:Fiber|null|undefined = null
let currentRoot:Fiber|null = null
let wipRoot:Fiber|null  = null
let deletions:Fiber[]  = []
// let hookIndex:number = 0;

// create virual element
function createElement(
    type:(string | (() => Fiber)), 
    props?: {
        [key:string]:string | string[] | Fiber[] | EventListenerOrEventListenerObject,
    } | null,
    ...children:(Fiber[] | string[])
):Fiber{
    return {
        type: type,
        props: {
            ...props,
            children: children.map((child:Fiber | string) => 
                typeof child === "object" ? child : createTextElement(child)
            )
        },
    }
}

// create text virtual element
function createTextElement(text:string):Fiber {
    return {
        type: "TEXT",
        props: {
            nodeValue: text,
            children: [],
        },
    }
}

// create html dom by virtual dom
function createDom(vdom:Fiber) {
    const dom = vdom.type === "TEXT"
    ? document.createTextNode("")
    : document.createElement((vdom.type as string) || "div");
    
    updateDom(dom, {children: []}, vdom.props)
    return dom;
}

// update dom
function updateDom(dom:any, prevProps:FiberProps, nextProps:FiberProps) {
    const isEvent = (name:string) => name.startsWith("on");
    const isAttribute = (name:string) => !isEvent(name) && name != "children";

    Object.keys(prevProps).filter(isEvent).forEach((name:string) => {
        const eventType = name.toLowerCase().substring(2);
        dom.removeEventListener(eventType, prevProps[name] as EventListenerOrEventListenerObject);
    })
    
    Object.keys(prevProps || {}).filter(isAttribute).forEach((name:string) => dom[name] = null);

    Object.keys(nextProps || {}).filter(isAttribute).forEach((name:string) => dom[name] = nextProps[name]);

    Object.keys(nextProps || {}).filter(isEvent).forEach(name => {
        const eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, nextProps[name]);
    })
}

// commit root
function commitRoot() {
    deletions.forEach(commitWork)
    commitWork(wipRoot?.child)
    currentRoot = wipRoot
    wipRoot = null
}

function commitWork(fiber:Fiber|null|undefined) {
    if (!fiber) return
    
    let domParentFiber = fiber.parent
    while (domParentFiber && !domParentFiber.dom) {
      domParentFiber = domParentFiber.parent
    }
    const domParent = domParentFiber?.dom

    if (
        domParent &&
        fiber.effectTag === "PLACEMENT" &&
        fiber.dom != null
    ) {
        domParent.appendChild(fiber.dom)

        // console.log(wipRoot);
        // console.log(domParent);
        
    } else if (
        domParent &&
        fiber.effectTag === "UPDATE" &&
        fiber.dom != null
    ) {
        updateDom(
            fiber.dom,
            fiber?.alternate?.props || { children: [] },
            fiber.props
        )
    } else if (
        domParent &&
        fiber.effectTag === "DELECTION") 
    {
        commitDeletion(fiber, domParent)
    }


    commitWork(fiber.child)
    commitWork(fiber.sibling)
}


function commitDeletion(fiber:Fiber|undefined|null, domParent:HTMLElement | Text) {
    if(!fiber)return
    if (fiber.dom) {
        domParent.removeChild(fiber.dom)
    } else {
        commitDeletion(fiber.child, domParent)
    }
}


function performUnitOfWork(fiber:Fiber):Fiber | undefined {
    const isFunctionComponent = fiber.type instanceof Function
    if(isFunctionComponent){
        updateFunctionComponent(fiber)
    } else {
        updateHostComponent(fiber)
    }

    if(fiber.child)return fiber.child

    let nextFiber:Fiber|null|undefined = fiber
    while(nextFiber){
        if(nextFiber.sibling) return nextFiber.sibling
        nextFiber = nextFiber.parent
    }
}


function updateFunctionComponent(fiber:Fiber) {
    wipRoot = fiber 
    // hookIndex = 0;
    wipRoot.hooks = [];
    // eslint-disable-next-line
    const fn = fiber.type as ((props:FiberProps) => Fiber);
    const children = [fn(fiber.props)]
    reconcileChildren(fiber, children)
}


function updateHostComponent(fiber:Fiber | null | undefined) {
    if(!fiber)return
    fiber.dom = createDom(fiber)
    reconcileChildren(fiber, fiber.props.children || [])
}


// function useState() {
    
// }



function reconcileChildren(wipFiber:Fiber, elements:Fiber[]) {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child
    let prevSibling:Fiber | null = null;
    while(index < elements.length || oldFiber){
        let element = elements[index]
        let newFiber = null;
        const sameType = oldFiber && element && element.type === oldFiber.type;
        if(sameType){
            newFiber = {
                type: oldFiber?.type,
                props: element.props,
                dom: oldFiber?.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE",
            }
        }
        if(!sameType && element){
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT",
            }
        }
        if(!sameType && oldFiber){
            oldFiber.effectTag = "DELECTION"
            deletions.push(oldFiber)
        }
        if(oldFiber){
            oldFiber = oldFiber.sibling
        }
        if(index === 0){
            wipFiber.child = newFiber
        }else if(element && prevSibling){
            prevSibling.sibling = newFiber
        }
        prevSibling = newFiber
        index++

    }
}


function render(element:Fiber, container:HTMLElement | Text) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot,
    }

    deletions = [];
    nextUnitOfWork = wipRoot;
}


function workLoop(deadline:IdleObject) {
    let shouldYield = false;
    while(nextUnitOfWork && !shouldYield){
        nextUnitOfWork = performUnitOfWork(
            nextUnitOfWork
        )
        shouldYield = deadline.timeRemaining() < 1
    }
    if(!nextUnitOfWork && wipRoot){
        commitRoot()
    }

    // console.log(deadline.timeRemaining());
    requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)





export {
    render,
    createElement,
}