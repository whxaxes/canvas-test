(function(w){
	var SPEED = 4,
		COIN_STAY_X = 20,
		COIN_STAY_Y = 20,
		COIN_STAY_WIDTH = 30,
		COIN_STAY_HEIGHT = 30,
		COIN_SCALE_X = 0.08,
		COIN_SCALE_Y = 0.08;

	//地上的石头类

	var Stone = function(x,kind,allImage){
		this.x = x;
		this.kind = kind;
		this.allImage = allImage;
		this.init();
	}

	var sp = Stone.prototype;

	sp.init=function(){
		this.shape = new createjs.Shape();
		if(this.kind!=="C"){
			this.h = this.allImage[this.kind].height;
			this.w = this.allImage[this.kind].width*2;
			this.y = C_H - this.h;
			this.shape.graphics.beginBitmapFill(this.allImage[this.kind]).drawRect(0, 0, this.w, this.h);
			this.shape.setTransform(this.x, this.y, 1, 1);
		}else {
			this.h = -1000;
			this.w = 170;
			this.y = C_H - this.h;
			this.shape.graphics.beginFill("#000").drawRect(0, 0, this.w, this.h);
			this.shape.setTransform(this.x, this.y, 1, 1);
		}
		this.shape.visible = false;
		this.shape.cache(0 , 0 , this.w , this.h);
		stage.addChild(this.shape);
	}

	sp.update=function(){
		this.shape.x -= SPEED;
	}

	//金币类
	var Coin = function(image){
		this.sizeX = COIN_SCALE_X;
		this.sizeY = COIN_SCALE_Y;

		this.isget = false;
		this.init = function(){
			this.shape = new createjs.Shape();
			this.shape.graphics.beginBitmapFill(image).drawRect(0, 0, image.width, image.height);
			this.shape.setTransform(0, 0, COIN_SCALE_X, COIN_SCALE_Y);
			this.shape.visible = false;
			stage.addChild(this.shape);
		}
		this.init();

		this.update = function(){
			if(this.isget){
				this.sizeX = this.sizeX + ((COIN_STAY_WIDTH/image.width) - this.sizeX)*0.1;
				this.sizeY = this.sizeY + ((COIN_STAY_HEIGHT/image.height) - this.sizeY)*0.1;
				this.shape.setTransform(
					this.shape.x + (COIN_STAY_X - this.shape.x)*0.1,
					this.shape.y + (COIN_STAY_Y - this.shape.y)*0.1,
					this.sizeX,
					this.sizeY
				);

				if(Math.abs(this.shape.x-COIN_STAY_X)<0.5&&Math.abs(this.shape.y-COIN_STAY_Y)<0.5){
					this.shape.visible = false;
					this.isget = false;
					this.sizeX = COIN_SCALE_X;
					this.sizeY = COIN_SCALE_Y;
					this.shape.setTransform(0,0,this.sizeX,this.sizeY);
				}
			} else{
				this.shape.x -= SPEED;
				if(this.shape.x<-image.width*COIN_SCALE_X){
					this.shape.visible = false;
				}
			}
		}

		this.size = function(){
			return {
				w:image.width*COIN_SCALE_X,
				h:image.height*COIN_SCALE_Y
			}
		}
	}

	w.createCoin = function(image){
		return new Coin(image)
	}

	w.createStone = function(x,kind,allImage){
		return new Stone(x,kind,allImage);
	}
})(window)