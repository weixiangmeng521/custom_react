import { Fiber } from "./fiber";
import { EventQueue } from "./queue";
import { render } from "./fiber";

const renderQueue:EventQueue<Fiber> = new EventQueue();
let container: HTMLElement | Text | null;



export function add2RenderQueue(rootFiber:Fiber|null){
    if(!rootFiber) throw new Error("ERR: cannot render null rootFiber.");
    renderQueue.push(rootFiber);
}


export function __render(fiberNode:Fiber|null|undefined, _container?: HTMLElement | Text | null ){
    if(!fiberNode)return;
    // bind once
    if(!container && _container) { 
        container = _container;
    }
    
    // async 
    render(fiberNode, container);
    // if commit then push to renderQueue;
}



export function schedule(){
    renderQueue.schedule((rootFiber:Fiber) => {
        
        
    });
}
