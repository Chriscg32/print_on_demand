"use strict";
(() => {
var exports = {};
exports.id = 221;
exports.ids = [221];
exports.modules = {

/***/ 730:
/***/ ((module) => {

module.exports = require("next/dist/server/api-utils/node.js");

/***/ }),

/***/ 3076:
/***/ ((module) => {

module.exports = require("next/dist/server/future/route-modules/route-module.js");

/***/ }),

/***/ 355:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  config: () => (/* binding */ config),
  "default": () => (/* binding */ next_route_loaderkind_PAGES_API_page_2Fapi_2Fproducts_preferredRegion_absolutePagePath_private_next_pages_2Fapi_2Fproducts_js_middlewareConfigBase64_e30_3D_),
  routeModule: () => (/* binding */ routeModule)
});

// NAMESPACE OBJECT: ./pages/api/products.js
var products_namespaceObject = {};
__webpack_require__.r(products_namespaceObject);
__webpack_require__.d(products_namespaceObject, {
  "default": () => (handler)
});

// EXTERNAL MODULE: ./node_modules/next/dist/server/future/route-modules/pages-api/module.js
var pages_api_module = __webpack_require__(6429);
// EXTERNAL MODULE: ./node_modules/next/dist/server/future/route-kind.js
var route_kind = __webpack_require__(7153);
// EXTERNAL MODULE: ./node_modules/next/dist/build/webpack/loaders/next-route-loader/helpers.js
var helpers = __webpack_require__(7305);
;// CONCATENATED MODULE: ./pages/api/products.js
function handler(req, res) {
  // Add caching headers for better performance
  res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59'); // Handle different HTTP methods

  switch (req.method) {
    case 'GET':
      return res.status(200).json({
        products: []
        /* your products data */

      });

    case 'POST':
      // Handle product creation
      return res.status(201).json({
        message: 'Product created'
      });

    default:
      return res.status(405).json({
        message: 'Method not allowed'
      });
  }
}
;// CONCATENATED MODULE: ./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fproducts&preferredRegion=&absolutePagePath=private-next-pages%2Fapi%2Fproducts.js&middlewareConfigBase64=e30%3D!
// @ts-ignore this need to be imported from next/dist to be external



const PagesAPIRouteModule = pages_api_module.PagesAPIRouteModule;
// Import the userland code.
// @ts-expect-error - replaced by webpack/turbopack loader

// Re-export the handler (should be the default export).
/* harmony default export */ const next_route_loaderkind_PAGES_API_page_2Fapi_2Fproducts_preferredRegion_absolutePagePath_private_next_pages_2Fapi_2Fproducts_js_middlewareConfigBase64_e30_3D_ = ((0,helpers/* hoist */.l)(products_namespaceObject, "default"));
// Re-export config.
const config = (0,helpers/* hoist */.l)(products_namespaceObject, "config");
// Create and export the route module that will be consumed.
const routeModule = new PagesAPIRouteModule({
    definition: {
        kind: route_kind/* RouteKind */.x.PAGES_API,
        page: "/api/products",
        pathname: "/api/products",
        // The following aren't used in production.
        bundlePath: "",
        filename: ""
    },
    userland: products_namespaceObject
});

//# sourceMappingURL=pages-api.js.map

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [172], () => (__webpack_exec__(355)));
module.exports = __webpack_exports__;

})();