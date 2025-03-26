exports.id = 167;
exports.ids = [167];
exports.modules = {

/***/ 1492:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(4836);

var _classCallCheck2 = _interopRequireDefault(__webpack_require__(6690));

var _createClass2 = _interopRequireDefault(__webpack_require__(9728));

var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(4993));

var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(3808));

var _inherits2 = _interopRequireDefault(__webpack_require__(1655));

var _defineProperty2 = _interopRequireDefault(__webpack_require__(8416));

var _objectWithoutProperties2 = _interopRequireDefault(__webpack_require__(215));

var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(861));

var _Head2, _NextScript2;

var _excluded = ["strategy", "src", "children", "dangerouslySetInnerHTML"],
    _excluded2 = ["strategy"],
    _excluded3 = ["crossOrigin", "nonce"],
    _excluded4 = ["strategy", "children", "dangerouslySetInnerHTML", "src"];

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
  Head: function Head() {
    return _Head;
  },
  NextScript: function NextScript() {
    return _NextScript;
  },
  Html: function Html() {
    return _Html;
  },
  Main: function Main() {
    return _Main;
  },

  /**
  * `Document` component handles the initial `document` markup and renders only on the server side.
  * Commonly used for implementing server side rendering for `css-in-js` libraries.
  */
  "default": function _default() {
    return Document;
  }
});

var _react = /*#__PURE__*/_interop_require_default(__webpack_require__(6689));

var _constants = __webpack_require__(6724);

var _getpagefiles = __webpack_require__(4140);

var _htmlescape = __webpack_require__(9716);

var _iserror = /*#__PURE__*/_interop_require_default(__webpack_require__(676));

var _htmlcontext = __webpack_require__(8743);

function _interop_require_default(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}
/** Set of pages that have triggered a large data warning on production mode. */


var largePageDataWarnings = new Set();

function getDocumentFiles(buildManifest, pathname, inAmpMode) {
  var sharedFiles = (0, _getpagefiles.getPageFiles)(buildManifest, "/_app");
  var pageFiles =  true && inAmpMode ? [] : (0, _getpagefiles.getPageFiles)(buildManifest, pathname);
  return {
    sharedFiles: sharedFiles,
    pageFiles: pageFiles,
    allFiles: (0, _toConsumableArray2["default"])(new Set([].concat((0, _toConsumableArray2["default"])(sharedFiles), (0, _toConsumableArray2["default"])(pageFiles))))
  };
}

function _getPolyfillScripts(context, props) {
  // polyfills.js has to be rendered as nomodule without async
  // It also has to be the first script to load
  var assetPrefix = context.assetPrefix,
      buildManifest = context.buildManifest,
      assetQueryString = context.assetQueryString,
      disableOptimizedLoading = context.disableOptimizedLoading,
      crossOrigin = context.crossOrigin;
  return buildManifest.polyfillFiles.filter(function (polyfill) {
    return polyfill.endsWith(".js") && !polyfill.endsWith(".module.js");
  }).map(function (polyfill) {
    return /*#__PURE__*/_react["default"].createElement("script", {
      key: polyfill,
      defer: !disableOptimizedLoading,
      nonce: props.nonce,
      crossOrigin: props.crossOrigin || crossOrigin,
      noModule: true,
      src: "".concat(assetPrefix, "/_next/").concat(polyfill).concat(assetQueryString)
    });
  });
}

function hasComponentProps(child) {
  return !!child && !!child.props;
}

