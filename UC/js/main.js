var main = (function(w){
	var ul = $(".pic_nav")[0],
		lis = [],
		nowIndex = 0,
		myscroll = new iScroll("wrapper",{
			vScroll:false,
			hScrollbar:true,
			vScrollbar:false
		}),
		myscroll2 = new iScroll("wrapper2",{
			snap:"li", 
			vScroll:false,
			momentum:false, 
			hScrollbar:false, 
			vScrollbar: false,
			onScrollEnd:function(){
				nowIndex = -parseInt($(".bp_nav").offset().left/$(".bp_nav li").offset().width);
				$(".activeindex").removeClass("activeindex")
				$(".dindex").eq(nowIndex).addClass("activeindex")
			}
		});
		mainfest = [
			{src:"img/game.jpg?version=2" , id:"pic1"},
			{src:"img/game2.jpg?version=2" , id:"pic2"},
			{src:"img/game.jpg?version=2" , id:"pic3"}
		];
	
	var main = {
		init:function(){
			var liNum = mainfest.length,
				html = "",
				dindex = "",
				ulWid = ul.offsetWidth,
				_this = this;
			for(var i=0;i<liNum;i++){
				html+="<li>加载中...</li>"
				dindex+="<span class='dindex'></span>"
			}
			ul.innerHTML = html;
			ul.style.left = "0px";
			$(".bp_nav").html(html);
			$(".imgNum").html(dindex);
			
			lis = ul.getElementsByTagName("li");
			var liwidth = lis[0].offsetWidth+lis[0].offsetLeft;
			
			ul.style.width = liwidth*liNum+"px";
			
			myscroll.refresh()
			myscroll2.refresh()
			
			this.eventHandle();
			setTimeout(function(){
				loadImage(mainfest);
			},100)
		},
		
		eventHandle:function(){
			//内容折叠
			$(".sp_head").tap(function(e){
				$(this).parent().toggleClass("suo");
			});
			
			//回到顶部
			var to;
			window.addEventListener("touchstart" , function(e){
				if(e.target===$(".toTop")[0]||e.target.parentNode===$(".toTop")[0]){
					e.preventDefault();
					e.stopPropagation();
					to = setInterval(function(){
						var tp = document.body.scrollTop+document.documentElement.scrollTop;
						if(tp<1){clearInterval(to)}
						else window.scrollTo(0 , (document.body.scrollTop+document.documentElement.scrollTop)*0.9)
					},16)
				}else if(to){
					clearInterval(to)
				}
			});
			
			window.addEventListener("resize" , function(){
				$(".bp_nav li").css("width",$(".bigPic").offset().width);
				$(".bp_nav").css("width",$(".bigPic").offset().width*$(".bp_nav li").length);
				myscroll2.scrollToElement($(".bp_nav li")[nowIndex])
				myscroll.refresh();
				myscroll2.refresh();
			})
			
			//截图弹窗
			var st = 0;
			$(".pic_nav").tap(function(e){
				if(e.target.tagName==="LI"||e.target.tagName==="IMG"){
					var li = e.target.tagName==="LI"?e.target:e.target.parentNode,
						allli = $(this).find("li"),
						index = 0;
					for(var i=0;i<allli.length;i++){
						if(li===allli[i]){
							index = i;
							break;
						}
					}
					st = document.body.scrollTop+document.documentElement.scrollTop;
					$(".bigPic").addClass("showPic");
					$(".bp_nav li").css("width",$(".bigPic").offset().width);
					$(".bp_nav").css("width",$(".bigPic").offset().width*$(".bp_nav li").length);
					window.addEventListener("touchmove",stopScroll)
					myscroll2.refresh();
					myscroll2.scrollToElement($(".bp_nav li")[index] , 0)
				}
			});
			
			$(".bp_nav").tap(function(e){
				$(".bigPic").removeClass("showPic");
				window.removeEventListener("touchmove",stopScroll)
			});
			
			function stopScroll(e){
				e.preventDefault();
			}
		}
	}
	
	
	//游戏图片加载
	var imageIndex = 0;
	function loadImage(mainfest){
		if(imageIndex===mainfest.length){
			imageIndex = 0;
			return;
		}
		
		var img = new Image();
		img.src = mainfest[imageIndex].src;
		
		if(img.complete){
			complete.call(img)
		}else {
			img.onload = function(){
				complete.call(img)
			}
		}
	}
	
	function complete(){
		lis[imageIndex].innerHTML = "<img src="+this.src+"/>";
		$(".bp_nav li")[imageIndex].innerHTML = "<img src="+this.src+"/>";
		imageIndex++;
		loadImage(mainfest)
	}
	
	return function(){
		main.init();
	};
})(window)

window.onload = main;
