interface CustomHtmlElement{
    type?: string,
    props?: {
        [key:string]:string | string[] | CustomHtmlElement[] | EventListenerOrEventListenerObject,
        children: CustomHtmlElement[],
    },

}


export const createElement = (
    type:string|null, 
    props?:{[key:string]:(string | string[] | EventListenerOrEventListenerObject | CustomHtmlElement[])} | null, 
    ...children:(CustomHtmlElement[] | string[])
):CustomHtmlElement => {
    return {
        type: type || "div",
        props: {
            ...props,
            children: children.map((child: string | CustomHtmlElement) => 
                typeof child === "object"
                ? child
                :createTextElement(child)
            ),
        }
    }
}


export const createTextElement = (
    text?:string|null
):CustomHtmlElement => {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text || "",
            children: [],
        }
    }
}


export const render = (
    element:CustomHtmlElement, 
    container:HTMLElement
):void => {
    const { type, props } = element;
    const isTextElement:boolean = type === "TEXT_ELEMENT"
    const dom:any = isTextElement
        ? document.createTextNode("")
        : document.createElement(type || "div");

    // Add event listeners
    const isListener = (name:string) => name.startsWith("on");
    Object.keys(props || {}).filter(isListener).forEach((name:(string | EventListenerOrEventListenerObject)) => {
        if(typeof name !== "string")return
        const eventType = name.toLowerCase().substring(2);

        if(props && props[name]){
            dom.addEventListener(eventType, props[name] as EventListenerOrEventListenerObject);
        }
    });

    // Set properties
    const isAttribute = (name:string):boolean => !isListener(name) && name != "children";
    Object.keys(props || {}).filter(isAttribute).forEach((name:string) => {
        if(!props || !dom)return;
        dom[name] = props[name];
    });

    // Render children
    const children = props?.children || [];
    children.forEach((el:CustomHtmlElement) => {
        render(el, dom)
    })

    container.appendChild(dom);
}


