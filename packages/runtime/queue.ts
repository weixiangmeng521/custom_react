import { Fiber } from "./fiber";

export class EventQueue<T>{
    
    private _queue:T[] = [];

    constructor(){}

    public push(handler:T){
        this._queue.push(handler);
    }


    protected _dequeue():T | undefined{
        return this._queue.shift();
    }


    public schedule(callback:((arg:T) => void)){
        const element = this._dequeue();
        if(!element)return;
        callback(element);
        // recursive
        setTimeout(() => this.schedule(callback), 0);
    }


}


