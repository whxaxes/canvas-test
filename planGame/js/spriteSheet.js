//精灵类
var Sprite = function(name , painter , behaviors){
	if(name !== undefined) this.name = name;
	if(painter !== undefined) this.painter = painter;
	this.top = 0;
	this.left = 0;
	this.width = 0;
	this.height = 0;
	this.velocityX = 0;
	this.velocityY = 0;
	this.visible = true;
	this.animating = false;
	this.behaviors = behaviors || [];
}
Sprite.prototype = {
	paint:function(){
		if(this.painter !== undefined && this.visible){
			this.painter.paint(this)
		}
	},
	update:function(time){
		for(var i=0;i<this.behaviors.length;i++){
			this.behaviors[i].execute(this,time);
		}
	}
}

// 精灵表绘制器
var SpriteSheetPainter = function(cells){
	this.cells = cells || [];
	this.cellIndex = 0;
}
SpriteSheetPainter.prototype = {
	advance:function(){
		if(this.cellIndex === this.cells.length-1){
			this.cellIndex = 0;
		}
		else this.cellIndex++;
	},
	paint:function(sprite){
		var cell = this.cells[this.cellIndex];
		context.drawImage(spritesheet , cell.x , cell.y , cell.w , cell.h , sprite.left , sprite.top , cell.w , cell.h);
	}
}