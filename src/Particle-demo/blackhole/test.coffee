particles = [];
blackholes = [];
BH_SIZE = 15;

#设置状态
stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );

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

    @vx = if 0 <= @x <= canvas.width+@r*2 then @vx else -@vx*0.98;
    @vy = if 0 <= @y <= canvas.height+@r*2 then @vy else -@vy*0.98;

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

#黑洞类
class BlackHole
  constructor: (options)->
    {@x , @y , @r , @power} = options;
    @step = 2;
    @bigger = 5;
    this.animate(0);

#    绘制光
  drawLight:(ctx)->
    if @isAdd
      if (@ir+=@step)>(@r+@bigger)
        @isAdd = false
    else
      @ir = if @ir<=@r then @r else @ir-@step
      if this.destory && @ir == @r then blackholes.splice(blackholes.indexOf(this) , 1)

    imgr = @ir*1.4;
    ctx.drawImage(bhImage , @x-imgr , @y-imgr , imgr*2 , imgr*2)

#    绘制黑洞
  draw:(ctx)->
    that = this;
    ctx.beginPath();
    ctx.fillStyle = "#000"
    ctx.arc(that.x, that.y, that.ir, 0, Math.PI * 2)
    ctx.fill()

  animate:(ir)->
    @ir = ir;
    @isAdd = true;

  attract:(bh)->
    if bh.r >= @r
      cx = bh.x-@x
      cy = bh.y-@y
      jl = Math.sqrt(cx*cx + cy*cy);
      power = (bh.r-@r) * 10/jl + 0.5;
      lax = Math.abs(power*cx/jl);
      lay = Math.abs(power*cy/jl);
      @x += if cx>0 then lax else -lax;
      @y += if cy>0 then lay else -lay;

  check:(bh)->
    if !bh || !(bh instanceof BlackHole) || this.destory || bh.destory then return false;
    cx = bh.x-@x
    cy = bh.y-@y
    cr = bh.ir + @ir

    cx = Math.abs(cx);
    cy = Math.abs(cy);

    if cx<cr && cy<cr && Math.sqrt(cx*cx + cy*cy) <= Math.abs(bh.r-@r)+3
      if bh.r>@r
        [nbh , lbh] = [bh , this]
      else
        [nbh , lbh] = [this , bh]

      nbh.r = ~~Math.sqrt(bh.r*bh.r + @r*@r);
      nbh.power = bh.power+@power
      nbh.animate(Math.max(bh.r , @r))

      if nbh.r > 50 then nbh.destory=true
      return lbh;

    return false;

#预渲染黑洞图片
bhImage = do->
  bhCas = document.createElement("canvas");
  bhCas.width = bhCas.height = 50
  bhCtx = bhCas.getContext("2d");

  opacity = 0;
  for i in [0...20]
    opacity += 0.05;
    bhCtx.beginPath();
    bhCtx.fillStyle = "rgba(188,186,187,#{opacity})"
    bhCtx.arc(bhCas.width/2, bhCas.height/2, 25-i, 0, Math.PI * 2)
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
      bh.destory = true;
      bh.animate(bh.r)
      bh.r += 5

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
  for i in [1...400]
    particles.push(new Particle(x: canvas.width * Math.random(), y: canvas.height * Math.random(), r: Math.random()*2+1 , color:"rgba(255,255,255,.5)"))
  animate();

#动画逐帧逻辑
animate = ->
  bufferCtx.save();
  bufferCtx.globalCompositeOperation = 'destination-out';
  bufferCtx.globalAlpha = 0.3;
  bufferCtx.fillRect(0, 0, canvas.width, canvas.height);
  bufferCtx.restore();

  ctx.clearRect(0,0,canvas.width , canvas.height);

#  先画出所有黑洞的光
  for bh,i in blackholes
    if bh then bh.drawLight(ctx)

#  再画黑洞
  deleArray = []; #存放要删除的黑洞对象
  for bh,i in blackholes
    if bh then bh.draw(ctx)
    for bh2,j in blackholes
      if !bh or !bh2 or bh is bh2 then continue;

      bh.attract(bh2) #黑洞互相吸引

      if j>i && delebh = bh.check(bh2) #检查碰撞，若有碰撞则返回被吞噬的黑洞对象
        deleArray.push(delebh)

  #删除发生碰撞的黑洞，添加新生成的黑洞
  blackholes.splice(blackholes.indexOf(delebh) , 1) for delebh in deleArray

  for p in particles
    p.attract()
    p.move()
    p.draw()

  ctx.drawImage(bufferCanvas , 0 , 0);

  stats.update();
  RAF(animate)

#执行
execAnimate()