function AmpStyles(_ref) {
  var styles = _ref.styles;
  if (!styles) return null; // try to parse styles from fragment for backwards compat

  var curStyles = Array.isArray(styles) ? styles : [];

  if ( // @ts-ignore Property 'props' does not exist on type ReactElement
  styles.props && // @ts-ignore Property 'props' does not exist on type ReactElement
  Array.isArray(styles.props.children)) {
    var hasStyles = function hasStyles(el) {
      var _el_props, _el_props_dangerouslySetInnerHTML;

      return el == null ? void 0 : (_el_props = el.props) == null ? void 0 : (_el_props_dangerouslySetInnerHTML = _el_props.dangerouslySetInnerHTML) == null ? void 0 : _el_props_dangerouslySetInnerHTML.__html;
    }; // @ts-ignore Property 'props' does not exist on type ReactElement


    styles.props.children.forEach(function (child) {
      if (Array.isArray(child)) {
        child.forEach(function (el) {
          return hasStyles(el) && curStyles.push(el);
        });
      } else if (hasStyles(child)) {
        curStyles.push(child);
      }
    });
  }
  /* Add custom styles before AMP styles to prevent accidental overrides */


  return /*#__PURE__*/_react["default"].createElement("style", {
    "amp-custom": "",
    dangerouslySetInnerHTML: {
      __html: curStyles.map(function (style) {
        return style.props.dangerouslySetInnerHTML.__html;
      }).join("").replace(/\/\*# sourceMappingURL=.*\*\//g, "").replace(/\/\*@ sourceURL=.*?\*\//g, "")
    }
  });
}

function _getDynamicChunks(context, props, files) {
  var dynamicImports = context.dynamicImports,
      assetPrefix = context.assetPrefix,
      isDevelopment = context.isDevelopment,
      assetQueryString = context.assetQueryString,
      disableOptimizedLoading = context.disableOptimizedLoading,
      crossOrigin = context.crossOrigin;
  return dynamicImports.map(function (file) {
    if (!file.endsWith(".js") || files.allFiles.includes(file)) return null;
    return /*#__PURE__*/_react["default"].createElement("script", {
      async: !isDevelopment && disableOptimizedLoading,
      defer: !disableOptimizedLoading,
      key: file,
      src: "".concat(assetPrefix, "/_next/").concat(encodeURI(file)).concat(assetQueryString),
      nonce: props.nonce,
      crossOrigin: props.crossOrigin || crossOrigin
    });
  });
}

function _getScripts(context, props, files) {
  var _buildManifest_lowPriorityFiles;

  var assetPrefix = context.assetPrefix,
      buildManifest = context.buildManifest,
      isDevelopment = context.isDevelopment,
      assetQueryString = context.assetQueryString,
      disableOptimizedLoading = context.disableOptimizedLoading,
      crossOrigin = context.crossOrigin;
  var normalScripts = files.allFiles.filter(function (file) {
    return file.endsWith(".js");
  });
  var lowPriorityScripts = (_buildManifest_lowPriorityFiles = buildManifest.lowPriorityFiles) == null ? void 0 : _buildManifest_lowPriorityFiles.filter(function (file) {
    return file.endsWith(".js");
  });
  return [].concat((0, _toConsumableArray2["default"])(normalScripts), (0, _toConsumableArray2["default"])(lowPriorityScripts)).map(function (file) {
    return /*#__PURE__*/_react["default"].createElement("script", {
      key: file,
      src: "".concat(assetPrefix, "/_next/").concat(encodeURI(file)).concat(assetQueryString),
      nonce: props.nonce,
      async: !isDevelopment && disableOptimizedLoading,
      defer: !disableOptimizedLoading,
      crossOrigin: props.crossOrigin || crossOrigin
    });
  });
}

function getPreNextWorkerScripts(context, props) {
  var assetPrefix = context.assetPrefix,
      scriptLoader = context.scriptLoader,
      crossOrigin = context.crossOrigin,
      nextScriptWorkers = context.nextScriptWorkers; // disable `nextScriptWorkers` in edge runtime

  if (!nextScriptWorkers || "nodejs" === "edge") return null;

  try {
    var _non_webpack_require2 = require("@builder.io/partytown/integration"),
        partytownSnippet = _non_webpack_require2.partytownSnippet;

    var children = Array.isArray(props.children) ? props.children : [props.children]; // Check to see if the user has defined their own Partytown configuration

    var userDefinedConfig = children.find(function (child) {
      var _child_props, _child_props_dangerouslySetInnerHTML;

      return hasComponentProps(child) && (child == null ? void 0 : (_child_props = child.props) == null ? void 0 : (_child_props_dangerouslySetInnerHTML = _child_props.dangerouslySetInnerHTML) == null ? void 0 : _child_props_dangerouslySetInnerHTML.__html.length) && "data-partytown-config" in child.props;
    });
    return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, !userDefinedConfig && /*#__PURE__*/_react["default"].createElement("script", {
      "data-partytown-config": "",
      dangerouslySetInnerHTML: {
        __html: "\n            partytown = {\n              lib: \"".concat(assetPrefix, "/_next/static/~partytown/\"\n            };\n          ")
      }
    }), /*#__PURE__*/_react["default"].createElement("script", {
      "data-partytown": "",
      dangerouslySetInnerHTML: {
        __html: partytownSnippet()
      }
    }), (scriptLoader.worker || []).map(function (file, index) {
      var strategy = file.strategy,
          src = file.src,
          scriptChildren = file.children,
          dangerouslySetInnerHTML = file.dangerouslySetInnerHTML,
          scriptProps = (0, _objectWithoutProperties2["default"])(file, _excluded);
      var srcProps = {};

      if (src) {
        // Use external src if provided
        srcProps.src = src;
      } else if (dangerouslySetInnerHTML && dangerouslySetInnerHTML.__html) {
        // Embed inline script if provided with dangerouslySetInnerHTML
        srcProps.dangerouslySetInnerHTML = {
          __html: dangerouslySetInnerHTML.__html
        };
      } else if (scriptChildren) {
        // Embed inline script if provided with children
        srcProps.dangerouslySetInnerHTML = {
          __html: typeof scriptChildren === "string" ? scriptChildren : Array.isArray(scriptChildren) ? scriptChildren.join("") : ""
        };
      } else {
        throw new Error("Invalid usage of next/script. Did you forget to include a src attribute or an inline script? https://nextjs.org/docs/messages/invalid-script");
      }

      return /*#__PURE__*/_react["default"].createElement("script", _objectSpread(_objectSpread(_objectSpread({}, srcProps), scriptProps), {}, {
        type: "text/partytown",
        key: src || index,
        nonce: props.nonce,
        "data-nscript": "worker",
        crossOrigin: props.crossOrigin || crossOrigin
      }));
    }));
  } catch (err) {
    if ((0, _iserror["default"])(err) && err.code !== "MODULE_NOT_FOUND") {
      console.warn("Warning: ".concat(err.message));
    }

    return null;
  }
}

function _getPreNextScripts(context, props) {
  var scriptLoader = context.scriptLoader,
      disableOptimizedLoading = context.disableOptimizedLoading,
      crossOrigin = context.crossOrigin;
  var webWorkerScripts = getPreNextWorkerScripts(context, props);
  var beforeInteractiveScripts = (scriptLoader.beforeInteractive || []).filter(function (script) {
    return script.src;
  }).map(function (file, index) {
    var _scriptProps$defer;

    var strategy = file.strategy,
        scriptProps = (0, _objectWithoutProperties2["default"])(file, _excluded2);
    return /*#__PURE__*/_react["default"].createElement("script", _objectSpread(_objectSpread({}, scriptProps), {}, {
      key: scriptProps.src || index,
      defer: (_scriptProps$defer = scriptProps.defer) !== null && _scriptProps$defer !== void 0 ? _scriptProps$defer : !disableOptimizedLoading,
      nonce: props.nonce,
      "data-nscript": "beforeInteractive",
      crossOrigin: props.crossOrigin || crossOrigin
    }));
  });
  return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, webWorkerScripts, beforeInteractiveScripts);
}

function getHeadHTMLProps(props) {
  var crossOrigin = props.crossOrigin,
      nonce = props.nonce,
      restProps = (0, _objectWithoutProperties2["default"])(props, _excluded3); // This assignment is necessary for additional type checking to avoid unsupported attributes in <head>

  var headProps = restProps;
  return headProps;
}

function getAmpPath(ampPath, asPath) {
  return ampPath || "".concat(asPath).concat(asPath.includes("?") ? "&" : "?", "amp=1");
}

