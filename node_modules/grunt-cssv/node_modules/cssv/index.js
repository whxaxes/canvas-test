var fs = require('fs');
var url = require('url');
var crypto = require("crypto");

var urlReg = /("|'|\()(((\.)|(\.\.)|(http:)|([-_a-zA-Z0-9.]*))\/)*[-_a-zA-Z0-9.]*\.(css|js|png|jpg|gif)[?=0-9a-zA-Z]*("|'|\))/g;  //匹配"**/*.css?v=*"
var stripReg = /(((\.)|(\.\.)|(http:)|([-_a-zA-Z0-9.]*))\/)*[-_a-zA-Z0-9.]*\.(css|js|png|jpg|gif)/i;   //匹配"**/*.css?v=*"中的**/*.css
var htmlReg = /.+\.(html|ejs|jade)/g;

module.exports = (function () {
    'use strict';
    var cache = [];
    var cache_2 = {};

    var cssv = function () {};
    var cssvp = cssv.prototype;

    var count = 0;

    cssvp.options = {
        directiory:'./',
        files:[],
        verIsAdd:true,
        changeCss:true,
        changeImg:false,
        changeJs:false,
        isDeep:false
    };

    cssvp.run = function (options) {
        var that = this;

        this.extend(options);

        console.log("\n开始检索...\n");
        this.files.forEach(function(f){
            if (f.match(htmlReg)){
                that.replace(f)
            }
        });
        console.log("检索完毕\n");

        if(!count)console.log("无需要修改的文件");
        else console.log("修改文件数："+count);
    };

    cssvp.extend = function(opt){
        for(var key in this.options){
            this[key] = (key in opt)?opt[key]:this.options[key]
        }

        this.files = this.files.length>0?this.files:getAllFolder(this.directiory);
    };

    cssvp.replace = function(path){
        var str, that = this;

        try {
            str = fs.readFileSync(path).toString();
        } catch (e) {
            return;
        }

        var hasMatch = false;
        var logCollector = {};
        str = str.replace(urlReg, function (m) {
            var nstr = m.match(stripReg)[0];

            var link = url.resolve(path, nstr);
            var arr = link.split("/");

            var fileName = arr.pop();
            var prefix = arr.join("/");
            var fileArr = fileName.split(".");
            var fileType = fileArr[fileArr.length - 1];

            var result;

            if((fileType=="css" && !that.changeCss) || (fileType=="js" && !that.changeJs) || (fileType.match(/png|gif|jpg/g) && !that.changeImg)) return m;

            if(that.isDeep){
                result = that.deepChange(nstr , link , fileName , fileType , prefix , m);
            }else {
                var oldVer = m.match(/\?v=\w*/g);
                oldVer = oldVer && oldVer[0].replace("?v=",'');
                if(oldVer || that.verIsAdd){
                    result = that.normalChange(nstr , link , oldVer)
                }
            }

            if(result){
                hasMatch = true;
                logCollector[path] = logCollector[path] || [];
                logCollector[path].push("更改内容:" + m + " ====> " + result);

                if(that.isDeep){
                    return m.replace(stripReg, result);
                }else {
                    return m.charAt(0)+result+m.charAt(m.length-1)
                }
            }else return m;
        });

        if (hasMatch) {
            count++;
            console.log("\n-----------------------------------------");
            console.log("更改文件:" + path);
            console.log(logCollector[path].join("\n"));
            console.log("-----------------------------------------");

            fs.writeFileSync(path, str);
        }

        return str;
    };

    //深层次版本号修改，直接修改文件名
    cssvp.deepChange = function(nstr , link , fileName , fileType , prefix){
        var that = this;
        var suffix = getMd5(prefix).substring(0, 5);
        var fileReg = new RegExp("((_" + suffix + ".*)|)\\." + fileType);

        var newFileName = fileName.replace(fileReg, "");
        var fnSuffix;

        if (!(link in cache_2)) {
            //文件版本号_路径MD5值+文件内容MD5值+文件类型
            var newStr = that.replace(link);
            if(!newStr) return null;

            var addname = "_" + suffix + getMd5(newStr).substring(0 , 5) + "." + fileType;
            if((newFileName + addname)==fileName && this.verIsAdd)return null;

            cache_2[link] = fnSuffix = this.verIsAdd ? addname : ("." + fileType);

            try{
                fs.renameSync(link, (prefix||".") + "/" + newFileName + fnSuffix);
            }catch(e){
                return null;
            }
        } else {
            fnSuffix = cache_2[link];
        }

        if(fileName.indexOf(suffix)==-1 && !this.verIsAdd) return null;

        return this.verIsAdd ? nstr.replace(fileReg, fnSuffix) : nstr.replace(fileReg, "." + fileType);
    };

    //浅层次版本号修改，在文件后面添加?v=XXX版本号
    cssvp.normalChange = function(nstr, link , oldVer){
        if (!(link in cache_2)) {
            var str = this.replace(link);
            if(!str)return null;

            var md5samp = getMd5(str).substring(0,5);
            cache[link] = md5samp;

            if(md5samp === oldVer && this.verIsAdd)return null;
        }

        return this.verIsAdd ? (nstr + '?v=' + cache[link]) : nstr;
    };

    //获取MD5加密字符串
    function getMd5(str) {
        return crypto.createHash("md5").update(str).digest("hex");
    }

    //去头尾空格
    function trim(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "")
    }

    //获取当前目录下的所有html文件
    function getAllFolder(p) {
        var arr = [];

        try{
            if (!fs.lstatSync(p = trim(p)).isDirectory()) {
                return []
            }
        }catch(e){
            return []
        }

        var files = fs.readdirSync(p);
        p += p.charAt(p.length - 1) == "/" ? "" : "/";

        for (var i = 0; i < files.length; i++) {
            try{
                if (fs.lstatSync(p + files[i]).isDirectory()) {
                    arr = arr.concat(getAllFolder(p + files[i]));
                } else {
                    arr.push(p + files[i])
                }
            }catch(e){console.log(e)}
        }

        return arr;
    }

    return new cssv();
})();