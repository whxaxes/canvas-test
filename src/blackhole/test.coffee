particles = [];
blackholes = [];
BH_SIZE = 15;

canvas = document.getElementById 'cas'
ctx = canvas.getContext("2d")

bufferCanvas = document.createElement("canvas");
bufferCtx = bufferCanvas.getContext("2d");

bufferCanvas.width = canvas.width = document.body.offsetWidth
bufferCanvas.height = canvas.height = document.body.offsetHeight
window.onresize = ->
  bufferCanvas.width = canvas.width = document.body.offsetWidth
  bufferCanvas.height = canvas.height = document.body.offsetHeight

#动画循环封装
RAF = do ->
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || (callback)->
        window.setTimeout(callback, 1000 / 60)

#粒子类
class Particle
  constructor: (options)->
    {@x , @y , @r , @color} = options
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

    @vx = if 0 < @x < canvas.width+@r*2 then @vx else -@vx;
    @vy = if 0 < @y < canvas.height+@r*2 then @vy else -@vy;

  attract:->
    @ax = @ay = 0;
    for bh in blackholes
      cx = bh.x-@x;
      cy = bh.y-@y;
      angle = Math.atan(cx/cy)

      power = bh.power * 0.1;

      lax = Math.abs(power*Math.sin(angle));
      lay = Math.abs(power*Math.cos(angle));
      @ax += if cx>0 then lax else -lax;
      @ay += if cy>0 then lay else -lay;

  draw: ->
    bufferCtx.save()
    bufferCtx.strokeStyle = @color
    bufferCtx.lineCap = bufferCtx.lineJoin = "round"
    bufferCtx.lineWidth = @r;
    bufferCtx.beginPath();
    bufferCtx.moveTo(@oldx-@r , @oldy-@r);
    bufferCtx.lineTo(@x-@r , @y-@r);
    bufferCtx.stroke()
    bufferCtx.restore();


class BlackHole
  constructor: (options)->
    {@x , @y , @r , @power} = options;
    @step = 2;
    @bigger = 5;
    this.animate(0);

  draw:(ctx)->
    if @isAdd
      if (@ir+=@step)>(@r+@bigger)
        @isAdd = false
    else
      @ir = if @ir<=@r then @r else @ir-@step
      if this.destory && @ir == @r then blackholes.splice(blackholes.indexOf(this) , 1)

    imgr = @ir+bhImage.lightLen;
    ctx.drawImage(bhImage , @x-imgr , @y-imgr , imgr*2 , imgr*2)

  animate:(ir)->
    @ir = ir;
    @isAdd = true;

  check:(bh)->
    if !bh || !(bh instanceof BlackHole) || this.destory || bh.destory then return false;
    cx = Math.abs(bh.x-@x)
    cy = Math.abs(bh.y-@y)
    cr = bh.ir + @ir
    if cx<cr && cy<cr && Math.sqrt(cx*cx + cy*cy) < cr
      nbh = new BlackHole({
        x:(bh.x+@x)/2,
        y:(bh.y+@y)/2,
        r:Math.max(bh.r , @r)*1.2,
        power:Math.max(bh.power , @power)*1.2
      })
      nbh.animate(Math.max(bh.r , @r))

      if nbh.r > 100 then @destory=true

      blackholes.splice(blackholes.indexOf(this) , 1);
      blackholes.splice(blackholes.indexOf(bh) , 1);
      blackholes.push(nbh);
      return true;

    return false;

#预渲染黑洞图片
bhImage = do->
  bhCas = document.createElement("canvas");
  bhCas.lightLen =  lightLen = 5;
  bhCas.width = bhCas.height = (BH_SIZE+lightLen)*2
  bhCtx = bhCas.getContext("2d");

  opacity = 0;
  for i in [0...20]
    opacity += 0.05;
    bhCtx.beginPath();
    bhCtx.fillStyle = "rgba(188,186,187,#{opacity})"
    bhCtx.arc(bhCas.width/2, bhCas.height/2, BH_SIZE+lightLen-i, 0, Math.PI * 2)
    bhCtx.fill()

  bhCtx.beginPath();
  bhCtx.fillStyle = "#000"
  bhCtx.arc(bhCas.width/2, bhCas.height/2, BH_SIZE, 0, Math.PI * 2)
  bhCtx.fill()
  return bhCas

#事件绑定
target = null
canvas.onmousedown = (e)->
  x = e.clientX - @offsetLeft
  y = e.clientY - @offsetTop
  for bh,i in blackholes
    cx = bh.x-x
    cy = bh.y-y
    if cx*cx + cy*cy <= bh.r*bh.r
      target = bh
      break;

  if !target && e.button==0
    blackholes.push(new BlackHole(x:x,y:y,r:BH_SIZE,power:2))
  else if e.button==2
      blackholes.splice(i , 1);

canvas.onmousemove = (e)->
  if target
    x = e.clientX - @offsetLeft
    y = e.clientY - @offsetTop
    target.x = x
    target.y = y

canvas.onmouseup = canvas.onmouseout = (e)->
  target = null


#执行动画
execAnimate = ->
  for i in [1...200]
    colors = (parseInt(Math.random()*125 + 130) for n in [0...3])
    particles.push(new Particle(x: canvas.width * Math.random(), y: canvas.height * Math.random(), r: Math.random()*2+1 , color:"rgba(#{colors[0]},#{colors[1]},#{colors[2]},1)"))

  animate();

#动画逻辑
animate = ->
  bufferCtx.save();
  bufferCtx.globalCompositeOperation = 'destination-out';
  bufferCtx.globalAlpha = 0.3;
  bufferCtx.fillRect(0, 0, canvas.width, canvas.height);
  bufferCtx.restore();

  ctx.clearRect(0,0,canvas.width , canvas.height);

  for bh,i in blackholes
    for j in [i+1...blackholes.length]
      if bh and bh.check(blackholes[j]) then break
    if bh then bh.draw(ctx)

  for p in particles
    p.attract()
    p.move()
    p.draw()

  ctx.drawImage(bufferCanvas , 0 , 0);
  RAF(animate)

#执行
execAnimate()