import type { Fiber } from "../packages/runtime/fiber";
import { render } from "../packages/runtime/fiber";
import IndexComponent from "@/views/index.tpl";


class Component{
    private _container = document.getElementById("app");
    public name = "...";
    public items = ["beijing", "hongkong", "tokyo"];
    public counter = 0;
    public tree:Fiber = IndexComponent.render.bind(this)();

    constructor(){
        this.rainBowRun();

    }

    async sleep(ms:number){
        await new Promise((r) => setTimeout(() => r(void 0), ms));
    }

    
    async rainBowRun(){
        await this.sleep(1000);
        this.name = "hello";
        this.items = ["beijing", "hongkong", "tokyo"];    
        this.update();

        await this.sleep(200);
        this.name = "world";
        this.items = ["beijing", "hongkong", "tokyo", "London"];    
        this.update();
        this.rainBowRun();
    }


    increase(){
        this.counter++;
        this.update();
        debugger
    }

    decrease(){
        this.counter--;
        this.update();
        debugger
    }


    update(){
        const newTree = IndexComponent.render.bind(this)();

        render(newTree, this._container);

        // this._tree = newTree;
    }


    render(){
        render(this.tree, this._container);

    }
}

const instance = new Component();
instance.render();