function getNextFontLinkTags(nextFontManifest, dangerousAsPath) {
  var assetPrefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";

  if (!nextFontManifest) {
    return {
      preconnect: null,
      preload: null
    };
  }

  var appFontsEntry = nextFontManifest.pages["/_app"];
  var pageFontsEntry = nextFontManifest.pages[dangerousAsPath];
  var preloadedFontFiles = [].concat((0, _toConsumableArray2["default"])(appFontsEntry !== null && appFontsEntry !== void 0 ? appFontsEntry : []), (0, _toConsumableArray2["default"])(pageFontsEntry !== null && pageFontsEntry !== void 0 ? pageFontsEntry : [])); // If no font files should preload but there's an entry for the path, add a preconnect tag.

  var preconnectToSelf = !!(preloadedFontFiles.length === 0 && (appFontsEntry || pageFontsEntry));
  return {
    preconnect: preconnectToSelf ? /*#__PURE__*/_react["default"].createElement("link", {
      "data-next-font": nextFontManifest.pagesUsingSizeAdjust ? "size-adjust" : "",
      rel: "preconnect",
      href: "/",
      crossOrigin: "anonymous"
    }) : null,
    preload: preloadedFontFiles ? preloadedFontFiles.map(function (fontFile) {
      var ext = /\.(woff|woff2|eot|ttf|otf)$/.exec(fontFile)[1];
      return /*#__PURE__*/_react["default"].createElement("link", {
        key: fontFile,
        rel: "preload",
        href: "".concat(assetPrefix, "/_next/").concat(encodeURI(fontFile)),
        as: "font",
        type: "font/".concat(ext),
        crossOrigin: "anonymous",
        "data-next-font": fontFile.includes("-s") ? "size-adjust" : ""
      });
    }) : null
  };
}

