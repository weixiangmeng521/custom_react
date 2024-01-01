
// display template's string handler
function displayTplStr(str:any):string{
    if(str === null || str === undefined) return "";
    if(typeof str === "object") return JSON.stringify(str);
    return str;
}

// display template's array handler
function displayTplList(list:any[], callback:((value: any, index: number) => any)):any[]{
    if (!list || !Array.isArray(list)) return [];
    return list.map((item:any, index:number, array:any) => callback(item, index));
}


export {
    displayTplStr,
    displayTplList,
}