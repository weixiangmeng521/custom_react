import { Fiber, render } from "./internal/fiber";
import IndexComponent from "@/views/index.tpl";
import { diff, patch } from "./internal/diff";


class Component{
    private container = document.getElementById("app");
    private tree = IndexComponent.render.bind(this)();
    public name = "...";

    constructor(){
        this.rainBowRun();

        // console.log(JSON.stringify(this.tree));
    }

    async sleep(ms:number){
        await new Promise((r) => setTimeout(() => r(void 0), ms));
    }

    
    async rainBowRun(){
        await this.sleep(1000);
        this.name = "hello";
        this.update();

        // await this.sleep(1000);
        // this.name = "world";
        // this.update();   
        // this.rainBowRun();   
    }


    update(){
        const newTree = IndexComponent.render.bind(this)()
        const diffs = diff(this.tree, newTree);
        diffs.forEach((item) => {
            console.log(item.node.props.nodeValue);
        })
        patch(this.container, diffs);
        console.log(diffs.length);
    }


    render(){
        render(this.tree, this.container);
    }
}

const instance = new Component();
instance.render();