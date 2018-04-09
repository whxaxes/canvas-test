//canvas-test server

var Router = require('easy-router');

var port = 3030;

Router()
  .setMap('**/*', '**/*')
  .listen(port);

console.log('http://127.0.0.1:' + port + '/menu.html');
