var part_1 = (function(w){
	var dots = [],DOT_SIZE =2 ,cube=null;

	var Dot = function(x,y,vx,vy,tox,toy,color){
		this.x=x;
		this.y=y;
		this.vx=vx;
		this.vy=vy;
		this.nextox = tox;
		this.nextoy = toy;
		this.color = color;
		this.visible = true;
		this.globleDown = false;
		this.setEnd(tox , toy);
	}

	Dot.prototype = {
		paint:function(){
			ctx.fillStyle=this.color;
			ctx.fillRect(this.x-DOT_SIZE/2 , this.y-DOT_SIZE/2 , DOT_SIZE , DOT_SIZE);
		},

		setEnd:function(tox , toy){
			this.tox = tox;
			this.toy = toy;
			var yc = this.toy - this.y;
			var xc = this.tox - this.x;
			// this.initjl = Math.sqrt(xc*xc+yc*yc);
		},

		update:function(time){
			this.x += this.vx*time;
			this.y += this.vy*time;

			if(!this.globleDown&&this.y>0){
				var yc = this.toy - this.y;
				var xc = this.tox - this.x;

				this.jl = Math.sqrt(xc*xc+yc*yc);

				var za = 20;

				var ax = za*(xc/this.jl),
					ay = za*(yc/this.jl),
					vx = (this.vx+ax*time)*0.97,
					vy = (this.vy+ay*time)*0.97;

				this.vx = vx;
				this.vy = vy;
			}else {
				var gravity = 9.8;
				var vy = this.vy+gravity*time;

				if(this.y>canvas.height){
					vy = -vy*0.7;
				}

				this.vy = vy;
			}
		},

		loop:function(time){
			this.update(time);
			this.paint();
		}
	}

	

	var animate = function(){
		this.state = "before"
	}

	var ap = animate.prototype;

	ap.init = function(){
		this.osCanvas = document.createElement("canvas");
		var osCtx = this.osCanvas.getContext("2d");

		this.osCanvas.width = 1000;
		this.osCanvas.height = 150;

		osCtx.textAlign = "center";
		osCtx.textBaseline = "middle";
		osCtx.font="100px 微软雅黑,黑体 bold";
		osCtx.fillStyle = "#1D181F"
		osCtx.fillText("WelCome" , this.osCanvas.width/2 , this.osCanvas.height/2-40);
		osCtx.fillText("To wAxes' HOME" , this.osCanvas.width/2 , this.osCanvas.height/2+40);
		var bigImageData = osCtx.getImageData(0,0,this.osCanvas.width,this.osCanvas.height);

		dots = [];

		for(var x=0;x<bigImageData.width;x+=3){
			for(var y=0;y<bigImageData.height;y+=3){
				var i = (y*bigImageData.width + x)*4;
				if(bigImageData.data[i+3]>128){
					var dot = new Dot(
						canvas.width/2-1+2*Math.random(),
						canvas.height/2-1+2*Math.random(),
						0,
						0,
						x+(canvas.width/2-this.osCanvas.width/2),
						y+(canvas.height/2-this.osCanvas.height/2),
						"rgba("+bigImageData.data[i]+","+bigImageData.data[i+1]+","+bigImageData.data[i+2]+",1)"
					);
					dot.setEnd(canvas.width/2,canvas.height/2)
					dots.push(dot);
				}
			}
		}
		console.log(dots.length)
	}

	ap.changeState = function(){
		var osCtx = this.osCanvas.getContext("2d");
		osCtx.clearRect(0,0,this.osCanvas.width,this.osCanvas.height);
		this.osCanvas.width = 460;
		this.osCanvas.height = 100;

		osCtx.fillStyle="#5C5656"
		osCtx.fillRect(20,20,60,60)

		drawLogo(this.osCanvas , osCtx);

		var bigImageData = osCtx.getImageData(0,0,this.osCanvas.width,this.osCanvas.height);

		var index=0;
		dots.sort(function(a , b){
			return Math.random()-Math.random();
		})
		for(var x=0;x<bigImageData.width;x+=3){
			for(var y=0;y<bigImageData.height;y+=3){
				var i = (y*bigImageData.width + x)*4;
				if(bigImageData.data[i+3]>128){
						var d = dots[index];
						if(d){
							d.setEnd(x+(canvas.width/2-300) , y+50)
							d.color = "rgba("+bigImageData.data[i]+","+bigImageData.data[i+1]+","+bigImageData.data[i+2]+",1)";
							index++
						}
				}
			}
		}

		setTimeout(function(){
			var endindex = index;
			for(var i=0;i<dots.length-endindex;i++){
				if(dots[index]){
					var d = dots[index];
					
					d.globleDown = true;
					d.vx = Math.random()*100-50;
				}
				index++;
			}
		} , 2000)
	}


	function endState(){
		canvas.width = 600;
		canvas.height = 100;
		canvas.style.display="block";
		canvas.style.top = "50px";
		canvas.style.left = (window.innerWidth-canvas.width)/2+"px";
		cube = new Cube(50);
		cube._initVector(50,50);
	}

	function drawLogo(canvas , ctx){
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font="65px 微软雅黑,黑体 bold"
		ctx.fillStyle="#E06D2F"
		ctx.fillText("DEMO" , 300 , canvas.height/2)

		ctx.font="40px 微软雅黑,黑体 bold"
		ctx.fillStyle="#405159"
		ctx.fillText("吖猩的" , 160 , canvas.height/2)
		ctx.fillText("小窝" , 420 , canvas.height/2)
	}

	var num = 0;
	ap.update = function(time){
		time = time/100;
		if(this.state==="first"||this.state==="before"){
			var completeNum = 0;
			dots.forEach(function(dot){
				if(dot.visible) dot.loop(time);
				if(dot.jl<5){
					completeNum++
				}
			});
			if(completeNum>=3*dots.length/4 ){
				
				if(this.state==="before"){
					this.state = "first";
					dots.forEach(function(dot){
						dot.setEnd(dot.nextox , dot.nextoy);
					});
				}else {
					this.state = "second";
					this.changeState();
				}
			}
		}else if(this.state==="second"){
			var completeNum = 0,
				allnum = 0;
			dots.forEach(function(dot){
				if(dot.visible) dot.loop(time);
				if(dot.globleDown){
					allnum++;
					if(Math.abs(dot.y-canvas.height)<2){
						completeNum++
					}
				}
			});

			if(completeNum===allnum&&allnum!==0){
				this.state = "third";
				part_2.init();
				part_2.animate();
				endState();
			}
		}else if(this.state==="third"){
			cube.update();
			drawLogo(canvas , ctx);
		}
	}

	return new animate();
})(window)