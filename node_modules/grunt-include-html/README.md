#grunt-include-html:实现html引用

###使用方法:
安装:在grunt目录下安装

在html页面上引用：<br>
@@include("parts.html") 输入grunt命令后输出的html页面即包含parts.html页面内容

可以添加参数：<br>

        @@include("parts.html" , {
            var1:"var1",
            var2:"var2"
        })

然后再parts.html中添加@@var1即可引用参数，如果在parts中这样引用：

        @@var1isverygood，插件无法识别到@@var1因为后面的字符相连，正则无法匹配
        该插件提供{}符号作为分隔符，即可以改为@@{var1}isverygood，插件即可正常识别

也可以在Gruntfile.js中进行配置全局参数<br>

        includereplace: {
            options:{
                globals:{
                    var1:"var1",
                    var2:"var2"
                }
            },
            html: {
                cwd: 'html-init/',
                expand: true,
                src: ['**/*'],
                dest: 'html/'
            }
        }

即时在页面的@@include()中不添加参数，parts.html中的var1也会有值，如果@@include中有参数，则会覆盖全局。<br>
也可以在针对某个task下添加全局，比如

        includereplace: {
            options:{
                globals:{
                    var1:"var1",
                    var2:"var2"
                }
            },
            html: {
                options:{
                    globals:{
                        var1:"var1",
                        var2:"var2"
                    }
                },
                cwd: 'html-init/',
                expand: true,
                src: ['**/*'],
                dest: 'html/'
            }
        }

html task下的变量将会覆盖全局，但是如果@@include()中有该变量，也会覆盖html task下的变量

该插件会对源文件夹和目标文件夹里的文件进行绑定，如果源文件夹删除了某样文件，目标文件夹内的该文件也会删除，这样使用起来会更方便<br>
同时，给文件命名加上_前缀，插件将会忽略该文件

插件带有缓存机制，会仅编译内容发生改变的文件，该功能会在插件目录下生成一个config.ir文件<br>
如果不想使用该功能，可以在options中添加 ncon:true;使用后则每次都会编译所有文件