var _Head = /*#__PURE__*/function (_react$default$Compon) {
  function _Head() {
    (0, _classCallCheck2["default"])(this, _Head);
    return _callSuper(this, _Head, arguments);
  }

  (0, _inherits2["default"])(_Head, _react$default$Compon);
  return (0, _createClass2["default"])(_Head, [{
    key: "getCssLinks",
    value: function getCssLinks(files) {
      var _this2 = this;

      var _this$context = this.context,
          assetPrefix = _this$context.assetPrefix,
          assetQueryString = _this$context.assetQueryString,
          dynamicImports = _this$context.dynamicImports,
          crossOrigin = _this$context.crossOrigin,
          optimizeCss = _this$context.optimizeCss,
          optimizeFonts = _this$context.optimizeFonts;
      var cssFiles = files.allFiles.filter(function (f) {
        return f.endsWith(".css");
      });
      var sharedFiles = new Set(files.sharedFiles); // Unmanaged files are CSS files that will be handled directly by the
      // webpack runtime (`mini-css-extract-plugin`).

      var unmangedFiles = new Set([]);
      var dynamicCssFiles = Array.from(new Set(dynamicImports.filter(function (file) {
        return file.endsWith(".css");
      })));

      if (dynamicCssFiles.length) {
        var existing = new Set(cssFiles);
        dynamicCssFiles = dynamicCssFiles.filter(function (f) {
          return !(existing.has(f) || sharedFiles.has(f));
        });
        unmangedFiles = new Set(dynamicCssFiles);
        cssFiles.push.apply(cssFiles, (0, _toConsumableArray2["default"])(dynamicCssFiles));
      }

      var cssLinkElements = [];
      cssFiles.forEach(function (file) {
        var isSharedFile = sharedFiles.has(file);

        if (!optimizeCss) {
          cssLinkElements.push( /*#__PURE__*/_react["default"].createElement("link", {
            key: "".concat(file, "-preload"),
            nonce: _this2.props.nonce,
            rel: "preload",
            href: "".concat(assetPrefix, "/_next/").concat(encodeURI(file)).concat(assetQueryString),
            as: "style",
            crossOrigin: _this2.props.crossOrigin || crossOrigin
          }));
        }

        var isUnmanagedFile = unmangedFiles.has(file);
        cssLinkElements.push( /*#__PURE__*/_react["default"].createElement("link", {
          key: file,
          nonce: _this2.props.nonce,
          rel: "stylesheet",
          href: "".concat(assetPrefix, "/_next/").concat(encodeURI(file)).concat(assetQueryString),
          crossOrigin: _this2.props.crossOrigin || crossOrigin,
          "data-n-g": isUnmanagedFile ? undefined : isSharedFile ? "" : undefined,
          "data-n-p": isUnmanagedFile ? undefined : isSharedFile ? undefined : ""
        }));
      });

      if ( true && optimizeFonts) {
        cssLinkElements = this.makeStylesheetInert(cssLinkElements);
      }

      return cssLinkElements.length === 0 ? null : cssLinkElements;
    }
  }, {
    key: "getPreloadDynamicChunks",
    value: function getPreloadDynamicChunks() {
      var _this3 = this;

      var _this$context2 = this.context,
          dynamicImports = _this$context2.dynamicImports,
          assetPrefix = _this$context2.assetPrefix,
          assetQueryString = _this$context2.assetQueryString,
          crossOrigin = _this$context2.crossOrigin;
      return dynamicImports.map(function (file) {
        if (!file.endsWith(".js")) {
          return null;
        }

        return /*#__PURE__*/_react["default"].createElement("link", {
          rel: "preload",
          key: file,
          href: "".concat(assetPrefix, "/_next/").concat(encodeURI(file)).concat(assetQueryString),
          as: "script",
          nonce: _this3.props.nonce,
          crossOrigin: _this3.props.crossOrigin || crossOrigin
        });
      }) // Filter out nulled scripts
      .filter(Boolean);
    }
  }, {
    key: "getPreloadMainLinks",
    value: function getPreloadMainLinks(files) {
      var _this4 = this;

      var _this$context3 = this.context,
          assetPrefix = _this$context3.assetPrefix,
          assetQueryString = _this$context3.assetQueryString,
          scriptLoader = _this$context3.scriptLoader,
          crossOrigin = _this$context3.crossOrigin;
      var preloadFiles = files.allFiles.filter(function (file) {
        return file.endsWith(".js");
      });
      return [].concat((0, _toConsumableArray2["default"])((scriptLoader.beforeInteractive || []).map(function (file) {
        return /*#__PURE__*/_react["default"].createElement("link", {
          key: file.src,
          nonce: _this4.props.nonce,
          rel: "preload",
          href: file.src,
          as: "script",
          crossOrigin: _this4.props.crossOrigin || crossOrigin
        });
      })), (0, _toConsumableArray2["default"])(preloadFiles.map(function (file) {
        return /*#__PURE__*/_react["default"].createElement("link", {
          key: file,
          nonce: _this4.props.nonce,
          rel: "preload",
          href: "".concat(assetPrefix, "/_next/").concat(encodeURI(file)).concat(assetQueryString),
          as: "script",
          crossOrigin: _this4.props.crossOrigin || crossOrigin
        });
      })));
    }
  }, {
    key: "getBeforeInteractiveInlineScripts",
    value: function getBeforeInteractiveInlineScripts() {
      var scriptLoader = this.context.scriptLoader;
      var _this$props = this.props,
          nonce = _this$props.nonce,
          crossOrigin = _this$props.crossOrigin;
      return (scriptLoader.beforeInteractive || []).filter(function (script) {
        return !script.src && (script.dangerouslySetInnerHTML || script.children);
      }).map(function (file, index) {
        var strategy = file.strategy,
            children = file.children,
            dangerouslySetInnerHTML = file.dangerouslySetInnerHTML,
            src = file.src,
            scriptProps = (0, _objectWithoutProperties2["default"])(file, _excluded4);
        var html = "";

        if (dangerouslySetInnerHTML && dangerouslySetInnerHTML.__html) {
          html = dangerouslySetInnerHTML.__html;
        } else if (children) {
          html = typeof children === "string" ? children : Array.isArray(children) ? children.join("") : "";
        }

        return /*#__PURE__*/_react["default"].createElement("script", _objectSpread(_objectSpread({}, scriptProps), {}, {
          dangerouslySetInnerHTML: {
            __html: html
          },
          key: scriptProps.id || index,
          nonce: nonce,
          "data-nscript": "beforeInteractive",
          crossOrigin: crossOrigin || undefined
        }));
      });
    }
  }, {
    key: "getDynamicChunks",
    value: function getDynamicChunks(files) {
      return _getDynamicChunks(this.context, this.props, files);
    }
  }, {
    key: "getPreNextScripts",
    value: function getPreNextScripts() {
      return _getPreNextScripts(this.context, this.props);
    }
  }, {
    key: "getScripts",
    value: function getScripts(files) {
      return _getScripts(this.context, this.props, files);
    }
  }, {
    key: "getPolyfillScripts",
    value: function getPolyfillScripts() {
      return _getPolyfillScripts(this.context, this.props);
    }
  }, {
    key: "makeStylesheetInert",
    value: function makeStylesheetInert(node) {
      var _this5 = this;

      return _react["default"].Children.map(node, function (c) {
        var _c_props, _c_props1;

        if ((c == null ? void 0 : c.type) === "link" && (c == null ? void 0 : (_c_props = c.props) == null ? void 0 : _c_props.href) && _constants.OPTIMIZED_FONT_PROVIDERS.some(function (_ref2) {
          var url = _ref2.url;

          var _c_props, _c_props_href;

          return c == null ? void 0 : (_c_props = c.props) == null ? void 0 : (_c_props_href = _c_props.href) == null ? void 0 : _c_props_href.startsWith(url);
        })) {
          var newProps = _objectSpread(_objectSpread({}, c.props || {}), {}, {
            "data-href": c.props.href,
            href: undefined
          });

          return /*#__PURE__*/_react["default"].cloneElement(c, newProps);
        } else if (c == null ? void 0 : (_c_props1 = c.props) == null ? void 0 : _c_props1.children) {
          var _newProps = _objectSpread(_objectSpread({}, c.props || {}), {}, {
            children: _this5.makeStylesheetInert(c.props.children)
          });

          return /*#__PURE__*/_react["default"].cloneElement(c, _newProps);
        }

        return c; // @types/react bug. Returned value from .map will not be `null` if you pass in `[null]`
      }).filter(Boolean);
    }
  }, {
    key: "render",
    value: function render() {
      var _this6 = this,
          _this$props$nonce,
          _this$props$nonce2,
          _react$default;

      var _this$context4 = this.context,
          styles = _this$context4.styles,
          ampPath = _this$context4.ampPath,
          inAmpMode = _this$context4.inAmpMode,
          hybridAmp = _this$context4.hybridAmp,
          canonicalBase = _this$context4.canonicalBase,
          __NEXT_DATA__ = _this$context4.__NEXT_DATA__,
          dangerousAsPath = _this$context4.dangerousAsPath,
          headTags = _this$context4.headTags,
          unstable_runtimeJS = _this$context4.unstable_runtimeJS,
          unstable_JsPreload = _this$context4.unstable_JsPreload,
          disableOptimizedLoading = _this$context4.disableOptimizedLoading,
          optimizeCss = _this$context4.optimizeCss,
          optimizeFonts = _this$context4.optimizeFonts,
          assetPrefix = _this$context4.assetPrefix,
          nextFontManifest = _this$context4.nextFontManifest;
      var disableRuntimeJS = unstable_runtimeJS === false;
      var disableJsPreload = unstable_JsPreload === false || !disableOptimizedLoading;
      this.context.docComponentsRendered.Head = true;
      var head = this.context.head;
      var cssPreloads = [];
      var otherHeadElements = [];

      if (head) {
        head.forEach(function (c) {
          var metaTag;

          if (_this6.context.strictNextHead) {
            metaTag = /*#__PURE__*/_react["default"].createElement("meta", {
              name: "next-head",
              content: "1"
            });
          }

          if (c && c.type === "link" && c.props["rel"] === "preload" && c.props["as"] === "style") {
            metaTag && cssPreloads.push(metaTag);
            cssPreloads.push(c);
          } else {
            if (c) {
              if (metaTag && (c.type !== "meta" || !c.props["charSet"])) {
                otherHeadElements.push(metaTag);
              }

              otherHeadElements.push(c);
            }
          }
        });
        head = cssPreloads.concat(otherHeadElements);
      }

      var children = _react["default"].Children.toArray(this.props.children).filter(Boolean); // show a warning if Head contains <title> (only in development)


      if (false) {}

      if ( true && optimizeFonts && !( true && inAmpMode)) {
        children = this.makeStylesheetInert(children);
      }

      var hasAmphtmlRel = false;
      var hasCanonicalRel = false; // show warning and remove conflicting amp head tags

      head = _react["default"].Children.map(head || [], function (child) {
        if (!child) return child;
        var type = child.type,
            props = child.props;

        if ( true && inAmpMode) {
          var badProp = "";

          if (type === "meta" && props.name === "viewport") {
            badProp = 'name="viewport"';
          } else if (type === "link" && props.rel === "canonical") {
            hasCanonicalRel = true;
          } else if (type === "script") {
            // only block if
            // 1. it has a src and isn't pointing to ampproject's CDN
            // 2. it is using dangerouslySetInnerHTML without a type or
            // a type of text/javascript
            if (props.src && props.src.indexOf("ampproject") < -1 || props.dangerouslySetInnerHTML && (!props.type || props.type === "text/javascript")) {
              badProp = "<script";
              Object.keys(props).forEach(function (prop) {
                badProp += " ".concat(prop, "=\"").concat(props[prop], "\"");
              });
              badProp += "/>";
            }
          }

          if (badProp) {
            console.warn("Found conflicting amp tag \"".concat(child.type, "\" with conflicting prop ").concat(badProp, " in ").concat(__NEXT_DATA__.page, ". https://nextjs.org/docs/messages/conflicting-amp-tag"));
            return null;
          }
        } else {
          // non-amp mode
          if (type === "link" && props.rel === "amphtml") {
            hasAmphtmlRel = true;
          }
        }

        return child; // @types/react bug. Returned value from .map will not be `null` if you pass in `[null]`
      });
      var files = getDocumentFiles(this.context.buildManifest, this.context.__NEXT_DATA__.page,  true && inAmpMode);
      var nextFontLinkTags = getNextFontLinkTags(nextFontManifest, dangerousAsPath, assetPrefix);
      return /*#__PURE__*/_react["default"].createElement("head", getHeadHTMLProps(this.props), this.context.isDevelopment && /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement("style", {
        "data-next-hide-fouc": true,
        "data-ampdevmode":  true && inAmpMode ? "true" : undefined,
        dangerouslySetInnerHTML: {
          __html: "body{display:none}"
        }
      }), /*#__PURE__*/_react["default"].createElement("noscript", {
        "data-next-hide-fouc": true,
        "data-ampdevmode":  true && inAmpMode ? "true" : undefined
      }, /*#__PURE__*/_react["default"].createElement("style", {
        dangerouslySetInnerHTML: {
          __html: "body{display:block}"
        }
      }))), head, this.context.strictNextHead ? null : /*#__PURE__*/_react["default"].createElement("meta", {
        name: "next-head-count",
        content: _react["default"].Children.count(head || []).toString()
      }), children, optimizeFonts && /*#__PURE__*/_react["default"].createElement("meta", {
        name: "next-font-preconnect"
      }), nextFontLinkTags.preconnect, nextFontLinkTags.preload,  true && inAmpMode && /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement("meta", {
        name: "viewport",
        content: "width=device-width,minimum-scale=1,initial-scale=1"
      }), !hasCanonicalRel && /*#__PURE__*/_react["default"].createElement("link", {
        rel: "canonical",
        href: canonicalBase + (__webpack_require__(6368).cleanAmpPath)(dangerousAsPath)
      }), /*#__PURE__*/_react["default"].createElement("link", {
        rel: "preload",
        as: "script",
        href: "https://cdn.ampproject.org/v0.js"
      }), /*#__PURE__*/_react["default"].createElement(AmpStyles, {
        styles: styles
      }), /*#__PURE__*/_react["default"].createElement("style", {
        "amp-boilerplate": "",
        dangerouslySetInnerHTML: {
          __html: "body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}"
        }
      }), /*#__PURE__*/_react["default"].createElement("noscript", null, /*#__PURE__*/_react["default"].createElement("style", {
        "amp-boilerplate": "",
        dangerouslySetInnerHTML: {
          __html: "body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}"
        }
      })), /*#__PURE__*/_react["default"].createElement("script", {
        async: true,
        src: "https://cdn.ampproject.org/v0.js"
      })), !( true && inAmpMode) && /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, !hasAmphtmlRel && hybridAmp && /*#__PURE__*/_react["default"].createElement("link", {
        rel: "amphtml",
        href: canonicalBase + getAmpPath(ampPath, dangerousAsPath)
      }), this.getBeforeInteractiveInlineScripts(), !optimizeCss && this.getCssLinks(files), !optimizeCss && /*#__PURE__*/_react["default"].createElement("noscript", {
        "data-n-css": (_this$props$nonce = this.props.nonce) !== null && _this$props$nonce !== void 0 ? _this$props$nonce : ""
      }), !disableRuntimeJS && !disableJsPreload && this.getPreloadDynamicChunks(), !disableRuntimeJS && !disableJsPreload && this.getPreloadMainLinks(files), !disableOptimizedLoading && !disableRuntimeJS && this.getPolyfillScripts(), !disableOptimizedLoading && !disableRuntimeJS && this.getPreNextScripts(), !disableOptimizedLoading && !disableRuntimeJS && this.getDynamicChunks(files), !disableOptimizedLoading && !disableRuntimeJS && this.getScripts(files), optimizeCss && this.getCssLinks(files), optimizeCss && /*#__PURE__*/_react["default"].createElement("noscript", {
        "data-n-css": (_this$props$nonce2 = this.props.nonce) !== null && _this$props$nonce2 !== void 0 ? _this$props$nonce2 : ""
      }), this.context.isDevelopment && // this element is used to mount development styles so the
      // ordering matches production
      // (by default, style-loader injects at the bottom of <head />)

      /*#__PURE__*/
      _react["default"].createElement("noscript", {
        id: "__next_css__DO_NOT_USE__"
      }), styles || null), /*#__PURE__*/(_react$default = _react["default"]).createElement.apply(_react$default, [_react["default"].Fragment, {}].concat((0, _toConsumableArray2["default"])(headTags || []))));
    }
  }]);
}(_react["default"].Component);

