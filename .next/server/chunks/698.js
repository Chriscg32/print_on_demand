exports.id = 698;
exports.ids = [698];
exports.modules = {

/***/ 6698:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(4836);

var _typeof2 = _interopRequireDefault(__webpack_require__(8698));

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(6690));

var _createClass2 = _interopRequireDefault(__webpack_require__(9728));

var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(4993));

var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(3808));

var _inherits2 = _interopRequireDefault(__webpack_require__(1655));

function _callSuper(_this, derived, args) {
  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      return !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    } catch (e) {
      return false;
    }
  }

  derived = (0, _getPrototypeOf2["default"])(derived);
  return (0, _possibleConstructorReturn2["default"])(_this, isNativeReflectConstruct() ? Reflect.construct(derived, args || [], (0, _getPrototypeOf2["default"])(_this).constructor) : derived.apply(_this, args));
}

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "default", ({
  enumerable: true,
  get: function get() {
    return Error;
  }
}));

var _interop_require_default = __webpack_require__(167);

var _react = /*#__PURE__*/_interop_require_default._(__webpack_require__(6689));

var _head = /*#__PURE__*/_interop_require_default._(__webpack_require__(1597));

var statusCodes = {
  400: "Bad Request",
  404: "This page could not be found",
  405: "Method Not Allowed",
  500: "Internal Server Error"
};

function _getInitialProps(param) {
  var res = param.res,
      err = param.err;
  var statusCode = res && res.statusCode ? res.statusCode : err ? err.statusCode : 404;
  return {
    statusCode: statusCode
  };
}

var styles = {
  error: {
    // https://github.com/sindresorhus/modern-normalize/blob/main/modern-normalize.css#L38-L52
    fontFamily: 'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
    height: "100vh",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  desc: {
    lineHeight: "48px"
  },
  h1: {
    display: "inline-block",
    margin: "0 20px 0 0",
    paddingRight: 23,
    fontSize: 24,
    fontWeight: 500,
    verticalAlign: "top"
  },
  h2: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: "28px"
  },
  wrap: {
    display: "inline-block"
  }
};

var Error = /*#__PURE__*/function (_react$default$Compon) {
  function Error() {
    (0, _classCallCheck2["default"])(this, Error);
    return _callSuper(this, Error, arguments);
  }

  (0, _inherits2["default"])(Error, _react$default$Compon);
  return (0, _createClass2["default"])(Error, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          statusCode = _this$props.statusCode,
          _this$props$withDarkM = _this$props.withDarkMode,
          withDarkMode = _this$props$withDarkM === void 0 ? true : _this$props$withDarkM;
      var title = this.props.title || statusCodes[statusCode] || "An unexpected error has occurred";
      return /*#__PURE__*/_react["default"].createElement("div", {
        style: styles.error
      }, /*#__PURE__*/_react["default"].createElement(_head["default"], null, /*#__PURE__*/_react["default"].createElement("title", null, statusCode ? statusCode + ": " + title : "Application error: a client-side exception has occurred")), /*#__PURE__*/_react["default"].createElement("div", {
        style: styles.desc
      }, /*#__PURE__*/_react["default"].createElement("style", {
        dangerouslySetInnerHTML: {
          /* CSS minified from
          body { margin: 0; color: #000; background: #fff; }
          .next-error-h1 {
            border-right: 1px solid rgba(0, 0, 0, .3);
          }
           ${
            withDarkMode
              ? `@media (prefers-color-scheme: dark) {
            body { color: #fff; background: #000; }
            .next-error-h1 {
              border-right: 1px solid rgba(255, 255, 255, .3);
            }
          }`
              : ''
          }
          */
          __html: "body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}" + (withDarkMode ? "@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}" : "")
        }
      }), statusCode ? /*#__PURE__*/_react["default"].createElement("h1", {
        className: "next-error-h1",
        style: styles.h1
      }, statusCode) : null, /*#__PURE__*/_react["default"].createElement("div", {
        style: styles.wrap
      }, /*#__PURE__*/_react["default"].createElement("h2", {
        style: styles.h2
      }, this.props.title || statusCode ? title : /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, "Application error: a client-side exception has occurred (see the browser console for more information)"), "."))));
    }
  }]);
}(_react["default"].Component);

