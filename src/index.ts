// import { render, createElement } from "./custom/render";
import { render } from "./internal/fiber";


import("./views/index.tpl").then((component) => {
    const container: HTMLElement | null = document.getElementById("app");
    container && render(component.default, container);
});

