!function(){"use strict";function t(){function t(t){r=io.connect(t)}function n(){if(!r)throw new Error("socket is not inited");r.on.apply(r,arguments)}function o(t){if(!r)throw new Error("socket is not inited");r.emit("watch",t)}function i(t){if(!r)throw new Error("socket is not inited");r.emit("unwatch",t)}var r,c={connect:t,on:n,watch:o,unwatch:i};return c}var n=angular.module("jtApp");n.factory("io",t)}(this);