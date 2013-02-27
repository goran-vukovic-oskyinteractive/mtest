/* Javascript function for Distribution Management page */
$(document).ready(function() {
	/* Tabs */
	$(".tabs").tabs();
	/* Clone */
	$("#select-field li .btn-minus").css("display","none");
	$(".btn-plus").click(function() {
		removeScroll();
	  	$("#select-field li:last").clone(true).insertAfter("#select-field li:last");
		$("#select-field li:last input[type='text']").val('');	  	
		$(".btn-minus").css("display","block");		
		addScroll();
		return false;
	});
	$(".btn-minus").click(function(event) {
	  	var i = $(".field").size();
		if(i > 1) {			
			event.preventDefault();
			$(this).closest('.field').remove();	
			return false;
			}
		else {
	/****** WORK IN PROGESS *****/
			//$(".btn-minus").css("display","none");
			//$("#select-field li:first .btn-minus").css("display","none");
			alert("Last item cannot be removed");
			}
		
	});
	
	// Add scollbar for expadible nodes
	$("#graph .node.expandible .expand").niceScroll({
		autohidemode : true,
		cursorborder : "none",
		cursorcolor : "#6c6c6c",
		zindex  : 99
	});	
	
	// Arrow to expand the nodes
		$("#graph .node.expandible").click(function(){
			$("#graph .node.expandible .expand").slideToggle("fast");
			
		// TODO : Make the arrow to expand only its group unit, Remove scrollbar on hide?? 
		
	});
	
	// POPUP
	//$(".popup").colorbox({width:"70%"});
	
	
});