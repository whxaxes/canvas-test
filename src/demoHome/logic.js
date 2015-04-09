var animate = (function(w){
	var dots = [],DOT_SIZE =1.3;

	var Dot = function(x,y,vx,vy,tox,toy,color){
		this.x=x;
		this.y=y;
		this.vx=vx;
		this.vy=vy;
		this.visible = false;
		this.nextox = tox;
		this.nextoy = toy;
		this.color = color;
		this.globleDown = false;
		this.gravity = Math.random()*3+6.8;
		this.setEnd(tox , toy);
	}

	Dot.prototype = {
		paint:function(){
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x-DOT_SIZE/2 , this.y-DOT_SIZE/2 , DOT_SIZE , DOT_SIZE)
		},

		setEnd:function(tox , toy){
			this.tox = tox;
			this.toy = toy;
		},

		update:function(time){
			this.x += this.vx*time;
			this.y += this.vy*time;

			if(!this.globleDown){
				var yc = this.toy - this.y;
				var xc = this.tox - this.x;

				this.jl = Math.sqrt(xc*xc+yc*yc);

				var za = 20;

				var ax = za*(xc/this.jl);
				var ay = za*(yc/this.jl);

				this.vx = (this.vx + ax*time)*0.95;
				this.vy = (this.vy + ay*time)*0.95;
			}else {
				this.vy += this.gravity * time;

				if(this.y>canvas.height){
					dots.splice(dots.indexOf(this) , 1 , null);
				}
			}
		},

		loop:function(time){
			this.update(time);
			this.paint();
		}
	}

	var animate = function(){
		this.state = "before"
	};

	var ap = animate.prototype;

	ap.init = function(){
		this.osCanvas = document.createElement("canvas");
		var osCtx = this.osCanvas.getContext("2d");

		this.osCanvas.width = 1000;
		this.osCanvas.height = 200;

		osCtx.textAlign = "center";
		osCtx.textBaseline = "middle";
		osCtx.font="100px 微软雅黑,黑体 bold";
		osCtx.fillStyle = "#1D181F";
		osCtx.fillText("WELCOME" , this.osCanvas.width/2 , this.osCanvas.height/2-40);
		osCtx.fillText("THIS IS FIRST STEP" , this.osCanvas.width/2 , this.osCanvas.height/2+50);
		var bigImageData = osCtx.getImageData(0,0,this.osCanvas.width,this.osCanvas.height);

		dots = [];

		for(var x=0;x<bigImageData.width;x+=2){
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
					dot.setEnd(canvas.width/2,canvas.height/2);
					dots.push(dot);
				}
			}
		}
	};

	function getLogoData(){
		var osCtx = this.osCanvas.getContext("2d");
		osCtx.clearRect(0,0,this.osCanvas.width,this.osCanvas.height);
		this.osCanvas.width = 500;
		this.osCanvas.height = 100;

		osCtx.fillStyle="#5C5656";
		osCtx.fillRect(20,20,60,60);

		osCtx.textAlign = "center";
		osCtx.textBaseline = "middle";
		osCtx.font="65px 微软雅黑,黑体 bold";
		osCtx.fillStyle="#E06D2F";
		osCtx.fillText("OTZ" , 326 , this.osCanvas.height/2);

		osCtx.font="40px 微软雅黑,黑体 bold";
		osCtx.fillStyle="#405159";
		osCtx.fillText("SECOND" , 180 , this.osCanvas.height/2);
		osCtx.fillText("STEP" , 430 , this.osCanvas.height/2);

		return osCtx.getImageData(0,0,this.osCanvas.width,this.osCanvas.height);
	}

	ap.changeState = function(){
		var bigImageData = getLogoData.call(this);

		var index=0;
		var d;

		dots.sort(function(){
			return Math.random()-Math.random();
		});

		for(var x=0;x<bigImageData.width;x+=1){
			for(var y=0;y<bigImageData.height;y+=2){
				if(!(d = dots[index])) continue;

				var i = (y*bigImageData.width + x)*4;
				if(bigImageData.data[i+3]>128){
					d.setEnd(x+(canvas.width/2-300) , y+50);
					d.color = "rgba("+bigImageData.data[i]+","+bigImageData.data[i+1]+","+bigImageData.data[i+2]+",1)";
					index++
				}
			}
		}

		while(index < dots.length){
			if(!(d = dots[index++])) continue;
			d.globleDown = true;
			d.vx = 0;
		}
	}

	ap.update = function(time){
		var i,d;
		time /= 100;

		var completeNum = 0;
		for(i=0;i<dots.length;i++){
			if(!(d = dots[i])) continue;

			d.loop(time);

			if(d.jl<3) completeNum++;
		}

		if(completeNum>=5*dots.length/6 ){
			switch (this.state){
				case 'before':
					this.state = "first";

					for(i=0;i<dots.length;i++){
						if(!(d = dots[i])) continue;

						d.setEnd(d.nextox , d.nextoy);
					}
					break;
				case 'first':
					this.state = "second";
					this.changeState();
					break;
				default :break;
			}
		}
	};

	return new animate();
})(window)