_Head2 = _Head;
var _ = {
  writable: true,
  value: function () {
    _Head2.contextType = _htmlcontext.HtmlContext;
  }()
};

function handleDocumentScriptLoaderItems(scriptLoader, __NEXT_DATA__, props) {
  var _children_find, _children_find_props, _children_find1, _children_find_props1;

  if (!props.children) return;
  var scriptLoaderItems = [];
  var children = Array.isArray(props.children) ? props.children : [props.children];
  var headChildren = (_children_find = children.find(function (child) {
    return child.type === _Head;
  })) == null ? void 0 : (_children_find_props = _children_find.props) == null ? void 0 : _children_find_props.children;
  var bodyChildren = (_children_find1 = children.find(function (child) {
    return child.type === "body";
  })) == null ? void 0 : (_children_find_props1 = _children_find1.props) == null ? void 0 : _children_find_props1.children; // Scripts with beforeInteractive can be placed inside Head or <body> so children of both needs to be traversed

  var combinedChildren = [].concat((0, _toConsumableArray2["default"])(Array.isArray(headChildren) ? headChildren : [headChildren]), (0, _toConsumableArray2["default"])(Array.isArray(bodyChildren) ? bodyChildren : [bodyChildren]));

  _react["default"].Children.forEach(combinedChildren, function (child) {
    var _child_type;

    if (!child) return; // When using the `next/script` component, register it in script loader.

    if ((_child_type = child.type) == null ? void 0 : _child_type.__nextScript) {
      if (child.props.strategy === "beforeInteractive") {
        scriptLoader.beforeInteractive = (scriptLoader.beforeInteractive || []).concat([_objectSpread({}, child.props)]);
        return;
      } else if (["lazyOnload", "afterInteractive", "worker"].includes(child.props.strategy)) {
        scriptLoaderItems.push(child.props);
        return;
      }
    }
  });

  __NEXT_DATA__.scriptLoader = scriptLoaderItems;
}

