(function(w){
	var FRAME_RATE = 13,	//精灵表播放速度
		SCALE_X = 1.5,	//X轴缩放
		SCALE_Y = 1.5,	//Y轴缩放
		GRAVITY = 9.8,	//重力加速度
		JUMP_SPEED = 2.5,		//垂直速度
		PROPORTION = 200/1;  //游戏与实际的距离比例

	w.Man = function(x , y , img){
		this.x = x;
		this.y = y;
		this.vy = 0;
		this.state = "run";
		this.init(img);
	}

	Man.prototype = {
		constructors:Man,

		init:function(img){
			var manSpriteSheet = new createjs.SpriteSheet({
				"images":[img],
				"frames":{"regX":0,"height":64,"count":45,"regY":1,"width":64},
				"animations":{
					"run":{
						frames:[21,20,19,18,17,16,15,14,13,12],
						next:"run",
						speed:1,
					}, 
					"jump":{
						frames:[34,35,36,37,38,39,40,41,42,43],
						next:"run",
						speed:1,
					},
					"die":{
						frames:[8,7,6,5,4,3,2,1,0],
						next:"die",
						speed:1,
					},
				}
			});
			this.sprite = new createjs.Sprite(manSpriteSheet , this.state);
			this.sprite.framerate = FRAME_RATE;
			this.sprite.setTransform(this.x, this.y, SCALE_X, SCALE_Y);
			stage.addChild(this.sprite);
		},

		update:function(){
			var sprite = this.sprite;
			var time = createjs.Ticker.getInterval()/1000;
			switch(this.state){
				case "jump":
					sprite.y += time*this.vy*PROPORTION;
					this.vy += time*GRAVITY;
					if(sprite.y > this.y && this.vy > 0){
						sprite.state = "run";
						sprite.y=this.y;
						this.vy = 0;
					}else if(sprite.y<0){
                        
						sprite.y = 0;
						this.vy = 0;
					} 
				break;

				case "die":
					sprite.y += time*this.vy*PROPORTION;
					this.vy += time*GRAVITY;
					if(sprite.y > this.y && this.vy > 0){
						sprite.y=this.y;
						this.vy = 0;
					}
					if(sprite.currentFrame===0){
						sprite.paused = true;
					}
				break;
			}
		},

		jump:function(){
			this.vy = -JUMP_SPEED;
			this.state = "jump";
			this.sprite.gotoAndPlay("jump")
		},

		die:function(){
			this.state = "die";
			this.sprite.gotoAndPlay("die")
		},

		run:function(){
			this.state = "run";
			this.sprite.gotoAndPlay("run")
		}
	}
})(window)