module.exports=function(a){"use strict";require("load-grunt-tasks")(a),require("time-grunt")(a),a.initConfig({karma:{options:{autowatch:!0,browsers:["PhantomJS"],configFile:"test/karma.conf.js",reporters:["dots"],singleRun:!0},unit:{}},jshint:{grunt:{src:["Gruntfile.js"],options:{node:!0}},dev:{src:["angular-local-storage.js"],options:{}},test:{src:["test/spec/**/*.js"],options:{jshintrc:"test/.jshintrc"}}},uglify:{dist:{files:{"angular-local-storage.min.js":"angular-local-storage.js"}}}}),a.registerTask("test",["karma"]),a.registerTask("default",["jshint","test"]),a.registerTask("dist",["uglify"])};