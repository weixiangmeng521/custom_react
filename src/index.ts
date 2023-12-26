// import { render, createElement } from "./custom/render";
import { render, Fiber } from "./internal/fiber";



import("./views/index.html").then((component) => {
    const container: HTMLElement | null = document.getElementById("app");
    container && render(component.default, container);
});









