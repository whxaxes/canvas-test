!function (global , fn) {
    if (typeof define === "function") {
        define(function (require, exports, module) { module.exports = fn(); })
    } else if (typeof exports === "object") {
        module.exports = fn();
    } else {
        global.freestring = fn();
    }
}(this , function () {
    'use strict';

    var RE = /\/\*!?(?:@preserve)?(?:\r\n|\n)*([\s\S]*?)(?:\r\n|\n)*\*\//g;
    var ARG_RE = /\$\{[a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_]+|\[\d+\])*\}/g;

    return function (fn, json) {
        if (typeof fn !== "function") return "";

        var result = RE.test(fn.toString()) ? RegExp.$1 : "";
        RE.lastIndex = 0;

        if (typeof json !== "object") return result;

        return result.replace(ARG_RE, function (m) {
            var args = m.replace(/^\$\{|\}$/g, '').replace(/\[(\d+)\]/g, '.$1'),
                obj = json,
                a;

            args = args.split(".");

            while (a = args.shift()) {
                obj = obj[a];
            }

            return obj + "";
        })
    }
});