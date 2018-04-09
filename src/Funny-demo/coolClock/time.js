// time handle
var time = document.getElementById('time');
var front = document.createElement('canvas');
var frontCtx = front.getContext('2d');
var back = document.createElement('canvas');
var backCtx = back.getContext('2d');
var ratio = window.devicePixelRatio || 1;
time.appendChild(back);
time.appendChild(front);
front.width = back.width = time.offsetWidth * ratio;
front.height = back.height = time.offsetHeight * ratio;

window.timeObj = {
  year: 0,
  month: 0,
  day: 3,
  hour: 3,
  minute: 50,
  second: 40,
};

var textWid = 24 * ratio;
var fontSize = 15 * ratio;
var numWidth = 12 * ratio;
var numHeight = 15 * ratio;
var lineWidth = 2 * ratio;
var halfTextWid = textWid / 2;
var halfFontSize = fontSize / 2;
var halfNumWidth = numWidth / 2;
var halfNumHeight = numHeight / 2;
var y = back.height / 2;
backCtx.textAlign = 'center';
backCtx.textBaseline = 'middle';
backCtx.font = fontSize + 'px sans-serif, "黑体"';

var ready = false;
var cache = {};

var ch = ['年', '月', '日', '时', '分', '秒'];
var keys = Object.keys(window.timeObj);
var timeMap = {
  0: '1110111', // |-|_ |_|
  1: '1000100',
  2: '0111110',
  3: '0111011',
  4: '1011001',
  5: '1101011',
  6: '1101111',
  7: '0110001',
  8: '1111111',
  9: '1111011',
};

function formatTime(n) {
  n = String(n);
  return n.length === 1 ? '0' + n : n;
}

// auto increment time
function updateTime() {
  var date = new Date();
  var latestDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  // calculate time
  var up = [0, 12, latestDay, 24, 60, 60];
  while (up.length) {
    var index = up.length - 1;
    var upper = up.pop();
    var key = keys[index];
    if (++window.timeObj[key] >= upper) {
      window.timeObj[key] = 0;
    } else {
      break;
    }
  }

  drawText(window.timeObj);
}

function Line(pos1, pos2) {
  this.pos1 = pos1;
  this.pos2 = pos2;
  this.times = 20;
  this.value = '0';
  this.ppos = {
    x: (pos2.x - pos1.x) / this.times,
    y: (pos2.y - pos1.y) / this.times,
  };

  this.start = pos1;
  this.end = pos1;
  this.direction = false;

  this.movingPos = null;
  this.goalPos = null;
  this.addPos = null;
}

var lp = Line.prototype;
lp.update = function() {
  if (this.movingPos && this.goalPos) {
    this.updateToGoal();
  }

  frontCtx.moveTo(this.start.x, this.start.y);
  frontCtx.lineTo(this.end.x, this.end.y);
};

lp.updateToGoal = function() {
  if (this.movingPos.x !== this.goalPos.x) {
    this.movingPos.x += this.addPos.x;
    if (Math.abs(this.movingPos.x - this.goalPos.x) < 0.1) {
      this.movingPos.x = this.goalPos.x;
    }
  }

  if (this.movingPos.y !== this.goalPos.y) {
    this.movingPos.y += this.addPos.y;
    if (Math.abs(this.movingPos.y - this.goalPos.y) < 0.1) {
      this.movingPos.y = this.goalPos.y;
    }
  }
};

lp.equal = function(pos1, pos2) {
  return pos1.x === pos2.x && pos1.y === pos2.y;
};

lp.move = function(type) {
  if (type === 1) {
    this.movingPos = this.end = { x: this.pos1.x, y: this.pos1.y };
    this.goalPos = { x: this.pos2.x, y: this.pos2.y };
    this.addPos = { x: this.ppos.x, y: this.ppos.y };
  } else if (type === 2) {
    this.movingPos = this.end = { x: this.pos2.x, y: this.pos2.y };
    this.goalPos = { x: this.pos1.x, y: this.pos1.y };
    this.addPos = { x: -this.ppos.x, y: -this.ppos.y };
  } else if (type === 3) {
    this.movingPos = this.start = { x: this.pos2.x, y: this.pos2.y };
    this.goalPos = { x: this.pos1.x, y: this.pos1.y };
    this.addPos = { x: -this.ppos.x, y: -this.ppos.y };
  } else {
    this.movingPos = this.start = { x: this.pos1.x, y: this.pos1.y };
    this.goalPos = { x: this.pos2.x, y: this.pos2.y };
    this.addPos = { x: this.ppos.x, y: this.ppos.y };
  }
};

function readyForDraw(timeObj) {
  backCtx.clearRect(0, 0, back.width, back.height);
  backCtx.lineWidth = frontCtx.lineWidth = lineWidth;

  var i = 0;
  ch.forEach(function(text, index) {
    var num = timeObj[keys[index]];
    backCtx.fillStyle = '#333';
    backCtx.fillText(text, textWid * (3 * i + 2) + halfTextWid, y);

    var numStr = formatTime(num);
    for (var j = 0; j < numStr.length; j++) {
      var val = numStr[j];
      var map = timeMap[+val];
      var startX = textWid * (3 * i + j);
      var a = halfTextWid - halfNumWidth;
      var b = halfTextWid + halfNumWidth;
      var c = y - halfNumHeight;
      var d = y + halfNumHeight;
      var coors = [
        { x: startX + a, y: y },
        { x: startX + a, y: c },
        { x: startX + b, y: c },
        { x: startX + b, y: y },
        { x: startX + a, y: y },
        { x: startX + a, y: d },
        { x: startX + b, y: d },
        { x: startX + b, y: y },
      ];

      var cc = (cache[text + '_' + j] = []);

      backCtx.beginPath();
      backCtx.moveTo(coors[0].x, coors[0].y);

      for (var k = 1; k < coors.length; k++) {
        backCtx.lineTo(coors[k].x, coors[k].y);
        cc.push(new Line(coors[k - 1], coors[k]));
      }

      backCtx.strokeStyle = '#ddd';
      backCtx.stroke();
    }

    i++;
  });
}

function drawText(timeObj) {
  if (!ready) {
    readyForDraw(timeObj);
    ready = true;
  }

  ch.forEach(function(text, index) {
    var num = timeObj[keys[index]];
    var numStr = formatTime(num);

    for (var j = 0; j < numStr.length; j++) {
      var val = numStr[j];
      var map = timeMap[+val];
      var cc = cache[text + '_' + j];

      for (var k = 0; k < map.length; k++) {
        var val = map[k];
        var line = cc[k];
        if (line.value !== val) {
          line.value = val;
          if (val === '1') {
            // if (map[k + 1] && map[k + 1] === '1') {
            //   line.move(3);
            // } else {
            //   line.move(1);
            // }
            line.move(1);
          } else {
            // if (map[k + 1] && map[k + 1] === '1') {
            //   line.move(4);
            // } else {
            //   line.move(2);
            // }
            line.move(2);
          }
        }
      }
    }
  });
}

function animate() {
  frontCtx.clearRect(0, 0, front.width, front.height);

  frontCtx.beginPath();
  Object.keys(cache).forEach(key => {
    cache[key].forEach(function(line) {
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

// update time
updateTime();
setInterval(updateTime, 1000);
animate();