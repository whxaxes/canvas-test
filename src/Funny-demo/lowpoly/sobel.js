//Sobel边缘检测算法
(function(root) {
  'use strict';

  var kernelX = [
    [-1,0,1],
    [-2,0,2],
    [-1,0,1]
  ];

  var kernelY = [
    [-1,-2,-1],
    [0,0,0],
    [1,2,1]
  ];

  function Sobel(imgdata , callback){
    var w = imgdata.width;
    var h = imgdata.height;
    var data = imgdata.data;

    //获取x、y所处像素点的rgb值，并返回平均值
    function getAvg(x , y){
      var i = ((w * y) + x) * 4;
      var r = data[i];
      var g = data[i+1];
      var b = data[i+2];

      return (r + g + b) / 3;
    }

    for(var y=0;y<h;y++){
      for(var x = 0;x<w;x++){
        var pixelX = (
          (kernelX[0][0] * getAvg(x - 1, y - 1)) +
          (kernelX[0][1] * getAvg(x, y - 1)) +
          (kernelX[0][2] * getAvg(x + 1, y - 1)) +
          (kernelX[1][0] * getAvg(x - 1, y)) +
          (kernelX[1][1] * getAvg(x, y)) +
          (kernelX[1][2] * getAvg(x + 1, y)) +
          (kernelX[2][0] * getAvg(x - 1, y + 1)) +
          (kernelX[2][1] * getAvg(x, y + 1)) +
          (kernelX[2][2] * getAvg(x + 1, y + 1))
        );

        var pixelY = (
          (kernelY[0][0] * getAvg(x - 1, y - 1)) +
          (kernelY[0][1] * getAvg(x, y - 1)) +
          (kernelY[0][2] * getAvg(x + 1, y - 1)) +
          (kernelY[1][0] * getAvg(x - 1, y)) +
          (kernelY[1][1] * getAvg(x, y)) +
          (kernelY[1][2] * getAvg(x + 1, y)) +
          (kernelY[2][0] * getAvg(x - 1, y + 1)) +
          (kernelY[2][1] * getAvg(x, y + 1)) +
          (kernelY[2][2] * getAvg(x + 1, y + 1))
        );

        var magnitude = Math.sqrt((pixelX * pixelX) + (pixelY * pixelY))>>0;

        callback(magnitude , x , y);
      }
    }
  }

  root.Sobel = Sobel;

})(this);
