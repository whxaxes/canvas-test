//be used to create a menu.html

'use strict';

const fs = require("fs");
const path = require("path");

const base = "src/";
const sourcePrefix = "https://github.com/whxaxes/canvas-test/tree/gh-pages/";

const files = fs.readdirSync(base);

let html = fs.readFileSync("./menu.html").toString();
let ul_html = '\n<div class="view">';

const mlList = [
    'Funny-demo',
    'Particle-demo',
    'Game-demo',
    '3D-demo',
    'Other-demo',
];

//对文件夹更改进行排序
files.sort(function(a, b){
    let astat = fs.lstatSync(base + a);
    let bstat = fs.lstatSync(base + b);

    return bstat.mtime - astat.mtime;
});

mlList.forEach(function(f){
    var npath = base + "/" + f;
    var array = findHtml(npath);

    array.sort(function(a, b){
        return b[2].mtime - a[2].mtime
    });

    if(array.length > 0){
        ul_html += `\n<p>${f}</p>\n<ul class="main">\n`;

        array.forEach(function(p){
            let title = /<title>(.*)<\/title>/.test(fs.readFileSync(p[0]).toString()) ? RegExp.$1 : "Document";
            let filedir = path.dirname(sourcePrefix+p[0]);
            ul_html += `<li><a href="${p[0]}" target="_blank" class="demo-name" title="效果预览">${title}</a><a href="${filedir}" class="demo-source" target="_blank" title="点击查看源码">源码</a></li>\n`;
        });

        ul_html += '</ul>\n';
    }
});

ul_html += "</div>\n";
html = html.replace(/(<body>)[\s\S]*?(<\/body>)/ , "$1"+ul_html+"$2");
fs.writeFileSync("./menu.html" , html);

function findHtml(folder_path , collector){
    collector = collector || [];

    let files = fs.readdirSync(folder_path += "/");
    let npath, stat;

    files.forEach(function(f){
        npath = folder_path + f;
        stat = fs.lstatSync(npath);

        if(stat.isDirectory()){
            findHtml(npath , collector);
            return;
        }

        if(/^[^_].+\.html/.test(f)){
            collector.push([npath , f, stat]);
        }
    });

    return collector;
}
