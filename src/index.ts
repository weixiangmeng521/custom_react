// import { render, createElement } from "./custom/render";
import { render, createElement } from "./custom/fiber";
import { parse } from "./custom/html_parser/index";
import { html } from "./components/html";

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
        createElement("a", {href: "foo"}, "bar"),
        createElement("p", null, "12312"),
        createElement("button", {
            id: "btn",
            onClick: (e:Event) => {
                console.log(e);
            },
        }, "按钮")
    );
    

    const tree = parse(html);
    console.log(tree);

    const container:HTMLElement|null = document.getElementById("app");
    container && render(dom, container);
})();

