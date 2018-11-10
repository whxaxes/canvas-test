var renderer = initTime(28, 20, 30, 4);
updateTime();

function updateTime() {
  var date = new Date();
  renderer.render(
    '北京时间 {{ year }} 年 {{ month }} 月 {{ day }} 日 {{ hour }}:{{ minute }}:{{ second }} ~~',
    {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    }
  );

  setTimeout(updateTime, 1000);
}

// time handle
function initTime(fontSize, numWidth, numHeight, lineWidth) {
  var time = document.getElementById('time');
  var front = document.createElement('canvas');
  var frontCtx = front.getContext('2d');
  var back = document.createElement('canvas');
  var backCtx = back.getContext('2d');
  var ratio = window.devicePixelRatio || 1;
  var color = '#666';
  time.appendChild(back);
  time.appendChild(front);
  front.width = back.width = time.offsetWidth * ratio;
  front.height = back.height = time.offsetHeight * ratio;
  frontCtx.strokeStyle = color;
  frontCtx.lineCap = 'round';
  frontCtx.lineJoin = 'round';

  fontSize *= ratio;
  numWidth *= ratio;
  numHeight *= ratio;
  lineWidth *= ratio;
  var halfFontSize = fontSize / 2;
  var halfNumWidth = numWidth / 2;
  var halfNumHeight = numHeight / 2;
  var middleLinePosY = back.height / 2;
  backCtx.textAlign = 'center';
  backCtx.textBaseline = 'middle';
  backCtx.font = fontSize + 'px sans-serif, "黑体"';

  var currentTemp;
  var parseResult;
  var ready = false;
  var lineStore = {};
  var timeMap = {
    0: '1110111', // |-|_ |_|
    1: '0010001',
    2: '0111110',
    3: '0111011',
    4: '1011001',
    5: '1101011',
    6: '1101111',
    7: '0110001',
    8: '1111111',
    9: '1111011',
  };

  // parse template
  function parseTemplate(template) {
    var fields = [];
    var renderList = [];

    while (template) {
      var match = template.match(/{{\s*(\w+)\s*}}/);
      var text = template.substring(0, (match || {}).index || template.length);
      var cnLen = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
      var fontWidth = cnLen * fontSize + (text.length - cnLen) * halfFontSize;
      renderList.push({ text: text, width: fontWidth });

      if (!match) {
        break;
      }
  
      var field = match[1];
      renderList.push({ field });
      fields.push(field);
      template = template.substring(match.index + match[0].length);
    }
    return { fields: fields, renderList: renderList };
  }

  // format time
  function formatTime(n) {
    n = String(n);
    return n.length === 1 ? '0' + n : n;
  }

  function Line(pos1, pos2, frontLine) {
    this.pos1 = pos1;
    this.pos2 = pos2;
    this.value = '0';
    this.moving = false;
    this.shouldMove = false;
    this.frontLine = frontLine;

    this.start = pos1;
    this.end = pos1;
    this.direction = false;

    this.movingPos = null;
    this.goalPos = null;
    this.addPos = null;
  }

  var lp = Line.prototype;
  lp.frontIsStatic = function() {
    return !this.frontLine || (this.frontLine && this.frontLine.isStatic());
  };

  lp.isStatic = function() {
    return !this.moving && this.frontIsStatic();
  };

  lp.update = function() {
    if (this.frontIsStatic()) {
      this.moving = this.shouldMove;
    }

    if (this.moving) {
      this.updateToGoal();

      if (this.equal(this.movingPos, this.goalPos)) {
        this.shouldMove = this.moving = false;
      }
    }

    if (!this.equal(this.start, this.end) || this.moving) {
      frontCtx.moveTo(this.start.x, this.start.y);
      frontCtx.lineTo(this.end.x, this.end.y);
    }
  };

  lp.updateToGoal = function() {
    if (this.movingPos.x !== this.goalPos.x) {
      this.movingPos.x += this.addPos.x;
      if (Math.abs(this.movingPos.x - this.goalPos.x) <= 0.1) {
        this.movingPos.x = this.goalPos.x;
      }
    }

    if (this.movingPos.y !== this.goalPos.y) {
      this.movingPos.y += this.addPos.y;
      if (Math.abs(this.movingPos.y - this.goalPos.y) <= 0.1) {
        this.movingPos.y = this.goalPos.y;
      }
    }
  };

  lp.equal = function(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  };

  lp.move = function(type) {
    this.shouldMove = true;
    var newPos1 = { x: this.pos1.x, y: this.pos1.y };
    var newPos2 = { x: this.pos2.x, y: this.pos2.y };
    if (type === 1) {
      this.start = this.pos1;
      this.movingPos = this.end = newPos1;
      this.goalPos = newPos2;
    } else if (type === 2) {
      this.start = this.pos1;
      this.movingPos = this.end = newPos2;
      this.goalPos = newPos1;
    } else if (type === 3) {
      this.end = this.pos2;
      this.movingPos = this.start = newPos2;
      this.goalPos = newPos1;
    } else {
      this.end = this.pos2;
      this.movingPos = this.start = newPos1;
      this.goalPos = newPos2;
    }

    this.addPos = {
      x: (this.goalPos.x - this.movingPos.x) / 7,
      y: (this.goalPos.y - this.movingPos.y) / 7,
    };
  };

  function drawBackground(timeObj) {
    lineStore = {};
    backCtx.clearRect(0, 0, back.width, back.height);
    backCtx.lineWidth = frontCtx.lineWidth = lineWidth;
    backCtx.fillStyle = color;

    var startX = 0;
    var y = middleLinePosY;
    var distance = 4;
    var a = distance;
    var b = a + numWidth;
    var c = y - halfNumHeight;
    var d = y + halfNumHeight;

    // foreach and draw
    parseResult.renderList.forEach(function(item) {
      if (item.text) {
        // draw font
        var textLen = item.text.length;
        backCtx.fillText(item.text, startX + item.width / 2, y);
        startX += item.width;
      } else if(item.field) {
        // draw date number
        var num = timeObj[item.field];
        var numStr = formatTime(num);
        for (var j = 0; j < numStr.length; j++) {
          var val = numStr[j];
          var map = timeMap[+val];
          var e = startX + a;
          var f = startX + b;
          var coors = [
            { x: e, y: y }, // left-mid
            { x: e, y: c }, // left-top
            { x: f, y: c }, // right-top
            { x: f, y: y }, // right-mid
            { x: e, y: y }, // left-mid
            { x: e, y: d }, // left-bottom
            { x: f, y: d }, // right-bottom
            { x: f, y: y }, // right-mid
          ];
  
          var lineList = (lineStore[item.field + '_' + j] = []);
          backCtx.beginPath();
          backCtx.moveTo(coors[0].x, coors[0].y);
          for (var k = 1; k < coors.length; k++) {
            backCtx.lineTo(coors[k].x, coors[k].y);
            var line = new Line(coors[k - 1], coors[k], lineList[lineList.length - 1]);
            lineList.push(line);
          }
          backCtx.strokeStyle = '#eee';
          backCtx.stroke();
          startX += numWidth + distance * 2;
        }
      }
    });
  }

  function updateTimeTransform(timeObj) {
    // calculate moving direction of line
    parseResult.fields.forEach(function(field) {
      var num = timeObj[field];
      var numStr = formatTime(num);

      for (var j = 0; j < numStr.length; j++) {
        var lines = lineStore[field + '_' + j];
        if (!lines) {
          continue;
        }

        var val = numStr[j];
        var map = timeMap[+val];
        for (var k = 0; k < map.length; k++) {
          var val = map[k];
          var line = lines[k];
          if (line.value === val) {
            continue;
          }

          line.value = val;
          if (val === '1') {
            if (lines[k + 1] && lines[k + 1].value === '1') {
              // 1 -> 2
              line.move(3);
            } else {
              // 1 <- 2
              line.move(1);
            }
          } else {
            if (lines[k - 1] && lines[k - 1].value === '1') {
              // 1 -> 2
              line.move(2);
            } else {
              // 1 <- 2
              line.move(4);
            }
          }
        }
      }
    });
  }

  var time = 0;
  function animate() {
    frontCtx.clearRect(0, 0, front.width, front.height);
    frontCtx.beginPath();

    Object.keys(lineStore).forEach(function(key) {
      lineStore[key].forEach(function(line) {
        line.update();
      });
    });

    frontCtx.stroke();
    RAF(animate);
  }

  window.RAF = (function() {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback) {
        window.setTimeout(callback, 1000 / 60);
      }
    );
  })();

  // start animate
  animate();

  return {
    render(template, timeObj) {
      if (currentTemp !== template) {
        parseResult = parseTemplate(template);
        drawBackground(timeObj);
      }

      if (!currentTemp) {
        setTimeout(function() {
          updateTimeTransform(timeObj);
        }, 100);
      } else {
        updateTimeTransform(timeObj);
      }

      currentTemp = template;
    }
  }
}
