var router = require('easy-router');

var port = 3030;

router.setMap('**/*' , '**/*').listen(port);

console.log("http://127.0.0.1:"+port+"/menu.html");