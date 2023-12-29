<div class="container" style="padding-top: 30px">
    <div class="row">
        <div class="span12">
            <div class="hero-unit">
                <h1>Pure JavaScript HTML5 Parser {{ this.name }}</h1>
                <p>All-in-one: XML Serializer, DOM Builder, DOM Document Creator, A SAX-style API </p>
                <p>
                    <a class="btn btn-primary btn-large" href="https://github.com/blowsie/Pure-JavaScript-HTML-Parser">Learn more</a>
                </p>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="span5">
            <div style="padding: 10px">
                <form id="form">
                    <label>Input (HTML):</label><br />
                    <textarea cols="60" rows="10" id="input" style="width: 100%;"></textarea><br />
                    <input type="submit" value="Run" class="btn btn-primary" onClick="alert('12312')" />
                </form>
                <br />
                <label>Output (XML):</label><br />
                <textarea cols="60" rows="10" id="output" style="width: 100%;"></textarea>
            </div>
        </div>
        <div class="span7">
            <div style="padding: 10px">
                <p>While this library doesn't cover the full gamut of possible weirdness that HTML provides, it does handle a lot of the most obvious stuff. All of the following are accounted for:</p>
                <ul>
                    <li>Unclosed Tags:
                        <pre>HTMLtoXML("&lt;p>&lt;b>Hello") == '&lt;p>&lt;b>Hello&lt;/b>&lt;/p>'</pre>
                    </li>
                    <li>Empty Elements:
                        <pre>HTMLtoXML("&lt;img src=test.jpg>") == '&lt;img src="test.jpg">'</pre>
                    </li>
                    <li>Block vs. Inline Elements:
                        <pre>HTMLtoXML("&lt;b>Hello &lt;p>John") == '&lt;b>Hello &lt;/b>&lt;p>John&lt;/p>'</pre>
                    </li>
                    <li>Self-closing Elements:
                        <pre>HTMLtoXML("&lt;p>Hello&lt;p>World") == '&lt;p>Hello&lt;/p>&lt;p>World&lt;/p>'</pre>
                    </li>
                    <li>Attributes Without Values:
                        <pre>HTMLtoXML("&lt;input disabled>") == '&lt;input disabled="disabled">'</pre>
                    </li>
                </ul>
                <br />
                <div class="alert alert-info"><b>Note:</b> It does <b>not</b> take into account where in the document an element should exist. Right now you can put block elements in a head or th inside a p and it'll happily accept them. It's not entirely clear how the logic should work for those, but it's something that I'm open to exploring.</div>
            </div>
        </div>
    </div>
</div>