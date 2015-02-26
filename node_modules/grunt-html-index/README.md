#grunt-html-index:创建索引页面

该插件可以快速生成索引页面，方便预览效果。

安装(需先安装grunt)：npm install grunt-html-index

###使用方法：在Gruntfile.js中添加配置

        grunt.loadNpmTasks('grunt-html-index');
        htmlindex:{
            dist:{
                cwd: 'test/',
                expand: true,
                src: ['html/**/*'],
                dest: 'test/'
            }
        }

比如，我当前的目录结构为：

        test:{
            html:{
                index.html,
                index2.html,
                inner:{
                    index3.html
                }
            }
        }

test目录下有个html文件夹，html文件夹下有多个html文件。按照上面的配置。生成的html索引页面 "html-index.html" 则在test目录下<br>
内容为：

        ...略
        <body>
            <div class="main">
                <a href="html/index.html" target="_blank">domdomd</a>
                <a href="html/index2.html" target="_blank">我是html2</a>
                <a href="html/inner/index3.html" target="_blank">我是html3</a>
            </div>
        </body>

a标签里的内容为html的title。链接则链往目标html