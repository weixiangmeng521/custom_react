```javascript
import postcss from 'rollup-plugin-postcss';
import simplevars from 'postcss-simple-vars';
import nested from 'postcss-nested';
import cssnext from 'postcss-cssnext';
import cssnano from 'cssnano';

simplevars(),
nested(),
cssnext({ warnForDuplicates: false, }),
cssnano(),


```

``` shell
cd /cygdrive/c/Users/厕所里吃泡面/Desktop/alg/react
```

https://juejin.cn/post/6844904058394771470



``` js
import { render } from "./custom/render";

const el = Mine.createElement(
    "div",
    {id: "foo"},
    Mine.createElement("a", null, "bar"),
    Mine.createElement("b"),
)

function main() {
    const container:HTMLElement|null = document.getElementById("app")
    if(!container)return;



    // render()
}

main();
```