// import { render, createElement } from "./custom/render";
import { render, createElement } from "./custom/fiber";


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
    const dom = createElement(
        "div",
        {id: "foo"},
        createElement("a", null, "bar"),
        createElement("b"),
        createElement("button", {
            id: "btn",
            onClick: (e:Event) => {
                console.log(e);
            },
        }, "button")
    )


    const container:HTMLElement|null = document.getElementById("app");
    container && render(dom, container);
})();

