!function(){"use strict";function n(){function n(n){i=io.connect(n)}function t(){if(!i)throw new Error("socket is not inited");i.on.apply(i,arguments)}function o(n){if(!i)throw new Error("socket is not inited");i.emit("watch",n)}var i,r={connect:n,on:t,watch:o};return r}var t=angular.module("jtApp");t.factory("io",n)}(this);