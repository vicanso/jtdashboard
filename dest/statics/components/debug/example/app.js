var debug=require("../")("http"),http=require("http"),name="My App";debug("booting %s",name),http.createServer(function(a,b){debug(a.method+" "+a.url),b.end("hello\n")}).listen(3e3,function(){debug("listening")}),require("./worker");