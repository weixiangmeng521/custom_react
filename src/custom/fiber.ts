import { requestIdleCallback, IdleObject } from "./requestIdleCallback";

// fiber node interface
export interface Fiber{
    tag?: string,
    type?: string | ((props:FiberProps) => Fiber),
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
    // Your logic to update DOM attributes, event listeners, etc.
    // Remove old attributes
    const isEvent = (name:string) => name.startsWith("on");
    const isAttribute = (name:string) => !isEvent(name) && name != "children";

    Object.keys(prevProps || {}).filter(isAttribute).forEach((name:string) => dom[name] = null);


    // Add new attributes
    Object.keys(nextProps || {}).filter(isAttribute).forEach((name:string) => dom[name] = nextProps[name]);

    // Add or remove event listeners
    Object.keys(nextProps || {}).filter(isEvent).forEach(name => {
        const eventType = name.toLowerCase().substring(2);

        let handler:(string | Fiber | string[] | Fiber[] | EventListenerOrEventListenerObject) = nextProps[name]; 
        // for template, convert string to handler function
        if(typeof nextProps[name] === "string"){
            handler = new Function((nextProps[name]) as string) as EventListenerOrEventListenerObject;
        }
        dom.addEventListener(eventType, handler);
    })

    // Add or remove event listeners
    Object.keys(prevProps).filter(isEvent).forEach((name:string) => {
        const eventType = name.toLowerCase().substring(2);
        dom.removeEventListener(eventType, prevProps[name] as EventListenerOrEventListenerObject);
    })
    
}

// commit root
function commitRoot() {
    deletions.forEach(commitWork)
    commitWork(wipRoot?.child)
    currentRoot = wipRoot
    wipRoot = null
}

// applying the changes to the actual DOM based on the effects specified
function commitWork(fiber:Fiber|null|undefined) {
    if (!fiber) return
    
    let domParentFiber = fiber.parent
    while (domParentFiber && !domParentFiber.dom) {
      domParentFiber = domParentFiber.parent
    }
    const domParent = domParentFiber?.dom

    if (domParent && fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
        // If the fiber has the PLACEMENT effect, append the DOM node to its parent
        domParent.appendChild(fiber.dom)

    }else if(
        // If the fiber has the UPDATE effect, update the DOM node with new props
        domParent && fiber.effectTag === "UPDATE" && fiber.dom != null
    ) {
        updateDom(
            fiber.dom,
            fiber?.alternate?.props || { children: [] },
            fiber.props
        );

    // If the fiber has the DELETION effect, remove the DOM node from its parent    
    } else if ( domParent && fiber.effectTag === "DELECTION") {
        commitDeletion(fiber, domParent);
    }


    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

// handling the deletion of a fiber and its associated DOM nodes.
function commitDeletion(fiber:Fiber|undefined|null, domParent:HTMLElement | Text) {
    if(!fiber)return
    if (fiber.dom) {
        // If the fiber has a DOM node, remove it from the parent
        domParent.removeChild(fiber.dom)
    } else {
        // If the fiber doesn't have a DOM node, recursively commit deletion for its children
        commitDeletion(fiber.child, domParent)
    }
}

// It's responsible for advancing the unit of work (a fiber) and performing the necessary updates to the virtual DOM based on the fiber's type
function performUnitOfWork(fiber:Fiber):Fiber | undefined {
    // Perform different tasks based on the type of the fiber
    const isFunctionComponent = typeof fiber.type === 'function';
    if(isFunctionComponent){
        updateFunctionComponent(fiber)
    } else {
        updateHostComponent(fiber)
    }

    // Return the next unit of work (fiber)
    if(fiber.child) return fiber.child;

    // If no child, traverse the sibling or move up to the parent's sibling
    let nextFiber:Fiber|undefined = fiber;
    while(nextFiber){
        if(nextFiber.sibling) return nextFiber.sibling
        nextFiber = nextFiber.parent
    }
}

// Example function to update a function component
function updateFunctionComponent(fiber:Fiber) {
    wipRoot = fiber 
    // hookIndex = 0;
    wipRoot.hooks = [];
    // eslint-disable-next-line
    const fn = fiber.type as ((props:FiberProps) => Fiber);
    const children = [fn(fiber.props)]
    reconcileChildren(fiber, children)
}


// Example function to update a host component
function updateHostComponent(fiber:Fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }
    reconcileChildren(fiber, fiber.props.children || [])
}




// It is responsible for comparing the new set of children with the old set of children and making the necessary updates to the virtual DOM.
function reconcileChildren(wipFiber:Fiber, elements:Fiber[]) {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child
    let prevSibling:Fiber | null = null;
    while(index < elements.length || oldFiber){
        let element = elements[index]
        let newFiber = null;
        const sameType = oldFiber && element && element.type === oldFiber.type;
        if(sameType){
            // Update the existing fiber with new props
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
            // Create a new fiber for a new element
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT",
            }
        }
        // Mark the old fiber for deletion
        if(!sameType && oldFiber){
            oldFiber.effectTag = "DELECTION"
            deletions.push(oldFiber)
        }
        if(oldFiber){
            oldFiber = oldFiber.sibling
        }
        if(index === 0){
            // Set the child of the current fiber
            wipFiber.child = newFiber
        }else if(element && prevSibling){
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
function render(element:Fiber, container:HTMLElement | Text) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
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
}