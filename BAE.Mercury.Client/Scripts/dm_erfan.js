// Javascript for DM - Erfan Sakib


$(document).ready(function() {
	// Simple form validation
	
	// define colorbox so we can close it when needed
	cbox = jQuery.colorbox;
	
	// check value of input that got the .required class
	$('.add-set-submit').click(function(event)  {
		event.preventDefault();
		if ($('.required').val().length==0){
			// error validation 
			alert('Please ensure the Set Name is not empty');
			$('.required').css('border','1px solid red');
			return(false);
		}
			// pass validation
			alert("Validation pass, submit form here");			
			cbox.close();
	});
	
	$('.edit-set-submit').click(function(event)  {
		event.preventDefault();
		if ($('.required').val().length==0){
			// error validation 
			alert('Please ensure the Set Name is not empty');
			$('.required').css('border','1px solid red');
			return(false);
		}
			// pass validation
			alert("Validation pass, submit form here");			
			cbox.close();
	});
	
	// Delete
	$('.delete-yes').click(function(event)  {
		event.preventDefault();
		alert("Delete set action here");			
		cbox.close();
	});	
	$('.delete-no').click(function(event)  {
		event.preventDefault();
		// do nothing, just close the popup
		cbox.close();
	});
	
	// Delete
	$('.copy-yes').click(function(event)  {
		event.preventDefault();
		alert("Copy set action here");			
		cbox.close();
	});	
	$('.copy-no').click(function(event)  {
		event.preventDefault();
		// do nothing, just close the popup
		cbox.close();
	});
	
});