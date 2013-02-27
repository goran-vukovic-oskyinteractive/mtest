	$().ready(function() {
		$('textarea.tinymce').tinymce({
			// Location of TinyMCE script
			script_url : '/Scripts/tiny_mce/tiny_mce.js',

			// General options
			theme : "advanced",
			skin : "o2k7",
        	skin_variant : "black",
			plugins : "autolink,lists,pagebreak,advlink,iespell",

			// Theme options
			theme_advanced_buttons1 : "fontsizeselect,|,forecolor,bold,italic,underline,|,justifyleft,justifycenter,justifyright,|,bullist,numlist,|,outdent,indent,blockquote,|,link,unlink,anchor,|,code",
			theme_advanced_toolbar_location : "top",
			theme_advanced_toolbar_align : "left",
			theme_advanced_statusbar_location : "bottom",
			theme_advanced_resizing : false,
			width : "100%",
			height: "300px",

			// Example content CSS (should be your site CSS)
			content_css : "css/editor.css"
			
		});
	});
