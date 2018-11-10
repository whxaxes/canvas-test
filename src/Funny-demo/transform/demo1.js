!(function() {
  'use strict';

  //是否显示点的checkbox
  var dotChoose = document.getElementById('dot');
  //是否显示方格的checkbox
  var rectChoose = document.getElementById('rect');
  //是否显示贴图的checkbox
  var picChoose = document.getElementById('pic');
  //将图片分割的分数控制
  var countChoose = document.getElementById('count');

  //获取url后面跟的参数
  var a = document.createElement('A');
  a.href = window.location.href;
  var ret = {},
    seg = a.search.replace(/^\?/, '').split('&'),
    len = seg.length,
    i = 0,
    s;
  for (; i < len; i++) {
    if (!seg[i]) continue;
    s = seg[i].split('=');
    ret[s[0]] = s[1];
  }

  //如果url后面有跟参数，则用参数赋值
  if ('dot' in ret) {
    if (ret.dot === 'true') dotChoose.setAttribute('checked', '');
    else dotChoose.removeAttribute('checked');
  }
  if ('rect' in ret) {
    if (ret.rect === 'true') rectChoose.setAttribute('checked', '');
    else rectChoose.removeAttribute('checked');
  }
  if ('pic' in ret) {
    if (ret.pic === 'true') picChoose.setAttribute('checked', '');
    else picChoose.removeAttribute('checked');
  }

  var hasDot = dotChoose.checked,
    hasRect = rectChoose.checked,
    hasPic = picChoose.checked,
    imgRatio = 1,
    count = getSelected();

  dotChoose.onchange = function() {
    hasDot = this.checked;
    render();
  };
  rectChoose.onchange = function() {
    hasRect = this.checked;
    render();
  };
  picChoose.onchange = function() {
    hasPic = this.checked;
    render();
  };
  countChoose.onchange = function() {
    count = getSelected();
    //count更改后需要重新计算所有点的初始位置
    idots = rectsplit(count, dotscopy[0], dotscopy[1], dotscopy[2], dotscopy[3]);
    render();
  };

  function getSelected() {
    var ops = countChoose.getElementsByTagName('OPTION'),
      op;
    for (var i = 0; i < ops.length; i++) {
      op = ops[i];
      if (op.selected) return +op.value;
    }
  }

  var canvas = document.getElementById('cas');
  var ctx = canvas.getContext('2d');

  var dots = [];
  var dotscopy, idots;

  var img = new Image();
  var maxHeight = 460;
  img.src = './img/test.jpg';
  img.onload = function() {
    var img_w = img.width,
      img_h = img.height;

    if (img_h > maxHeight) {
      imgRatio = maxHeight / img_h;
      img_h = maxHeight;
      img_w *= imgRatio;
    }

    var left = (canvas.width - img_w) / 2;
    var top = (canvas.height - img_h) / 2;

    img.width = img_w;
    img.height = img_h;

    dots = [
      { x: left, y: top },
      { x: left + img_w, y: top },
      { x: left + img_w, y: top + img_h },
      { x: left, y: top + img_h },
    ];

    //保存一份不变的拷贝
    dotscopy = [
      { x: left, y: top },
      { x: left + img_w, y: top },
      { x: left + img_w, y: top + img_h },
      { x: left, y: top + img_h },
    ];

    //获得所有初始点坐标
    idots = rectsplit(count, dotscopy[0], dotscopy[1], dotscopy[2], dotscopy[3]);

    render();
  };

  /**
   * 鼠标拖动事件绑定
   * @param e
   */
  window.onmousedown = function(e) {
    if (!dots.length) return;

    var area = getArea(e);
    var dot, i;
    //鼠标事件触发区域
    var qy = 40;

    for (i = 0; i < dots.length; i++) {
      dot = dots[i];
      if (area.t >= dot.y - qy && area.t <= dot.y + qy && area.l >= dot.x - qy && area.l <= dot.x + qy) {
        break;
      } else {
        dot = null;
      }
    }

    if (!dot) return;

    window.onmousemove = function(e) {
      var narea = getArea(e);
      var nx = narea.l - area.l;
      var ny = narea.t - area.t;

      dot.x += nx;
      dot.y += ny;

      area = narea;

      render();
    };

    window.onmouseup = function() {
      window.onmousemove = null;
      window.onmouseup = null;
    };
  };

  /**
   * 获取鼠标点击/移过的位置
   * @param e
   * @returns {{t: number, l: number}}
   */
  function getArea(e) {
    e = e || window.event;
    return {
      t: e.clientY - canvas.offsetTop + document.body.scrollTop + document.documentElement.scrollTop,
      l: e.clientX - canvas.offsetLeft + document.body.scrollLeft + document.documentElement.scrollLeft,
    };
  }

  /**
   * 画布渲染
   */
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var ndots = rectsplit(count, dots[0], dots[1], dots[2], dots[3]);

    ndots.forEach(function(d, i) {
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
        renderImage(idot3, dot3, idot2, dot2, idot4, dot4, idot1);

        //绘制三角形的上半部分
        renderImage(idot1, dot1, idot2, dot2, idot4, dot4, idot1);
      }

      if (hasDot) {
        ctx.fillStyle = 'red';
        ctx.fillRect(d.x - 1, d.y - 1, 2, 2);
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
  function renderImage(arg_1, _arg_1, arg_2, _arg_2, arg_3, _arg_3, vertex) {
    ctx.save();

    // if (!_arg_1.img) {
    //   var canvas = document.createElement('canvas');
    //   var _ctx = canvas.getContext('2d');
    //   var w = img.width / count;
    //   var h = img.height / count;
    //   canvas.width = w;
    //   canvas.height = h;
    //   _ctx.beginPath();
    //   _ctx.moveTo(_arg_1.x - vertex.x, _arg_1.y - vertex.y);
    //   _ctx.lineTo(_arg_2.x - vertex.x, _arg_2.y - vertex.y);
    //   _ctx.lineTo(_arg_3.x - vertex.x, _arg_3.y - vertex.y);
    //   _ctx.closePath();

    //   if (hasRect) {
    //     _ctx.lineWidth = 2;
    //     _ctx.strokeStyle = 'red';
    //     _ctx.stroke();
    //   }

    //   _ctx.clip();

    //   //绘制图片
    //   _ctx.drawImage(
    //     img,
    //     (vertex.x - idots[0].x) / imgRatio,
    //     (vertex.y - idots[0].y) / imgRatio,
    //     w / imgRatio,
    //     h / imgRatio,
    //     0,
    //     0,
    //     w,
    //     h
    //   );

    //   _arg_1.img = canvas;
    // }

    //根据变换后的坐标创建剪切区域
    ctx.beginPath();
    ctx.moveTo(_arg_1.x, _arg_1.y);
    ctx.lineTo(_arg_2.x, _arg_2.y);
    ctx.lineTo(_arg_3.x, _arg_3.y);
    ctx.closePath();
    if (hasRect) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'red';
      ctx.stroke();
    }
    ctx.clip();

    if (hasPic) {
      //传入变换前后的点坐标，计算变换矩阵
      var result = matrix.getMatrix.apply(this, arguments);

      //变形
      ctx.transform(result.a, result.b, result.c, result.d, result.e, result.f);

      var w = img.width / count;
      var h = img.height / count;

      //绘制图片
      ctx.drawImage(
        img,
        (vertex.x - idots[0].x) / imgRatio - 1,
        (vertex.y - idots[0].y) / imgRatio - 1,
        w / imgRatio + 2,
        h / imgRatio + 2,
        vertex.x - 1,
        vertex.y - 1,
        w + 2,
        h + 2
      );
    }

    ctx.restore();
  }

  /**
   * 将 abcd 四边形分割成 n 的 n 次方份，获取 n 等分后的所有点坐标
   * @param n     多少等分
   * @param a     a 点坐标
   * @param b     b 点坐标
   * @param c     c 点坐标
   * @param d     d 点坐标
   * @returns {Array}
   */
  function rectsplit(n, a, b, c, d) {
    // ad 向量方向 n 等分
    var ad_x = (d.x - a.x) / n;
    var ad_y = (d.y - a.y) / n;
    // bc 向量方向 n 等分
    var bc_x = (c.x - b.x) / n;
    var bc_y = (c.y - b.y) / n;

    var ndots = [];
    var x1, y1, x2, y2, ab_x, ab_y;

    //左边点递增，右边点递增，获取每一次递增后的新的向量，继续 n 等分，从而获取所有点坐标
    for (var i = 0; i <= n; i++) {
      //获得 ad 向量 n 等分后的坐标
      x1 = a.x + ad_x * i;
      y1 = a.y + ad_y * i;
      //获得 bc 向量 n 等分后的坐标
      x2 = b.x + bc_x * i;
      y2 = b.y + bc_y * i;

      for (var j = 0; j <= n; j++) {
        // ab 向量为：[x2 - x1 , y2 - y1]，所以 n 等分后的增量为除于 n
        ab_x = (x2 - x1) / n;
        ab_y = (y2 - y1) / n;

        ndots.push({
          x: x1 + ab_x * j,
          y: y1 + ab_y * j,
        });
      }
    }

    return ndots;
  }
})();