var _NextScript = /*#__PURE__*/function (_react$default$Compon2) {
  function _NextScript() {
    (0, _classCallCheck2["default"])(this, _NextScript);
    return _callSuper(this, _NextScript, arguments);
  }

  (0, _inherits2["default"])(_NextScript, _react$default$Compon2);
  return (0, _createClass2["default"])(_NextScript, [{
    key: "getDynamicChunks",
    value: function getDynamicChunks(files) {
      return _getDynamicChunks(this.context, this.props, files);
    }
  }, {
    key: "getPreNextScripts",
    value: function getPreNextScripts() {
      return _getPreNextScripts(this.context, this.props);
    }
  }, {
    key: "getScripts",
    value: function getScripts(files) {
      return _getScripts(this.context, this.props, files);
    }
  }, {
    key: "getPolyfillScripts",
    value: function getPolyfillScripts() {
      return _getPolyfillScripts(this.context, this.props);
    }
  }, {
    key: "render",
    value: function render() {
      var _this7 = this;

      var _this$context5 = this.context,
          assetPrefix = _this$context5.assetPrefix,
          inAmpMode = _this$context5.inAmpMode,
          buildManifest = _this$context5.buildManifest,
          unstable_runtimeJS = _this$context5.unstable_runtimeJS,
          docComponentsRendered = _this$context5.docComponentsRendered,
          assetQueryString = _this$context5.assetQueryString,
          disableOptimizedLoading = _this$context5.disableOptimizedLoading,
          crossOrigin = _this$context5.crossOrigin;
      var disableRuntimeJS = unstable_runtimeJS === false;
      docComponentsRendered.NextScript = true;

      if ( true && inAmpMode) {
        if (true) {
          return null;
        }

        var ampDevFiles = [].concat((0, _toConsumableArray2["default"])(buildManifest.devFiles), (0, _toConsumableArray2["default"])(buildManifest.polyfillFiles), (0, _toConsumableArray2["default"])(buildManifest.ampDevFiles));
        return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, disableRuntimeJS ? null : /*#__PURE__*/_react["default"].createElement("script", {
          id: "__NEXT_DATA__",
          type: "application/json",
          nonce: this.props.nonce,
          crossOrigin: this.props.crossOrigin || crossOrigin,
          dangerouslySetInnerHTML: {
            __html: _NextScript.getInlineScriptSource(this.context)
          },
          "data-ampdevmode": true
        }), ampDevFiles.map(function (file) {
          return /*#__PURE__*/_react["default"].createElement("script", {
            key: file,
            src: "".concat(assetPrefix, "/_next/").concat(file).concat(assetQueryString),
            nonce: _this7.props.nonce,
            crossOrigin: _this7.props.crossOrigin || crossOrigin,
            "data-ampdevmode": true
          });
        }));
      }

      if (false) {}

      var files = getDocumentFiles(this.context.buildManifest, this.context.__NEXT_DATA__.page,  true && inAmpMode);
      return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, !disableRuntimeJS && buildManifest.devFiles ? buildManifest.devFiles.map(function (file) {
        return /*#__PURE__*/_react["default"].createElement("script", {
          key: file,
          src: "".concat(assetPrefix, "/_next/").concat(encodeURI(file)).concat(assetQueryString),
          nonce: _this7.props.nonce,
          crossOrigin: _this7.props.crossOrigin || crossOrigin
        });
      }) : null, disableRuntimeJS ? null : /*#__PURE__*/_react["default"].createElement("script", {
        id: "__NEXT_DATA__",
        type: "application/json",
        nonce: this.props.nonce,
        crossOrigin: this.props.crossOrigin || crossOrigin,
        dangerouslySetInnerHTML: {
          __html: _NextScript.getInlineScriptSource(this.context)
        }
      }), disableOptimizedLoading && !disableRuntimeJS && this.getPolyfillScripts(), disableOptimizedLoading && !disableRuntimeJS && this.getPreNextScripts(), disableOptimizedLoading && !disableRuntimeJS && this.getDynamicChunks(files), disableOptimizedLoading && !disableRuntimeJS && this.getScripts(files));
    }
  }], [{
    key: "getInlineScriptSource",
    value: function getInlineScriptSource(context) {
      var __NEXT_DATA__ = context.__NEXT_DATA__,
          largePageDataBytes = context.largePageDataBytes;

      try {
        var data = JSON.stringify(__NEXT_DATA__);

        if (largePageDataWarnings.has(__NEXT_DATA__.page)) {
          return (0, _htmlescape.htmlEscapeJsonString)(data);
        }

        var bytes =  false ? 0 : Buffer.from(data).byteLength;

        var prettyBytes = (__webpack_require__(5955)/* ["default"] */ .Z);

        if (largePageDataBytes && bytes > largePageDataBytes) {
          if (true) {
            largePageDataWarnings.add(__NEXT_DATA__.page);
          }

          console.warn("Warning: data for page \"".concat(__NEXT_DATA__.page, "\"").concat(__NEXT_DATA__.page === context.dangerousAsPath ? "" : " (path \"".concat(context.dangerousAsPath, "\")"), " is ").concat(prettyBytes(bytes), " which exceeds the threshold of ").concat(prettyBytes(largePageDataBytes), ", this amount of data can reduce performance.\nSee more info here: https://nextjs.org/docs/messages/large-page-data"));
        }

        return (0, _htmlescape.htmlEscapeJsonString)(data);
      } catch (err) {
        if ((0, _iserror["default"])(err) && err.message.indexOf("circular structure") !== -1) {
          throw new Error("Circular structure in \"getInitialProps\" result of page \"".concat(__NEXT_DATA__.page, "\". https://nextjs.org/docs/messages/circular-structure"));
        }

        throw err;
      }
    }
  }]);
}(_react["default"].Component);

