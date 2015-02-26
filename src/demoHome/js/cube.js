(function (w){
	var fallLength = 500 , centerX = 0 , centerY = 0;
	var Vector = function(x,y,z){
		this.x = x;
		this.y = y;
		this.z = z;
		this._get2d = function(){
			var scale = fallLength/(fallLength+this.z);
			var x = centerX + this.x*scale;
			var y = centerY + this.y*scale;
			return {x:x , y:y};
		}
	}

	w.Cube = function(length){
		this.length = length;
		this.faces = [];
	}
	Cube.prototype = {
		_initVector:function(cx , cy){
			centerX = cx , centerY = cy;

			this.vectors = [];
			this.vectors.push(new Vector(-this.length/2 , -this.length/2 , this.length/2)); //0
			this.vectors.push(new Vector(-this.length/2 , this.length/2 , this.length/2)); //1
			this.vectors.push(new Vector(this.length/2 , -this.length/2 , this.length/2)); //2
			this.vectors.push(new Vector(this.length/2 , this.length/2 , this.length/2)); //3

			this.vectors.push(new Vector(this.length/2 , -this.length/2 , -this.length/2)); //4
			this.vectors.push(new Vector(this.length/2 , this.length/2 , -this.length/2)); //5
			this.vectors.push(new Vector(-this.length/2 , -this.length/2 , -this.length/2)); //6
			this.vectors.push(new Vector(-this.length/2 , this.length/2 , -this.length/2)); //7

		},
		_draw:function(){
			this.faces[0] = new Face(this.vectors[0] , this.vectors[1] , this.vectors[3] , this.vectors[2] , "#5C5656");
			this.faces[1] = new Face(this.vectors[2] , this.vectors[3] , this.vectors[5] , this.vectors[4] , "#E06D2F");
			this.faces[2] = new Face(this.vectors[4] , this.vectors[5] , this.vectors[7] , this.vectors[6] , "#1D181F");
			this.faces[3] = new Face(this.vectors[6] , this.vectors[7] , this.vectors[1] , this.vectors[0] , "#405159");
			this.faces[4] = new Face(this.vectors[1] , this.vectors[3] , this.vectors[5] , this.vectors[7] , "#9BA7AA");
			this.faces[5] = new Face(this.vectors[0] , this.vectors[2] , this.vectors[4] , this.vectors[6] , "#B5C6E1");

			this.faces.sort(function(a , b){
				return b.zIndex - a.zIndex;
			});
			this.faces.forEach(function(face){
				face.draw();
			})
		},

		update:function(){
			this._draw();
			rotateY(this.vectors);
			rotateX(this.vectors);
		}
	}

	var Face = function(vector1,vector2,vector3,vector4,color){
		this.v1 = vector1;
		this.v2 = vector2;
		this.v3 = vector3;
		this.v4 = vector4;
		this.color = color;
		this.zIndex = this.v1.z + this.v2.z + this.v3.z + this.v4.z;
		this.draw = function(){
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(this.v1._get2d().x , this.v1._get2d().y);
			ctx.lineTo(this.v2._get2d().x , this.v2._get2d().y);
			ctx.lineTo(this.v3._get2d().x , this.v3._get2d().y);
			ctx.lineTo(this.v4._get2d().x , this.v4._get2d().y);
			ctx.closePath();
			// ctx.fillStyle = "rgba("+parseInt(Math.random()*255)+","+parseInt(Math.random()*255)+","+parseInt(Math.random()*255)+",0.2)";
			ctx.fillStyle = this.color;
			ctx.fill();
		}
	}

	var angleX = 0.05;
	var angleY = 0.05;

	window.addEventListener("mousemove" , function(event){
		var x = event.clientX - canvas.offsetLeft - centerX;
		var y = event.clientY - canvas.offsetTop - centerY;
		angleY = x*0.0001;
		angleX = y*0.0001;
	});

	function rotateX(vectors){
		var cos = Math.cos(angleX);
		var sin = Math.sin(angleX);
		vectors.forEach(function(v){
			var y1 = v.y * cos - v.z * sin;
			var z1 = v.z * cos + v.y * sin;
			v.y = y1;
			v.z = z1;
		});
	}

	function rotateY(vectors){
		var cos = Math.cos(angleY);
		var sin = Math.sin(angleY);
		vectors.forEach(function(v){
			var x1 = v.x * cos - v.z * sin;
			var z1 = v.z * cos + v.x * sin;
			v.x = x1;
			v.z = z1;
		})
	}
})(window);