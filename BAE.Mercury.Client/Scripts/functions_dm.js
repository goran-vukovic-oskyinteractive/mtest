// Resize height of div automatically on viewport change
function viewportChangeDM() {
    var viewportHeight = $(window).height();
    //alert(viewportWidth + ' X ' + viewportHeight);

    //start added by Firdaus
    var h1 = $('#header').outerHeight(true);
    var h2 = $('#buttons').outerHeight(true);
    var h3 = $('#left-menu-collapse').outerHeight(true);
    var h4 = $('ul#left-menu').outerHeight(true);
    if ($("ul#left-menu").is(":visible"))
    {
        $("#setbox-scroll").css("height", viewportHeight - h1 - h2 - h3 - h4); /* setbox list */
    }
    else
    {
        $("#setbox-scroll").css("height", viewportHeight - h1 - h2 - h3); /* setbox list */
    }
    //end added by firdaus

    // original: $("#setbox-scroll").css("height",viewportHeight - 420); /* setbox list */
    $("#eset-list").css("height", viewportHeight - 184); /* eset list */
    $("#eset-content").css("height", viewportHeight - 108); /* eset content */
    $("#unit-list-wrap .unit-list").css("height", viewportHeight - 85); /* eset list */
    $("#eset-content.unit-details").css("height", viewportHeight - 0); /* eset list */
}
function ucwords(str) {
    return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
        return $1.toUpperCase();
    });
}
// Start jQuery
var has_hidden = false;


// Remove scrollbar on resize 
function removeScrollDM() {
    $("#setbox-scroll, #eset-list, #eset-content").getNiceScroll().remove();
    $("#setbox-scroll, #eset-list, #eset-content").css("overflow", "hidden");
}
// Add scroll bar
function addDMScroll() {
    $("#setbox-scroll, #eset-list, #eset-content").niceScroll({
        autohidemode: false,
        cursorborder: "none",
        cursorcolor: "#6c6c6c",
        zindex: 99
    });
}

var ie7 = (document.all && !window.opera && window.XMLHttpRequest && typeof window.external.AddToFavoritesBar == 'undefined') ? true : false;

