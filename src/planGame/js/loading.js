var Loading = function(){
	var loadingComplete = false;
	var dateCount = null;
	var init = function(datas , canvas , callback){
		this.canvas = canvas;
		this.x = this.canvas.width/2;
		this.y = this.canvas.height/2;
		this.r = 80;
		this.elew = 10;
		this.angle = 0;
		this.percent = 0;
		this.writePercent = 0;
		this.callback = callback;
		this.loadImg(datas);
	}

	init.prototype = {
		paint:function(){
			var ctx = this.canvas.getContext("2d");
			ctx.fillStyle="rgba(0,0,0,0.01)"
			ctx.fillRect(this.x-this.r-this.elew-5 , this.y-this.r-this.elew-5 , (this.r+this.elew+5)*2 , (this.r+this.elew+5)*2)
			ctx.fillStyle = "#FFF";

			ctx.save();
			ctx.translate(this.x , this.y);
			ctx.rotate(this.angle);
			ctx.fillRect(-this.elew/2 , -this.r+this.elew/2 , this.elew , this.elew);
			ctx.fillRect(-this.elew/2 , this.r-this.elew/2, this.elew , this.elew);
			ctx.restore();

			ctx.clearRect(this.x-48 , this.y-12 , 96 , 24);
			ctx.font = "18px 微软雅黑";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("加载中"+this.writePercent+"%" , this.x , this.y);

			this.angle = this.angle>2*Math.PI?0:this.angle+0.05;
		},

		loadImg:function(datas){
			var _this = this;
			var dataIndex = 0;
			li();
			function li(){
				if(datas[dataIndex].indexOf("mp3")>=0){
					var audio = document.createElement("audio");
					console.log('ss')
					
					audio.preload = "auto";
					audio.src = datas[dataIndex];
					audio.addEventListener("canplaythrough" , loadMp3);
					if(datas[dataIndex].indexOf("bgm")>=0){
						audio.id = "bgm";
						audio.loop = true;
						audio.volume = 0.8;
					}
					function loadMp3(){
					audio.removeEventListener("canplaythrough" , loadMp3);
						dataIndex++;
						if(dataIndex===datas.length){
							_this.percent = 100;
						}else {
							_this.percent = parseInt(dataIndex/datas.length*100);
							li.call(_this);
						}
						console.log(document.body.innerHTML);
						document.body.appendChild(audio);
					}
				}else {
					preLoadImg(datas[dataIndex] , function(){
						dataIndex++;
						if(dataIndex===datas.length){
							_this.percent = 100;
						} else {
							_this.percent = parseInt(dataIndex/datas.length*100);
							li.call(_this);
						}
					})
				}
			}
		},

		update:function(){
			var _this = this;
			if(dateCount===null){
				dateCount = new Date();
			}else {
				var newd = new Date();
				var tc = newd-dateCount;
				if(tc>10){
					this.writePercent++;
					dateCount = newd;

					if(this.writePercent===100){
						setTimeout(function(){
							_this.callback();
							loadingComplete = true;
						},500);
					}
				}
			}
		},

		loop:function(){
			if(this.percent !== this.writePercent){
				this.update()
			}
			if(!loadingComplete) {
				this.paint();
			}
		},

		getComplete:function(){
			return loadingComplete;
		}
	}

	return init;
}();

function preLoadImg(src , callback){
	var img = new Image();
	img.src = src;
	img.onload = function(){
		callback.call(img);
	}
}