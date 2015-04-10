(function(w){
	var STONE_WIDTH = 70,
		STONE_HEIGHT = 28,
		STONE_NUM = 8,
		STONE_SPEED = 3;

	w.stone = function(x , img){
		this.x = x;
		this.y = 0;
		this.img = img
		this.visible = false;
		this.bones = [];

		this.init();
	}

	var s = stone.prototype;

	s.init = function(){
		for(var g=0;g<STONE_NUM;g++){
			bone = new createjs.Shape();
			bone.graphics.s("#000").f("#59554D").drawRect(0 , 0 , STONE_WIDTH , STONE_HEIGHT);
			bone.x = this.x;
			stage.addChild(bone)
			this.bones.push(bone);
		}
	}

	s.getStoneSize = function(){
		return {
			w:STONE_WIDTH,
			h:STONE_HEIGHT
		}
	}

	s.update = function(){
		var index=0;
		for(var z=0;z<this.top;z++){
			this.bones[index].x = this.x;
			this.bones[index].y = z*STONE_HEIGHT;
			index++;
		}

		for(var t=0;t<this.bottom;t++){
			this.bones[index].x = this.x;
			this.bones[index].y = h-this.img.height-(t+1)*STONE_HEIGHT;
			index++;
		}

		if(this.visible){
			if(this.x<=-STONE_WIDTH){
				this.visible = false;
			}
			this.x -= STONE_SPEED;
		}
	}

	s.build = function(){
		this.top = parseInt(Math.random()*STONE_NUM);
		this.bottom = STONE_NUM-this.top;
	}
})(window)