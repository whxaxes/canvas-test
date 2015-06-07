var http = require('http');
var router = require('easy-router');

var port = 3030;

router.init({useCache : false})
router.setMap({
	'**/*' : '**/*'
})

http.createServer(function(req , res){
	router.route(req , res);
}).listen(port);

console.log("服务启动...");
console.log("http://127.0.0.1:"+port+"/menu.html");