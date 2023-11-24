// import { render, createElement } from "./custom/render";
import { render, createElement } from "./custom/fiber";

// @ts-ignore
import htmlFiberTree from "./example/index.html"


// function main() {
//     const container:HTMLElement|null = document.getElementById("app")
//     if(!container)return;

//     const clickEvent = (e:Event) => {
//         console.log(e);
//     }

//     const el = createElement(
//         "div",
//         {id: "foo"},
//         createElement("a", null, "bar"),
//         createElement("b"),
//         createElement("button", {
//             innerText: "button",
//             id: "btn",
//             onClick: clickEvent,
//         })
//     )

//     render(el, container);
    
// }




(function(){

    const container:HTMLElement|null = document.getElementById("app");
    container && render(htmlFiberTree, container);

    

})();