$(document).ready(function () {
    if (!ie7) {
        // Function to create resiable column, it does not work with IE7 so IE7 will be excluded.
        // Exclude IE7	
        $("#setbox").resizable({
            maxWidth: 350,
            minWidth: 220,
            handles: 'e',
            start: function (event, ui) {
                removeScrollDM();
            },
            stop: function (event, ui) {
                addDMScroll();
            }

        });
        $("#eset-list-wrap").resizable({
            maxWidth: 500,
            minWidth: 350,
            handles: 'e',
            //alsoResize: "#search-inbox,#search-results",
            start: function (event, ui) {
                removeScrollDM();
            },
            stop: function (event, ui) {
                addDMScroll();
            }
        });        
    }

    // Dropdown Menu
    $(".btn-drop-parent").click(function () {
        $(".btn-drop").hide("fast");
        $(this).siblings(".btn-drop").stop().slideToggle("fast");
    });


    // Function to set dynamic height on each column on browser resize
    $(window).resize(function () {
        viewportChangeDM();
    });
    viewportChangeDM();


    // Custom scrollbar
    addDMScroll();

    // Advance Search
    $("a#advance-search-button").click(function (event) {
        event.preventDefault();
        $("#advance-search").stop().slideToggle("fast"); //.removeScrollDM();
    });

    // Expand the 'From' field
    $(".from .expand").click(function (event) {
        event.preventDefault();
        $(".from .hide").stop().slideToggle("fast");
        $(".from .expand").stop().toggleClass("down");
    });

    // Expand the 'Action' field
    $(".action .expand").click(function (event) {
        event.preventDefault();
        $(".action .hide").stop().slideToggle("fast");
        $(".action .expand").stop().toggleClass("down");
    });
    // Expand the 'Info' field
    $(".info .expand").click(function (event) {
        event.preventDefault();
        $(".info .hide").stop().slideToggle("fast");
        $(".info .expand").stop().toggleClass("down");

    });

    // Expand the Sort By
    $("a.col-arrow").click(function (event) {
        event.preventDefault();
        $(".eset-sort-options").hide("fast");
        $(this).siblings(".eset-sort-options").stop().slideToggle("fast");
    });


    // Multilevel Accordion
    // Copyright (c) 2011 Peter Chapman - www.topverses.com
    // Freely distributable for commercial or non-commercial use
    $('#setbox-list ul').hide();
    $('#setbox-list li.set > div > a').click(
		function (event) {
			event.preventDefault();
		    /*var thisDiv = '';
		    if ($(this).find('a').length > 0) {
		        thisDiv = $(this);
		    }
		    else {
		        thisDiv = $(this).parent('div');
		    }*/
		    //console.log(thisDiv);

		    removeScrollDM();
		    var openMe = $(this).parent('div').parent('li').find('ul');
		    var mySiblings = $(this).parent('div').parent('li').siblings().find('ul');
		    $(this).parent('div').parent('li').siblings().find('div').removeClass('open');
		    if( openMe.hasClass('open') ) 
		    {
		        $(this).parent('div').removeClass('open');
		        openMe.slideUp('normal', function(){
		        	mySiblings.slideDown('normal');
		        });	
		    }
		    else 
		    {
		        $(this).parent('div').addClass('open');
		        mySiblings.slideUp('normal', function(){
		        	openMe.slideDown('normal');
		        	openMe.css('zoom','1');	//ie7 fix	        	
		        });		        
		        //To do: IE7 needs a refresh of DIV here
		    }
		    addDMScroll();
		}
	);   

    // Inbox search
    // apply default value on input field
    $("#search-inbox").click(function () {
        if (this.value == this.defaultValue) {
            this.value = '';
        }
    }
	);
    $("#search-inbox").blur(function () {
        if (this.value == '') {
            this.value = this.defaultValue;
        }
    }
	);
    $("#search-inbox").keyup(function () {
        value = $("#search-inbox").val();
        if (!value == '') {
            $("#search-results").slideDown('fast');
            $("#eset-search .remove").show();
        }
        else {
            $("#search-results").slideUp('fast');
            $("#eset-search .remove").hide();
        }
        $("#search-inbox").blur(function () {
            $("#search-results").slideUp('fast');
        }
		);
    });

    $("#eset-search .remove").click(function () {
        $("#eset-search .remove").hide();
        $("#search-inbox").val('Search Inbox');
    });

   
    $("#eset-content .hide-control label, #eset-content .hide-control .arrow a").click(function () {
        removeScrollDM();
        $("#eset-content .section .hide").slideToggle('fast', function () { addDMScroll(); });
        $("#eset-content .hide-control").toggleClass('open');
    });

    // Collapsible left menu - new (Firdaus)
    $('#left-menu-collapse a').click(function (event) {
        event.preventDefault();
        removeScrollDM();
        var viewportHeight = $(window).height();
        var h1 = $('#header').outerHeight(true);
        var h2 = $('#buttons').outerHeight(true);
        var h3 = $('#left-menu-collapse').outerHeight(true);
        var h4 = $('ul#left-menu').outerHeight(true);
        var visibleHeight = viewportHeight - h1 - h2 - h3 - 11; //unknown? where the 11px
        var hiddenHeight = viewportHeight - h1 - h2 - h3 - h4;

        // create the object literal
        //http://stackoverflow.com/questions/2274242/using-a-variable-for-a-javascript-object-key
        var aniArgs = {};
        var speed = 500;

        $('#left-menu-collapse a').hide();

        if(!$('ul#left-menu').hasClass('closed'))
        {
            aniArgs['height'] = visibleHeight;
            $('#setbox-scroll').animate(aniArgs, (speed), function(){addDMScroll();});        
            $('ul#left-menu').stop().hide('slide', { direction: 'down' }, speed, function () {
                $('#left-menu-collapse a').show();
                $('ul#left-menu').addClass('closed');
            });
        }
        else
        {
            aniArgs['height'] = hiddenHeight; 
			$('ul#left-menu').stop().show('slide', {direction: 'down'}, (speed/3), function() {
				$('#setbox-scroll').animate(aniArgs, (speed/2), function(){addDMScroll();});
				$('#left-menu-collapse a').show();
        		$('ul#left-menu').removeClass('closed').css('top', '0px');        		
			});
        }
        
    });
    // End Collapsible left menu - new (Firdaus)

    //ryan collapsible left-menu (#setbox)
    //ryan collapsible mail-listing (#eset-list-wrap)
    var setOfcollapsible = [
							{
							    'id': 'setbox',
							    'parent': 'eset-search',
							    'width': 0,
							    'fade': '.counter, #setbox-list li div a strong, #folder-list li a strong'
							},
							{
							    'id': 'eset-list-wrap',
							    'parent': 'eset-content',
							    'width': 0,
							    'fade': '#eset-sort, #advance-search-button, .eset div, #search .search-right'
							}
						];

    var fade_animateDuration = 100;
    var collapsible_class = 'collapse-box';
    //var collapsible_animateDuration = 300;		
    //var collapsible_animationType = 'swing';

    var runningVar = new Object;
    $(setOfcollapsible).each(function (index, setDom) {
        if (
			($('#' + setDom.parent + ' div.collapse a').length > 0)
			&&
			($('#' + setDom.id).length > 0)
		) {
            setOfcollapsible[index].width = $('#' + setDom.id).css('width');

            $('#' + setDom.parent + ' div.collapse a').click(function (event) {
                event.preventDefault();
                removeScrollDM();
                var aThis = $(this);
                $(setDom.fade).fadeOut(fade_animateDuration);
                /*if($('#' + setDom.id).css('width').replace('px','') != 0)
                {
                runningVar[setDom.id] = $('#' + setDom.id).css('width').replace('px','');
                }*/
                var searchInputWidth = $('#search-inbox').css('width').replace('px', '');

                /*$('#' + setDom.id).animate(
                {
                width: ($('#' + setDom.id).css('width') >= setDom.width ? 0 : runningVar[setDom.id])
                }, 
                collapsible_animateDuration, 
                collapsible_animationType, 
                function(){
                addDMScroll();
                $(aThis).toggleClass('active'); 
						
                $('#search-inbox').css('width', searchInputWidth );

                $(setDom.fade).fadeIn(fade_animateDuration);
                }
                );*/

                if ($('#' + setDom.id).hasClass(collapsible_class)) {
                    $('#' + setDom.id).show();
                    $('#' + setDom.id).removeClass(collapsible_class);
                    $(setDom.fade).fadeIn(fade_animateDuration);
                }
                else {
                    $('#' + setDom.id).hide();
                    $('#' + setDom.id).addClass(collapsible_class);
                }
                setTimeout(function () {
                    addDMScroll();
                    $(aThis).toggleClass('active');
                    $('#search-inbox').css('width', searchInputWidth);
                }, 200);
            });
        }
    });
});
/* end main script */
/* Javascript function for Distribution Management page */
function resizeDmDiv()
	{
	var popupHeight = $(window).height();
	//alert(resizeDiv + ' X ' + resizeDiv);
	$("#graph").css("height",popupHeight - 250); /* email list */
}
// Resize visualiser div based on graph div
function resizeRvDiv()
	{
	var graphWidth = $("#graph").width();
	$("#rule-visualiser-wrap-outer").css("width",graphWidth + 1);
}
	
	
$(document).ready(function() {

	//
	$(".tabs").tabs();
	//
	$("#select-field li .btn-minus").css("display","none");
	$(".btn-plus").click(function() {
		removeScrollDM();
	  	$("#select-field li:last").clone(true).insertAfter("#select-field li:last");
		$("#select-field li:last input[type='text']").val('');	  	
		$(".btn-minus").css("display","block");
		addDMScroll();
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
	//WORK IN PROGESS 
			//$(".btn-minus").css("display","none");
			//$("#select-field li:first .btn-minus").css("display","none");
			alert("Last item cannot be removed");
			}
		
	});
	
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
	/*$("#rule-visualiser-wrap-trigger").click(function(event) {
		removeScrollDM();
	    event.preventDefault();
	 $("#rule-visualiser-wrap").slideToggle('fast', function () { addDMScroll(); });		
	});
	*/
	// Hide RV
	$("#rule-visualiser-wrap").hide();
	// Trigger RV when click
	$("#rule-visualiser-wrap-trigger").click(function(event) {		
	    event.preventDefault();		
		if ($("#rule-visualiser-wrap").is(":hidden")) {
		  $("#rule-visualiser-wrap").slideDown("fast");
		} else {
		  $("#rule-visualiser-wrap").slideUp("fast");
		}
	});
	
	
	// Checkbox for Set
	$(".btn-set .checkbox").click(function(event) {
		event.preventDefault();
	  	$(this).toggleClass("on");		
	});
	
	// Use Jquery to apply class to first and last td 
	/*
	if( $('#session-content').length > 0 )	{
		$('table.appointment td table.inner-table:first-child tr:first-child td:first-child').addClass("first");
		$('table.appointment td table.inner-table:last-child tr:last-child td:first-child').addClass("last");
	}
	
	$('table.appointment td table.inner-table:first-child tr:first-child td:first-child').live(function(event){
		event.preventDefault();
		$(this).addClass('first');
	});
	$('table.appointment td table.inner-table:last-child tr:last-child td:first-child').live(function(event){
		event.preventDefault();
		$(this).addClass('last');
	});
	*/
	// POPUP
	$(".popup").colorbox({width:"70%"});
	$(".popup-inline").colorbox({inline:true,width:"70%"});

	//live add
	$('.appointment .add .popup-inline').live('click', function(event){
		event.preventDefault();
		var hidden_dom = $(this).attr('href');
		//ie7 fix
		if(ie7)
		{
			hidden_dom = hidden_dom.split('/');
			hidden_dom = hidden_dom[hidden_dom.length-1];
		}

		if( $(hidden_dom).length > 0 )
		{
			$.colorbox({
						inline:true,
						width:"70%",
						href: hidden_dom
					});
		}
	});
	
	// Resize graph height based on browser viewport
	$(window).resize(function() {
		resizeDmDiv();
		resizeRvDiv()
	});
	resizeDmDiv();
	resizeRvDiv();


	//wait for dom to visible
	var graphElement = document.getElementById('graph');		
	if(window.addEventListener) 
	{
	   graphElement.addEventListener('DOMSubtreeModified', graph_contentChanged, false);
	} 
	else
	{
		if(window.attachEvent) 
		{
		  	graphElement.attachEvent('DOMSubtreeModified', graph_contentChanged);
		}
	}
	function graph_contentChanged()
	{
		$('table.appointment td table.inner-table:first-child tr:first-child td:first-child').addClass("first");
		$('table.appointment td table.inner-table:last-child tr:last-child td:first-child').addClass("last");		
	}
});