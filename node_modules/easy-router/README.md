# easy-router

##可以使用通配符的简易路由

##Install
    npm install easy-router

##Usage
    var router = require("easy-router");
    router.setMap({
        "/topic/*":"./pratice/topic_*.html",      //页面访问
        
        "/public/**/*":"../public/biz009/**/*"        //静态资源
        
        "/runMethod":function(req , res){       //执行方法
            res.end("test")
        }
    })
    http.createServer(function(req , res){
        router.route(req , res);
    })

我的[node-test项目](https://github.com/whxaxes/node-test)使用了该路由模块，具体用法可见node-test项目代码。

##API
###router.init(options);
初始化路由，可以不执行。执行setMap的时候router会检测有无初始化，若尚未初始化则自动初始化

###router.setMap
添加路由映射

###router.routeTo(req , res , filepath , headers)
根据路径引导路由至相应文件，可以添加响应头headers

###router.error(res)
定向至错误页面
