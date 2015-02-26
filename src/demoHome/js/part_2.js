var part_2=(function(){
	var img = new Image();
	return {
		init:function(){
			var html="";
			for(var i=0;i<demoData.length;i++){
				var d = demoData[i];
				html+="<a href='"+d.href+"' target='_blank' title='"+d.title+"'><div class='demos_pic' style='background-image:url("+d.src+")'></div>"
					+"<div class='demos_say'>"+d.title+"</div></a>"	
			}
			$(".demos").html(html);
		},

		animate:function(){
			$(".slideLine").addClass("activity")
			setTimeout(function(){
				document.body.style.overflow="scroll"
				$(".demos").addClass("showDemos");
			} , 1000)
		}
	}
})()