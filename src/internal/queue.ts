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
        const param = this._dequeue();
        if(!param)return;
        callback(param);
        // recursive
        setTimeout(() => this.schedule(callback), 0);
    }


}


