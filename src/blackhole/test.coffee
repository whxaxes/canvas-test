canvas = document.getElementById 'cas'
ctx = canvas.getContext("2d")

bufferCanvas = document.createElement("canvas");
bufferCtx = bufferCanvas.getContext("2d");

bufferCanvas.width = canvas.width = document.body.offsetWidth
bufferCanvas.height = canvas.height = document.body.offsetHeight
window.onresize = ->
  bufferCanvas.width = canvas.width = document.body.offsetWidth
  bufferCanvas.height = canvas.height = document.body.offsetHeight

RAF = do ->
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || (callback)->
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

#    @vx = if 0 < @x < canvas.width+@r*2 then @vx else -@vx;
#    @vy = if 0 < @y < canvas.height+@r*2 then @vy else -@vy;

  attract:->
    @ax = @ay = 0;
    for bh in blackholes
      cx = bh.x-@x;
      cy = bh.y-@y;
      angle = Math.atan(cx/cy)
      dis = Math.sqrt(cx*cx + cy*cy);

      power = bh.power * 0.1;

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
BH_SIZE = 20;

#预渲染黑洞图片
bhImage = do->
  bhCas = document.createElement("canvas");
  bhCas.width = bhCas.height = BH_SIZE*2
  bhCtx = bhCas.getContext("2d");

  opacity = 0;
  for i in [0...20]
    opacity += 0.05;
    bhCtx.beginPath();
    bhCtx.fillStyle = "rgba(188,186,187,#{opacity})"
    bhCtx.arc(bhCas.width/2, bhCas.height/2, BH_SIZE-i, 0, Math.PI * 2)
    bhCtx.fill()

  bhCtx.beginPath();
  bhCtx.fillStyle = "#000"
  bhCtx.arc(bhCas.width/2, bhCas.height/2, BH_SIZE-5, 0, Math.PI * 2)
  bhCtx.fill()
  return bhCas

target = null
canvas.onmousedown = (e)->
  x = e.clientX - @offsetLeft
  y = e.clientY - @offsetTop
  for bh,i in blackholes
    cx = bh.x-x
    cy = bh.y-y
    if cx*cx + cy*cy <= BH_SIZE*BH_SIZE
      target = bh
      break;

  if !target && e.button==0
    blackholes.push({x:x,y:y,r:BH_SIZE,power:2})
  else
    if e.button==2
      blackholes.splice(i , 1);




canvas.onmousemove = (e)->
  if target
    x = e.clientX - @offsetLeft
    y = e.clientY - @offsetTop
    target.x = x
    target.y = y

canvas.onmouseup = canvas.onmouseout = (e)->
  target = null

execAnimate = ->
  for i in [1...200]
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
    ctx.drawImage(bhImage , bh.x-bh.r , bh.y-bh.r , bh.r*2 , bh.r*2)

  for p in particles
    p.attract()
    p.move()
    p.draw()

  ctx.drawImage(bufferCanvas , 0 , 0);
  RAF(animate)

execAnimate()