canvas = document.getElementById 'cas'
ctx = canvas.getContext("2d")

bufferCanvas = document.createElement("canvas");
bufferCanvas.width = bufferCanvas.height = canvas.width;
bufferCtx = bufferCanvas.getContext("2d");

RAF = do ->
  return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      (callback)->
        window.setTimeout(callback, 1000 / 60)

class Particle
  constructor: (options)->
    {@x , @y , @r} = options
    this._init()

  _init: ->
    @vx = Math.random()*4 - 2;
    @vy = Math.random()*4 - 2;
    @ax = 0;
    @ay = 0;

  move: ->
    @vx += @ax;
    @vy += @ay;

    maxSpeed = 10;
    @vx = if Math.abs(@vx)>maxSpeed then maxSpeed*Math.abs(@vx)/@vx else @vx
    @vy = if Math.abs(@vy)>maxSpeed then maxSpeed*Math.abs(@vy)/@vy else @vy

    @oldx = @x;
    @oldy = @y;
    @x += @vx;
    @y += @vy;

    if @x<=0 || @x>=canvas.width+@r*2
      @vx = -@vx
    if @y<=0 || @y>=canvas.height+@r*2
      @vy = -@vy

  attract:->
    @ax = @ay = 0;
    for bh in blackholes
      cx = bh.x-@x;
      cy = bh.y-@y;
      angle = Math.atan(cx/cy)
      dis = Math.sqrt(cx*cx + cy*cy);

      dis = if dis < 200 then 200 else dis;
      power = bh.power * dis/5000;
      lax = Math.abs(power*Math.sin(angle));
      lay = Math.abs(power*Math.cos(angle));
      @ax += if cx>0 then lax else -lax;
      @ay += if cy>0 then lay else -lay;

  draw: ->
    bufferCtx.save()
    bufferCtx.strokeStyle = "#FFF"
    bufferCtx.lineCap = bufferCtx.lineJoin = "round"
    bufferCtx.lineWidth = @r;
    bufferCtx.beginPath();
    bufferCtx.moveTo(@oldx-@r , @oldy-@r);
    bufferCtx.lineTo(@x-@r , @y-@r);
    bufferCtx.stroke()
    bufferCtx.restore();

particles = [];
blackholes = [];

execAnimate = ->
  for i in [1...100]
    particles.push(new Particle(x: canvas.width * Math.random(), y: canvas.height * Math.random(), r: 2))

  animate();

animate = ->
  bufferCtx.save();
  bufferCtx.globalCompositeOperation = 'destination-out';
  bufferCtx.globalAlpha = 0.3;
  bufferCtx.fillRect(0, 0, canvas.width, canvas.height);
  bufferCtx.restore();

  ctx.clearRect(0,0,canvas.width , canvas.height);

  for bh in blackholes
    ctx.beginPath()
    ctx.fillStyle = "#000"
    ctx.arc(bh.x-5, bh.y-5, 5, 0, Math.PI * 2)
    ctx.fill()

  for p in particles
    p.attract()
    p.move()
    p.draw()

  ctx.drawImage(bufferCanvas , 0 , 0);
  RAF(animate)

execAnimate()

canvas.onclick = (e)->
  x = e.clientX - this.offsetLeft
  y = e.clientY - this.offsetTop
  blackholes.push({x:x,y:y,power:1})