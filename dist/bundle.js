
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    // eslint-disable-next-line
    var requestIdleCallback = function (cb) {
      var start = Date.now();
      return setTimeout(function () {
        cb({
          didTimeout: false,
          timeRemaining: function () {
            return Math.max(0, 50 - (Date.now() - start));
          }
        });
      });
    };

    var nextUnitOfWork = null;
    var currentRoot = null;
    var wipRoot = null;
    var deletions = []; // let hookIndex:number = 0;
    // create virual element

    function createElement(type, props) {
      var children = [];

      for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
      }

      return {
        type: type,
        props: __assign(__assign({}, props), {
          children: children.map(function (child) {
            return typeof child === "object" ? child : createTextElement(child);
          })
        })
      };
    } // create text virtual element


    function createTextElement(text) {
      return {
        type: "TEXT",
        props: {
          nodeValue: text,
          children: []
        }
      };
    } // create html dom by virtual dom


    function createDom(vdom) {
      var dom = vdom.type === "TEXT" ? document.createTextNode("") : document.createElement(vdom.type || "div");
      updateDom(dom, {
        children: []
      }, vdom.props);
      return dom;
    } // update dom


    function updateDom(dom, prevProps, nextProps) {
      var isEvent = function (name) {
        return name.startsWith("on");
      };

      var isAttribute = function (name) {
        return !isEvent(name) && name != "children";
      };

      Object.keys(prevProps).filter(isEvent).forEach(function (name) {
        var eventType = name.toLowerCase().substring(2);
        dom.removeEventListener(eventType, prevProps[name]);
      });
      Object.keys(prevProps || {}).filter(isAttribute).forEach(function (name) {
        return dom[name] = null;
      });
      Object.keys(nextProps || {}).filter(isAttribute).forEach(function (name) {
        return dom[name] = nextProps[name];
      });
      Object.keys(nextProps || {}).filter(isEvent).forEach(function (name) {
        var eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, nextProps[name]);
      });
    } // commit root


    function commitRoot() {
      deletions.forEach(commitWork);
      commitWork(wipRoot === null || wipRoot === void 0 ? void 0 : wipRoot.child);
      currentRoot = wipRoot;
      wipRoot = null;
    }

    function commitWork(fiber) {
      var _a;

      if (!fiber) return;
      var domParentFiber = fiber.parent;

      while (domParentFiber && !domParentFiber.dom) {
        domParentFiber = domParentFiber.parent;
      }

      var domParent = domParentFiber === null || domParentFiber === void 0 ? void 0 : domParentFiber.dom;

      if (domParent && fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
        domParent.appendChild(fiber.dom); // console.log(wipRoot);
        // console.log(domParent);
      } else if (domParent && fiber.effectTag === "UPDATE" && fiber.dom != null) {
        updateDom(fiber.dom, ((_a = fiber === null || fiber === void 0 ? void 0 : fiber.alternate) === null || _a === void 0 ? void 0 : _a.props) || {
          children: []
        }, fiber.props);
      } else if (domParent && fiber.effectTag === "DELECTION") {
        commitDeletion(fiber, domParent);
      }

      commitWork(fiber.child);
      commitWork(fiber.sibling);
    }

    function commitDeletion(fiber, domParent) {
      if (!fiber) return;

      if (fiber.dom) {
        domParent.removeChild(fiber.dom);
      } else {
        commitDeletion(fiber.child, domParent);
      }
    }

    function performUnitOfWork(fiber) {
      var isFunctionComponent = fiber.type instanceof Function;

      if (isFunctionComponent) {
        updateFunctionComponent(fiber);
      } else {
        updateHostComponent(fiber);
      }

      if (fiber.child) return fiber.child;
      var nextFiber = fiber;

      while (nextFiber) {
        if (nextFiber.sibling) return nextFiber.sibling;
        nextFiber = nextFiber.parent;
      }
    }

    function updateFunctionComponent(fiber) {
      wipRoot = fiber; // hookIndex = 0;

      wipRoot.hooks = []; // eslint-disable-next-line

      var fn = fiber.type;
      var children = [fn(fiber.props)];
      reconcileChildren(fiber, children);
    }

    function updateHostComponent(fiber) {
      if (!fiber) return;
      fiber.dom = createDom(fiber);
      reconcileChildren(fiber, fiber.props.children || []);
    } // function useState() {
    // }


    function reconcileChildren(wipFiber, elements) {
      var index = 0;
      var oldFiber = wipFiber.alternate && wipFiber.alternate.child;
      var prevSibling = null;

      while (index < elements.length || oldFiber) {
        var element = elements[index];
        var newFiber = null;
        var sameType = oldFiber && element && element.type === oldFiber.type;

        if (sameType) {
          newFiber = {
            type: oldFiber === null || oldFiber === void 0 ? void 0 : oldFiber.type,
            props: element.props,
            dom: oldFiber === null || oldFiber === void 0 ? void 0 : oldFiber.dom,
            parent: wipFiber,
            alternate: oldFiber,
            effectTag: "UPDATE"
          };
        }

        if (!sameType && element) {
          newFiber = {
            type: element.type,
            props: element.props,
            dom: null,
            parent: wipFiber,
            alternate: null,
            effectTag: "PLACEMENT"
          };
        }

        if (!sameType && oldFiber) {
          oldFiber.effectTag = "DELECTION";
          deletions.push(oldFiber);
        }

        if (oldFiber) {
          oldFiber = oldFiber.sibling;
        }

        if (index === 0) {
          wipFiber.child = newFiber;
        } else if (element && prevSibling) {
          prevSibling.sibling = newFiber;
        }

        prevSibling = newFiber;
        index++;
      }
    }

    function render(element, container) {
      wipRoot = {
        dom: container,
        props: {
          children: [element]
        },
        alternate: currentRoot
      };
      deletions = [];
      nextUnitOfWork = wipRoot;
    }

    function workLoop(deadline) {
      var shouldYield = false;

      while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
      }

      if (!nextUnitOfWork && wipRoot) {
        commitRoot();
      } // console.log(deadline.timeRemaining());


      requestIdleCallback(workLoop);
    }

    requestIdleCallback(workLoop);

    // import { render, createElement } from "./custom/render";
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

    function main() {
      var el = createElement("div", {
        id: "foo"
      }, createElement("a", null, "bar"), createElement("b"), createElement("button", {
        id: "btn",
        onClick: function (e) {
          console.log(e);
        }
      }, "button"));
      var container = document.getElementById("app");
      container && render(el, container);
    }

    main();

}());