(function () {
  Error.displayName = "ErrorPage";
})();

(function () {
  Error.getInitialProps = _getInitialProps;
})();

(function () {
  Error.origGetInitialProps = _getInitialProps;
})();

if ((typeof exports["default"] === 'function' || (0, _typeof2["default"])(exports["default"]) === 'object' && exports["default"] !== null) && typeof exports["default"].__esModule === 'undefined') {
  Object.defineProperty(exports["default"], '__esModule', {
    value: true
  });
  Object.assign(exports["default"], exports);
  module.exports = exports["default"];
}

/***/ }),

/***/ 1597:
/***/ ((module, exports, __webpack_require__) => {

"use client";
"use strict";

var _interopRequireDefault = __webpack_require__(4836);

var _typeof2 = _interopRequireDefault(__webpack_require__(8698));

var _defineProperty2 = _interopRequireDefault(__webpack_require__(8416));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
0 && (0);

function _export(target, all) {
  for (var name in all) Object.defineProperty(target, name, {
    enumerable: true,
    get: all[name]
  });
}

_export(exports, {
  defaultHead: function defaultHead() {
    return _defaultHead;
  },
  "default": function _default() {
    return _default2;
  }
});

var _interop_require_default = __webpack_require__(167);

var _interop_require_wildcard = __webpack_require__(8760);

var _react = /*#__PURE__*/_interop_require_wildcard._(__webpack_require__(6689));

var _sideeffect = /*#__PURE__*/_interop_require_default._(__webpack_require__(2470));

var _ampcontext = __webpack_require__(3918);

var _headmanagercontext = __webpack_require__(2796);

var _ampmode = __webpack_require__(5732);

var _warnonce = __webpack_require__(618);

function _defaultHead(inAmpMode) {
  if (inAmpMode === void 0) inAmpMode = false;
  var head = [/*#__PURE__*/_react["default"].createElement("meta", {
    charSet: "utf-8"
  })];

  if (!inAmpMode) {
    head.push( /*#__PURE__*/_react["default"].createElement("meta", {
      name: "viewport",
      content: "width=device-width"
    }));
  }

  return head;
}

function onlyReactElement(list, child) {
  // React children can be "string" or "number" in this case we ignore them for backwards compat
  if (typeof child === "string" || typeof child === "number") {
    return list;
  } // Adds support for React.Fragment


  if (child.type === _react["default"].Fragment) {
    return list.concat( // @ts-expect-error @types/react does not remove fragments but this could also return ReactPortal[]
    _react["default"].Children.toArray(child.props.children).reduce( // @ts-expect-error @types/react does not remove fragments but this could also return ReactPortal[]
    function (fragmentList, fragmentChild) {
      if (typeof fragmentChild === "string" || typeof fragmentChild === "number") {
        return fragmentList;
      }

      return fragmentList.concat(fragmentChild);
    }, []));
  }

  return list.concat(child);
}

var METATYPES = ["name", "httpEquiv", "charSet", "itemProp"];
/*
 returns a function for filtering head child elements
 which shouldn't be duplicated, like <title/>
 Also adds support for deduplicated `key` properties
*/

function unique() {
  var keys = new Set();
  var tags = new Set();
  var metaTypes = new Set();
  var metaCategories = {};
  return function (h) {
    var isUnique = true;
    var hasKey = false;

    if (h.key && typeof h.key !== "number" && h.key.indexOf("$") > 0) {
      hasKey = true;
      var key = h.key.slice(h.key.indexOf("$") + 1);

      if (keys.has(key)) {
        isUnique = false;
      } else {
        keys.add(key);
      }
    } // eslint-disable-next-line default-case


    switch (h.type) {
      case "title":
      case "base":
        if (tags.has(h.type)) {
          isUnique = false;
        } else {
          tags.add(h.type);
        }

        break;

      case "meta":
        for (var i = 0, len = METATYPES.length; i < len; i++) {
          var metatype = METATYPES[i];
          if (!h.props.hasOwnProperty(metatype)) continue;

          if (metatype === "charSet") {
            if (metaTypes.has(metatype)) {
              isUnique = false;
            } else {
              metaTypes.add(metatype);
            }
          } else {
            var category = h.props[metatype];
            var categories = metaCategories[metatype] || new Set();

            if ((metatype !== "name" || !hasKey) && categories.has(category)) {
              isUnique = false;
            } else {
              categories.add(category);
              metaCategories[metatype] = categories;
            }
          }
        }

        break;
    }

    return isUnique;
  };
}
/**
 *
 * @param headChildrenElements List of children of <Head>
 */


function reduceComponents(headChildrenElements, props) {
  var inAmpMode = props.inAmpMode;
  return headChildrenElements.reduce(onlyReactElement, []).reverse().concat(_defaultHead(inAmpMode).reverse()).filter(unique()).reverse().map(function (c, i) {
    var key = c.key || i;

    if ( true && !inAmpMode) {
      if (c.type === "link" && c.props["href"] && // TODO(prateekbh@): Replace this with const from `constants` when the tree shaking works.
      ["https://fonts.googleapis.com/css", "https://use.typekit.net/"].some(function (url) {
        return c.props["href"].startsWith(url);
      })) {
        var newProps = _objectSpread({}, c.props || {});

        newProps["data-href"] = newProps["href"];
        newProps["href"] = undefined; // Add this attribute to make it easy to identify optimized tags

        newProps["data-optimized-fonts"] = true;
        return /*#__PURE__*/_react["default"].cloneElement(c, newProps);
      }
    }

    if (false) { var srcMessage; }

    return /*#__PURE__*/_react["default"].cloneElement(c, {
      key: key
    });
  });
}
/**
 * This component injects elements to `<head>` of your page.
 * To avoid duplicated `tags` in `<head>` you can use the `key` property, which will make sure every tag is only rendered once.
 */


function Head(param) {
  var children = param.children;
  var ampState = (0, _react.useContext)(_ampcontext.AmpStateContext);
  var headManager = (0, _react.useContext)(_headmanagercontext.HeadManagerContext);
  return /*#__PURE__*/_react["default"].createElement(_sideeffect["default"], {
    reduceComponentsToState: reduceComponents,
    headManager: headManager,
    inAmpMode: (0, _ampmode.isInAmpMode)(ampState)
  }, children);
}

var _default2 = Head;

if ((typeof exports["default"] === 'function' || (0, _typeof2["default"])(exports["default"]) === 'object' && exports["default"] !== null) && typeof exports["default"].__esModule === 'undefined') {
  Object.defineProperty(exports["default"], '__esModule', {
    value: true
  });
  Object.assign(exports["default"], exports);
  module.exports = exports["default"];
}

/***/ }),

/***/ 167:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


exports._ = exports._interop_require_default = _interop_require_default;
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}


/***/ }),

/***/ 8760:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;

    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();

    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
exports._ = exports._interop_require_wildcard = _interop_require_wildcard;
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) return obj;
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") return { default: obj };

    var cache = _getRequireWildcardCache(nodeInterop);

    if (cache && cache.has(obj)) return cache.get(obj);

    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;

    for (var key in obj) {
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) Object.defineProperty(newObj, key, desc);
            else newObj[key] = obj[key];
        }
    }

    newObj.default = obj;

    if (cache) cache.set(obj, newObj);

    return newObj;
}


/***/ })

};
;