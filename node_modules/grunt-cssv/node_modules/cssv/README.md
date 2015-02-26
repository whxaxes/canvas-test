#CSSV:给html文件里的链接添加版本号

###使用方法:
安装:npm install cssv -g

###how to use:
1、打开要添加版本号的项目目录<br>
2、打开当前目录下的控制台，输入cssv -a回车即可给当前目录下的所有html文件里的css链接添加版本号<br>
3、输入cssv -r则可以移除所有css链接的版本号<br>

还有其他命令：
cssv -a  不带其他命令默认只添加css的版本号<br>
cssv -a -c|-i|-j  添加css或image或js链接的版本号<br>
cssv -a -A 三个文件都添加版本号<br>
例

        "../../css/ohh.css" ====> ../../css/ohh.css?v=2f701
        "../../css/abc.css" ====> ../../css/abc.css?v=4ab85
        "../../css/hahah/abc.css" ====> ../../css/hahah/abc.css?v=cdf83


cssv -a -C  深层次更改版本号，前面添加版本号是?v=XXX，添加-C命令后，则直接修改文件名。<br>
例：

        "../../css/ohh.css" ====> ../../css/ohh_42ce52f701.css
        "../../css/abc.css" ====> ../../css/abc_42ce54ab85.css
        "../../css/hahah/abc.css" ====> ../../css/hahah/abc_e132d3d52d.css
