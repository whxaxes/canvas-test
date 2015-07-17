!function () {
    "use strict";

    var stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.right = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild( stats.domElement );

    //是否显示点的checkbox
    var dotChoose = document.getElementById("dot");
    //是否显示方格的checkbox
    var rectChoose = document.getElementById("rect");
    //是否显示贴图的checkbox
    var picChoose = document.getElementById("pic");
    //将图片分割的分数控制
    var countChoose = document.getElementById("count");

    //获取url后面跟的参数
    var a = document.createElement("A");
    a.href = window.location.href;
    var ret = {},
        seg = a.search.replace(/^\?/, '').split("&"),
        len = seg.length,
        i = 0, s;
    for (; i < len; i++) {
        if (!seg[i])continue;
        s = seg[i].split("=");
        ret[s[0]] = s[1];
    }

    //如果url后面有跟参数，则用参数赋值
    if ('dot' in ret) {
        if (ret.dot === "true") dotChoose.setAttribute("checked", "");
        else dotChoose.removeAttribute("checked");
    }
    if ('rect' in ret) {
        if (ret.rect === "true") rectChoose.setAttribute("checked", "");
        else rectChoose.removeAttribute("checked");
    }
    if ('pic' in ret) {
        if (ret.pic === "true") picChoose.setAttribute("checked", "");
        else picChoose.removeAttribute("checked");
    }

    var RAF = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    var hasDot = dotChoose.checked,
        hasRect = rectChoose.checked,
        hasPic = picChoose.checked,
        count = getSelected();

    dotChoose.onchange = function () {hasDot = this.checked;render();};
    rectChoose.onchange = function () {hasRect = this.checked;render();};
    picChoose.onchange = function () {hasPic = this.checked;render();};
    countChoose.onchange = function(){
        count = getSelected();
        //count更改后需要重新计算所有点的初始位置
        idots = rectsplit(count, dots[0], dots[1], dots[2], dots[3]);
        ndots = rectsplit(count, dots[0], dots[1], dots[2], dots[3]);
        render();
    };

    function getSelected(){
        var ops = countChoose.getElementsByTagName("OPTION") ,op;
        for(var i=0;i<ops.length;i++){
            op = ops[i];
            if(op.selected)return +op.value;
        }
    }

    var canvas = document.getElementById("cas");
    var ctx = canvas.getContext("2d");

    var dots = [];
    var idots, ndots;

    var img = new Image();
    img.src = "./img/test.jpg";
    img.onload = function () {
        var img_w = img.width / 2;
        var img_h = img.height / 2;
        var left = (canvas.width - img_w) / 2;
        var top = (canvas.height - img_h) / 2;

        img.width = img_w;
        img.height = img_h;

        dots = [
            {x: left, y: top},
            {x: left + img_w, y: top},
            {x: left + img_w, y: top + img_h},
            {x: left, y: top + img_h}
        ];

        //获得所有初始点坐标
        idots = rectsplit(count, dots[0], dots[1], dots[2], dots[3]);

        ndots = rectsplit(count, dots[0], dots[1], dots[2], dots[3]);

        render();
    };

    var area={};
    window.onmousemove = function (e) {
        if(!ndots) return;
        e = e || window.event;

        area = {
            x: e.clientX - canvas.offsetLeft + document.body.scrollLeft + document.documentElement.scrollLeft,
            y: e.clientY - canvas.offsetTop + document.body.scrollTop + document.documentElement.scrollTop
        };
    };

    //动画循环舞台
    var maxDis = 140,
        focallength = 250;
    animate();
    function animate(){
        var len = ndots ? ndots.length : 0,
            ax = area.x,
            ay = area.y,
            d, c, scale, dis, xc, yc;

        while(len){
            len--;

            d = ndots[len];

            if(!d.ix){
                d.ix = d.x;
                d.iy = d.y;
                d.z = 0;
                //d.a = 1;
                //d.up = false;
            }

            if (ax == null || ay == null) break;

            xc = d.ix - ax;
            yc = d.iy - ay;

            dis = Math.sqrt(xc*xc + yc*yc);

            //将效果放大两倍
            d.ez = (maxDis - dis) * 2;
            if(d.ez >= 0){
                d.ax = ax;
                d.ay = ay;
            }else {
                d.ez = 0;
            }

            //赋给目的z轴值ez以及当前z轴值z
            c = d.ez - d.z;
            d.z += c * 0.1;

//            c = d.ez - d.z;
//            c = c < 0 ? 0 : c;
//            if(d.ez >= d.z){
//                if(!d.up) d.a = 0;
//
//                d.up = true;
//                d.a += c*0.05;
//
//                d.z += d.a;
//
//                d.z = d.z >= d.ez ? d.ez : d.z
//            }else {
//                if(d.up) d.a = 0;
//
//                d.up = false;
//                d.a -= 1;
//
//                d.z += d.a;
//                d.z = d.z <= d.ez ? d.ez : d.z
//            }

            scale = focallength / (focallength + d.z);

            d.x = (d.ax || ax) + (d.ix - (d.ax || ax)) / scale;
            d.y = (d.ay || ay) + (d.iy - (d.ay || ay)) / scale;
        }

        render();

        stats.update();

        RAF(animate);
    }

    /**
     * 画布渲染
     */
    function render() {
        if(!ndots) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillRect(dots[0].x , dots[0].y , img.width, img.height)
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#fff";

        ndots.forEach(function (d, i) {
            //获取平行四边形的四个点
            var dot1 = ndots[i];
            var dot2 = ndots[i + 1];
            var dot3 = ndots[i + count + 2];
            var dot4 = ndots[i + count + 1];

            //获取初始平行四边形的四个点
            var idot1 = idots[i];
            var idot2 = idots[i + 1];
            var idot3 = idots[i + count + 2];
            var idot4 = idots[i + count + 1];

            if (dot2 && dot3 && i % (count + 1) < count) {
                //绘制三角形的下半部分
                renderImage(idot3, dot3, idot2, dot2, idot4, dot4);

                //绘制三角形的上半部分
                renderImage(idot1, dot1, idot2, dot2, idot4, dot4);
            }

            if (hasDot) {
                ctx.save();
                ctx.fillStyle = "red";
                ctx.fillRect(d.x - 1, d.y - 1, 2, 2);
                ctx.restore();
            }
        });
    }

    /**
     * 计算矩阵，同时渲染图片
     * @param arg_1
     * @param _arg_1
     * @param arg_2
     * @param _arg_2
     * @param arg_3
     * @param _arg_3
     */
    function renderImage(arg_1, _arg_1, arg_2, _arg_2, arg_3, _arg_3) {
        ctx.save();
        //根据变换后的坐标创建剪切区域
        ctx.beginPath();
        ctx.moveTo(_arg_3.x, _arg_3.y);
        ctx.lineTo(_arg_1.x, _arg_1.y);
        ctx.lineTo(_arg_2.x, _arg_2.y);
        if(hasRect) ctx.stroke();
        ctx.closePath();
        ctx.clip();

        var result;
        if (hasPic) {
            //传入变换前后的点坐标，计算变换矩阵
            if(arg_1.x !==_arg_1.x || arg_1.y!==_arg_1.y || arg_2.x!==_arg_2.x || arg_2.y!==_arg_2.y || arg_3.x!==_arg_3.x || arg_3.y!==_arg_3.y){
                result = matrix.getMatrix.apply(this, arguments);
                ctx.transform(result.a, result.b, result.c, result.d, result.e, result.f);
            }

            //绘制图片
            ctx.drawImage(img, idots[0].x, idots[0].y, img.width, img.height);
        }

        ctx.restore();
    }


    /**
     * 将abcd四边形分割成n的n次方份，获取n等分后的所有点坐标
     * @param n     多少等分
     * @param a     a点坐标
     * @param b     b点坐标
     * @param c     c点坐标
     * @param d     d点坐标
     * @returns {Array}
     */
    function rectsplit(n, a, b, c, d) {
        //ad向量方向n等分
        var ad_x = (d.x - a.x) / n;
        var ad_y = (d.y - a.y) / n;
        //bc向量方向n等分
        var bc_x = (c.x - b.x) / n;
        var bc_y = (c.y - b.y) / n;

        var ndots = [];
        var x1, y1, x2, y2, ab_x, ab_y;

        //左边点递增，右边点递增，获取每一次递增后的新的向量，继续n等分，从而获取所有点坐标
        for (var i = 0; i <= n; i++) {
            //获得ad向量n等分后的坐标
            x1 = a.x + ad_x * i;
            y1 = a.y + ad_y * i;
            //获得bc向量n等分后的坐标
            x2 = b.x + bc_x * i;
            y2 = b.y + bc_y * i;

            for (var j = 0; j <= n; j++) {
                //ab向量为：[x2 - x1 , y2 - y1]，所以n等分后的增量为除于n
                ab_x = (x2 - x1) / n;
                ab_y = (y2 - y1) / n;

                ndots.push({
                    x: x1 + ab_x * j,
                    y: y1 + ab_y * j
                })
            }
        }

        return ndots;
    }
}()
