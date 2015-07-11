!function(){
    var canvas = document.getElementById("cas");
    var ctx = canvas.getContext("2d");

    var dr = 4;
    var dots = [];
    var idots;

    var img = new Image();
    img.src = "./test2.jpg";
    img.onload = function(){
        var img_w = img.width/2;
        var img_h = img.height/2;
        var left = (canvas.width - img_w)/2;
        var top = (canvas.height - img_h)/2;

        img.width = img_w;
        img.height = img_h;

        dots = [
            { x:left, y:top },
            { x:left + img_w, y:top },
            { x:left + img_w, y:top + img_h},
            { x:left, y:top + img_h}
        ];

        idots = [
            { x:left, y:top },
            { x:left + img_w, y:top },
            { x:left + img_w, y:top + img_h},
            { x:left, y:top + img_h}
        ];

        render()
    };

    window.onmousedown = function(e){
        if(!dots.length)return;

        var area = getArea(e);
        var dot,i;

        for (i = 0; i < dots.length; i++) {
            dot = dots[i];
            if (area.t >= (dot.y - dr) && area.t <= (dot.y + dr) && area.l >= (dot.x - dr) && area.l <= (dot.x + dr)) {
                break;
            } else {
                dot = null;
            }
        }

        if(!dot) return;

        window.onmousemove = function(e){
            var narea = getArea(e);
            var nx = narea.l-area.l;
            var ny = narea.t-area.t;

            dot.x += nx;
            dot.y += ny;

            area = narea;

            render();
        };

        window.onmouseup = function(){
            window.onmousemove = null;
            window.onmouseup = null;
        }
    };

    function getArea(e){
        e = e || window.event;
        return {
            t : e.clientY - canvas.offsetTop + document.body.scrollTop + document.documentElement.scrollTop,
            l : e.clientX - canvas.offsetLeft + document.body.scrollLeft + document.documentElement.scrollLeft
        }
    }

    function render(){
        ctx.clearRect(0,0,canvas.width,canvas.height);

        ctx.fillStyle = "#fff";
        dots.forEach(function(d , i){
            ctx.fillRect(d.x - dr, d.y - dr, dr * 2, dr * 2);
            ctx.strokeRect(d.x - dr, d.y - dr, dr * 2, dr * 2);
        });
        ctx.restore();

        var ndots = caculate(100);

        ctx.save();
        ctx.fillStyle = "red";
        ndots.forEach(function(d , i){
            ctx.fillRect(d.x-1 , d.y-1 , 2 , 2)
        });
        ctx.restore();

//        renderByAlge(idots[2] , dots[2], idots[1] , dots[1] , idots[3] , dots[3]);
//        renderByAlge(idots[0] , dots[0], idots[1] , dots[1] , idots[3] , dots[3]);
    }


    //将方框n等分，获取所有点坐标
    function caculate(n){
        //ad向量方向n等分
        var ad_x = (dots[3].x - dots[0].x)/n;
        var ad_y = (dots[3].y - dots[0].y)/n;
        //bc向量方向n等分
        var bc_x = (dots[2].x - dots[1].x)/n;
        var bc_y = (dots[2].y - dots[1].y)/n;

        var ndots = [];
        var dot , dot2;
        var ab_x,ab_y;
        //左边点递增，右边点递增，获取每一次递增后的新的向量，继续n等分，从而获取所有点坐标
        for(var i=0;i<=n;i++){
            dot = {
                x: dots[0].x + ad_x * i,
                y: dots[0].y + ad_y * i
            };
            dot2 = {
                x: dots[1].x + bc_x * i,
                y: dots[1].y + bc_y * i
            }
            for(var j=0;j<=n;j++){
                //ab向量方向n等分
                ab_x = (dot2.x - dot.x)/n;
                ab_y = (dot2.y - dot.y)/n;

                ndots.push({
                    x: dot.x + ab_x * j,
                    y: dot.y + ab_y * j
                })
            }
        }

        var rects = [];


        return ndots;
    }

    /**
     * 使用代数法计算矩阵
     */
    function renderByAlge(arg_1 , _arg_1 , arg_2 , _arg_2 , arg_3 , _arg_3){
        ctx.save();
        //根据变换后的坐标创建剪切区域
        ctx.beginPath();
        ctx.moveTo(_arg_1.x, _arg_1.y);
        ctx.lineTo(_arg_2.x, _arg_2.y);
        ctx.lineTo(_arg_3.x, _arg_3.y);
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.stroke();
        ctx.clip();

        //传入变换前后的点坐标，计算变换矩阵
        var matrix = getMatrix.apply(this , arguments);

        //变形
        ctx.transform(matrix.a , matrix.b , matrix.c , matrix.d , matrix.e , matrix.f);

        //绘制图片
        ctx.drawImage(img , idots[0].x , idots[0].y , img.width , img.height);

        ctx.restore();
    }

    /**
     * 根据向量来计算矩阵
     * @param dot1
     * @param dot2
     * @param dot3
     * @param isf
     */
    function renderByVector(dot1 , dot2 , dot3 , isf){
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(dot1.x, dot1.y);
        ctx.lineTo(dot2.x, dot2.y);
        ctx.lineTo(dot3.x, dot3.y);
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.stroke();
        ctx.clip();

        //点1指向点2的 向量1
        var xl1 = [dot2.x-dot1.x , dot2.y - dot1.y];

        //点1指向点3的 向量2
        var xl2 = [dot3.x-dot1.x , dot3.y - dot1.y];

        //向量1和向量2的向量和
        var xl3 = [xl1[0] + xl2[0] , xl1[1] + xl2[1]];

        //算出平行四边形的第四个端点坐标
        var edot = { x:xl3[0] + dot1.x, y:xl3[1] + dot1.y };

        //平行四边形中点坐标
        var mdot = { x:(edot.x + dot1.x)/2, y:(edot.y + dot1.y)/2 };

        //基本点坐标，是以哪个点为基准绘制图片
        var base = isf ? edot : dot1;

        //基于x轴的斜切 和 基于y轴的斜切
        var xq = (dot2.y - base.y) / (dot2.x - base.x);
        var yq = (dot3.x - base.x) / (dot3.y - base.y);

        var img_w = Math.abs(dot2.x - base.x);
        var img_h = Math.abs(dot3.y - base.y);

        ctx.setTransform(1, xq, yq, 1, mdot.x , mdot.y);
        ctx.drawImage(img , -img_w/2 , -img_h/2 , img_w , img_h);

        ctx.restore();
    }
}();