_NextScript2 = _NextScript;
var _2 = {
  writable: true,
  value: function () {
    _NextScript2.contextType = _htmlcontext.HtmlContext;
  }()
};

function _Html(props) {
  var _ref3 = (0, _htmlcontext.useHtmlContext)(),
      inAmpMode = _ref3.inAmpMode,
      docComponentsRendered = _ref3.docComponentsRendered,
      locale = _ref3.locale,
      scriptLoader = _ref3.scriptLoader,
      __NEXT_DATA__ = _ref3.__NEXT_DATA__;

  docComponentsRendered.Html = true;
  handleDocumentScriptLoaderItems(scriptLoader, __NEXT_DATA__, props);
  return /*#__PURE__*/_react["default"].createElement("html", _objectSpread(_objectSpread({}, props), {}, {
    lang: props.lang || locale || undefined,
    amp:  true && inAmpMode ? "" : undefined,
    "data-ampdevmode":  true && inAmpMode && false ? 0 : undefined
  }));
}

function _Main() {
  var _ref4 = (0, _htmlcontext.useHtmlContext)(),
      docComponentsRendered = _ref4.docComponentsRendered;

  docComponentsRendered.Main = true; // @ts-ignore

  return /*#__PURE__*/_react["default"].createElement("next-js-internal-body-render-target", null);
}

var Document = /*#__PURE__*/function (_react$default$Compon3) {
  function Document() {
    (0, _classCallCheck2["default"])(this, Document);
    return _callSuper(this, Document, arguments);
  }

  (0, _inherits2["default"])(Document, _react$default$Compon3);
  return (0, _createClass2["default"])(Document, [{
    key: "render",
    value: function render() {
      return /*#__PURE__*/_react["default"].createElement(_Html, null, /*#__PURE__*/_react["default"].createElement(_Head, null), /*#__PURE__*/_react["default"].createElement("body", null, /*#__PURE__*/_react["default"].createElement(_Main, null), /*#__PURE__*/_react["default"].createElement(_NextScript, null)));
    }
  }], [{
    key: "getInitialProps",
    value:
    /**
    * `getInitialProps` hook returns the context object with the addition of `renderPage`.
    * `renderPage` callback executes `React` rendering logic synchronously to support server-rendering wrappers
    */
    function getInitialProps(ctx) {
      return ctx.defaultGetInitialProps(ctx);
    }
  }]);
}(_react["default"].Component); // Add a special property to the built-in `Document` component so later we can
// identify if a user customized `Document` is used or not.


var InternalFunctionDocument = function InternalFunctionDocument() {
  return /*#__PURE__*/_react["default"].createElement(_Html, null, /*#__PURE__*/_react["default"].createElement(_Head, null), /*#__PURE__*/_react["default"].createElement("body", null, /*#__PURE__*/_react["default"].createElement(_Main, null), /*#__PURE__*/_react["default"].createElement(_NextScript, null)));
};

Document[_constants.NEXT_BUILTIN_DOCUMENT] = InternalFunctionDocument;

/***/ }),

/***/ 7182:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
var __webpack_unused_export__;
/**
 * Hoists a name from a module or promised module.
 *
 * @param module the module to hoist the name from
 * @param name the name to hoist
 * @returns the value on the module (or promised module)
 */ 
__webpack_unused_export__ = ({
    value: true
});
Object.defineProperty(exports, "l", ({
    enumerable: true,
    get: function() {
        return hoist;
    }
}));
function hoist(module, name) {
    // If the name is available in the module, return it.
    if (name in module) {
        return module[name];
    }
    // If a property called `then` exists, assume it's a promise and
    // return a promise that resolves to the name.
    if ("then" in module && typeof module.then === "function") {
        return module.then((mod)=>hoist(mod, name));
    }
    // If we're trying to hoise the default export, and the module is a function,
    // return the module itself.
    if (typeof module === "function" && name === "default") {
        return module;
    }
    // Otherwise, return undefined.
    return undefined;
}

//# sourceMappingURL=helpers.js.map

/***/ }),

/***/ 676:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return isError;
    },
    getProperError: function() {
        return getProperError;
    }
});
const _isplainobject = __webpack_require__(8524);
function isError(err) {
    return typeof err === "object" && err !== null && "name" in err && "message" in err;
}
function getProperError(err) {
    if (isError(err)) {
        return err;
    }
    if (false) {}
    return new Error((0, _isplainobject.isPlainObject)(err) ? JSON.stringify(err) : err + "");
}

//# sourceMappingURL=is-error.js.map

/***/ }),

/***/ 5955:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
var __webpack_unused_export__;
/*
MIT License

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/ 
__webpack_unused_export__ = ({
    value: true
});
Object.defineProperty(exports, "Z", ({
    enumerable: true,
    get: function() {
        return prettyBytes;
    }
}));
const UNITS = [
    "B",
    "kB",
    "MB",
    "GB",
    "TB",
    "PB",
    "EB",
    "ZB",
    "YB"
];
/*
Formats the given number using `Number#toLocaleString`.
- If locale is a string, the value is expected to be a locale-key (for example: `de`).
- If locale is true, the system default locale is used for translation.
- If no value for locale is specified, the number is returned unmodified.
*/ const toLocaleString = (number, locale)=>{
    let result = number;
    if (typeof locale === "string") {
        result = number.toLocaleString(locale);
    } else if (locale === true) {
        result = number.toLocaleString();
    }
    return result;
};
function prettyBytes(number, options) {
    if (!Number.isFinite(number)) {
        throw new TypeError(`Expected a finite number, got ${typeof number}: ${number}`);
    }
    options = Object.assign({}, options);
    if (options.signed && number === 0) {
        return " 0 B";
    }
    const isNegative = number < 0;
    const prefix = isNegative ? "-" : options.signed ? "+" : "";
    if (isNegative) {
        number = -number;
    }
    if (number < 1) {
        const numberString = toLocaleString(number, options.locale);
        return prefix + numberString + " B";
    }
    const exponent = Math.min(Math.floor(Math.log10(number) / 3), UNITS.length - 1);
    number = Number((number / Math.pow(1000, exponent)).toPrecision(3));
    const numberString = toLocaleString(number, options.locale);
    const unit = UNITS[exponent];
    return prefix + numberString + " " + unit;
}

