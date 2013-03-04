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
	
	// Add scollbar for expandible nodes
	$("#graph .node.expandible .expand").niceScroll({
		autohidemode : false,
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
	
	// Search SIC
	$("#search-sic").click(function() {
		if (this.value == this.defaultValue) {
			this.value = '';}
		}
	);
	$("#search-sic").blur(function() {
	if (this.value == '') {
		this.value = this.defaultValue;}
		}
	);
	
	// Rule visualiser
	$("#rule-visualiser-wrap-trigger").click(function(event) {
	    event.preventDefault();
	    $("#rule-visualiser-wrap").slideToggle("normal");
	});
	
	// Checkbox for Set
	$(".btn-set .checkbox").click(function(event) {
		event.preventDefault();
	  	$(this).toggleClass("on");		
	});
	
	// Use Jquery to apply class to first and last td 
	if( $('#session-content').length > 0 )
	{
		//$("table.inner-table tr:first-child td:first-child").addClass("first");
		//$("table.inner-table tr':last-child td:first-child").addClass("last");
		
		$('table.appointment td table.inner-table:first-child tr:first-child td:first-child').addClass("first");
		$('table.appointment td table.inner-table:last-child tr:last-child td:first-child').addClass("last");
	}
	
	
});