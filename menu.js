//be used to create a menu.html

var fs = require("fs");

var base = "./src/";
var files = fs.readdirSync(base);

var html = fs.readFileSync("./menu.html").toString();
var ul_html = '\n<div class="view">';
files.forEach(function(f){
    var npath = base + f;
    var array;

    if(fs.lstatSync(npath).isDirectory()){
        array = findHtml(npath);

        if(array.length > 0){
            ul_html += '\n<p>' + f + '</p>\n<ul class="main">\n';

            array.forEach(function(p){
                var title = /<title>(.*)<\/title>/.test(fs.readFileSync(p[0]).toString()) ? RegExp.$1 : "Document";
                ul_html += '<li><a href="' + p[0] + '" target="_blank">' + title + '(' + p[1] + ')</a></li>\n';
            });

            ul_html += '</ul>\n';
        }
    }
});
ul_html += "</div>\n";
html = html.replace(/(<body>)[\s\S]*?(<\/body>)/ , "$1"+ul_html+"$2");
fs.writeFileSync("./menu.html" , html);

function findHtml(folder_path , collector){
    collector = collector || [];

    folder_path += "/";
    var files = fs.readdirSync(folder_path);

    files.forEach(function(f){
        var npath = folder_path + f;

        if(fs.lstatSync(npath).isDirectory()){
            findHtml(npath , collector);
            return;
        }

        if(/\.html$/.test(f)){
            collector.push([npath , f]);
        }
    });

    return collector;
}