//# sourceMappingURL=pretty-bytes.js.map

/***/ }),

/***/ 5244:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({
    value: true
});
Object.defineProperty(exports, "x", ({
    enumerable: true,
    get: function() {
        return RouteKind;
    }
}));
var RouteKind;
(function(RouteKind) {
    RouteKind[/**
   * `PAGES` represents all the React pages that are under `pages/`.
   */ "PAGES"] = "PAGES";
    RouteKind[/**
   * `PAGES_API` represents all the API routes under `pages/api/`.
   */ "PAGES_API"] = "PAGES_API";
    RouteKind[/**
   * `APP_PAGE` represents all the React pages that are under `app/` with the
   * filename of `page.{j,t}s{,x}`.
   */ "APP_PAGE"] = "APP_PAGE";
    RouteKind[/**
   * `APP_ROUTE` represents all the API routes and metadata routes that are under `app/` with the
   * filename of `route.{j,t}s{,x}`.
   */ "APP_ROUTE"] = "APP_ROUTE";
})(RouteKind || (RouteKind = {}));

//# sourceMappingURL=route-kind.js.map

/***/ }),

/***/ 3185:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    PagesRouteModule: function() {
        return PagesRouteModule;
    },
    default: function() {
        return _default;
    }
});
const _routemodule = __webpack_require__(3076);
const _render = __webpack_require__(3100);
class PagesRouteModule extends _routemodule.RouteModule {
    constructor(options){
        super(options);
        this.components = options.components;
    }
    render(req, res, context) {
        return (0, _render.renderToHTMLImpl)(req, res, context.page, context.query, context.renderOpts, {
            App: this.components.App,
            Document: this.components.Document
        });
    }
}
const _default = PagesRouteModule;

//# sourceMappingURL=module.js.map

/***/ }),

/***/ 6859:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(1492)


/***/ }),

/***/ 3897:
/***/ ((module) => {

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
module.exports = _arrayLikeToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 3405:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayLikeToArray = __webpack_require__(3897);
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return arrayLikeToArray(r);
}
module.exports = _arrayWithoutHoles, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 6115:
/***/ ((module) => {

function _assertThisInitialized(e) {
  if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
}
module.exports = _assertThisInitialized, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 6690:
/***/ ((module) => {

function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
module.exports = _classCallCheck, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 9728:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toPropertyKey = __webpack_require__(4062);
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: !1
  }), e;
}
module.exports = _createClass, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 8416:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toPropertyKey = __webpack_require__(4062);
function _defineProperty(e, r, t) {
  return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}
module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 3808:
/***/ ((module) => {

function _getPrototypeOf(t) {
  return module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) {
    return t.__proto__ || Object.getPrototypeOf(t);
  }, module.exports.__esModule = true, module.exports["default"] = module.exports, _getPrototypeOf(t);
}
module.exports = _getPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 1655:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var setPrototypeOf = __webpack_require__(6015);
function _inherits(t, e) {
  if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
  t.prototype = Object.create(e && e.prototype, {
    constructor: {
      value: t,
      writable: !0,
      configurable: !0
    }
  }), Object.defineProperty(t, "prototype", {
    writable: !1
  }), e && setPrototypeOf(t, e);
}
module.exports = _inherits, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 4836:
/***/ ((module) => {

function _interopRequireDefault(e) {
  return e && e.__esModule ? e : {
    "default": e
  };
}
module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 9498:
/***/ ((module) => {

function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
module.exports = _iterableToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 2281:
/***/ ((module) => {

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
module.exports = _nonIterableSpread, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 215:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var objectWithoutPropertiesLoose = __webpack_require__(7071);
function _objectWithoutProperties(e, t) {
  if (null == e) return {};
  var o,
    r,
    i = objectWithoutPropertiesLoose(e, t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
  }
  return i;
}
module.exports = _objectWithoutProperties, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 7071:
/***/ ((module) => {

function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (-1 !== e.indexOf(n)) continue;
    t[n] = r[n];
  }
  return t;
}
module.exports = _objectWithoutPropertiesLoose, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 4993:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(8698)["default"]);
var assertThisInitialized = __webpack_require__(6115);
function _possibleConstructorReturn(t, e) {
  if (e && ("object" == _typeof(e) || "function" == typeof e)) return e;
  if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
  return assertThisInitialized(t);
}
module.exports = _possibleConstructorReturn, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 6015:
/***/ ((module) => {

function _setPrototypeOf(t, e) {
  return module.exports = _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
    return t.__proto__ = e, t;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports, _setPrototypeOf(t, e);
}
module.exports = _setPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 861:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayWithoutHoles = __webpack_require__(3405);
var iterableToArray = __webpack_require__(9498);
var unsupportedIterableToArray = __webpack_require__(6116);
var nonIterableSpread = __webpack_require__(2281);
function _toConsumableArray(r) {
  return arrayWithoutHoles(r) || iterableToArray(r) || unsupportedIterableToArray(r) || nonIterableSpread();
}
module.exports = _toConsumableArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 5036:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(8698)["default"]);
function toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
module.exports = toPrimitive, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 4062:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(8698)["default"]);
var toPrimitive = __webpack_require__(5036);
function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}
module.exports = toPropertyKey, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 8698:
/***/ ((module) => {

function _typeof(o) {
  "@babel/helpers - typeof";

  return module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof(o);
}
module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 6116:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayLikeToArray = __webpack_require__(3897);
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? arrayLikeToArray(r, a) : void 0;
  }
}
module.exports = _unsupportedIterableToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ })

};
;