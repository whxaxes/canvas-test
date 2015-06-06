var http = require('http');
var router = require('easy-router');

router.init({useCache : false})
router.setMap({
	'**/*' : 'src/**/*'
})

http.createServer(function(req , res){
	router.route(req , res);
}).listen(3030);