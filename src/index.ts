import { Fiber } from "./internal/fiber";
import IndexComponent from "@/views/index.tpl";
import { __render } from "internal/schedule";


class Component{
    private _container = document.getElementById("app");
    public tree:Fiber = IndexComponent.render.bind(this)();
    public name = "...";

    constructor(){
        this.rainBowRun();

    }

    async sleep(ms:number){
        await new Promise((r) => setTimeout(() => r(void 0), ms));
    }

    
    async rainBowRun(){
        await this.sleep(1000);
        this.name = "hello";
        this.update();

        await this.sleep(200);
        this.name = "world";
        this.update();   
        this.rainBowRun();
    }


    update(){
        const newTree = IndexComponent.render.bind(this)();

        __render(newTree, this._container);

        // this._tree = newTree;
    }


    render(){
        __render(this.tree, this._container);

    }
}

const instance = new Component();
instance.render();