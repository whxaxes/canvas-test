/*
 * Sobel.
 */
function Sobel(options) {
    this.img = document.getElementById(options.element);
    this.canvas = this.prepareCanvas(this.img, options.size);
    this.kernel = options.kernel;
}

Sobel.prototype = {
    prepareCanvas: function(element, size) {
        var canvas = document.createElement('canvas');
        canvas.setAttribute("id", "targetCanvas");
        canvas.width = size;
        canvas.height = size;
        this.img.parentNode.appendChild(canvas);

        var context = canvas.getContext('2d');
        context.drawImage(element, 0, 0, size, size);
        return canvas;
    },
    reduceColor: function() {
        var width = this.canvas.width;
        var height = this.canvas.height;
        var context = this.canvas.getContext('2d');
        var imageData = context.getImageData(0, 0, width, height);
        var pixels = imageData.data;

        var r, g, b, value;
        var table = new Array(height);
        for (var j = 0; j < height; j++) {
            table[j] = new Array(width);
        }

        for (var i = 0; i < pixels.length; i+=4) {
            value = Math.floor((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3);
            table[Math.floor((i / 4) / width)][(i / 4) % width] = value;
        }
        return table;
    },
    calc: function () {
        var context = this.canvas.getContext('2d');
        var width = this.canvas.width;
        var height = this.canvas.height;
        var imageData = context.getImageData(0, 0, width, height);
        var pixels = imageData.data;


        var kernel = this.kernel;
        var reducedImage = this.reduceColor();
        var getReducedValue = function(x, y) {
            return (x < 0 || width <= x || y < 0 || height <= y) ? 0: reducedImage[x][y];
        }
        var calcValue = function(x, y) {
            var result = 0;
            for (var i = -1; i <= 1; i++) {
                for (var j = -1; j <= 1; j++) {
                    result += kernel[i + 1][j + 1] * getReducedValue(x + i, y + j);
                }
            }
            return result;
        }

        for (i = 0; i < pixels.length; i+=4) {
            x = Math.floor((i / 4 / width));
            y = Math.floor((i / 4) % width);
            value = Math.min(calcValue(x, y), 255);
            pixels[i] = value;
            pixels[i+1] = value;
            pixels[i+2] = value;
        }
        context.putImageData(imageData, 0, 0);
    },
}
