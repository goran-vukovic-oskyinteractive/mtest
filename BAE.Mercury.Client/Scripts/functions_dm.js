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
    $("#eset-content").css("height", viewportHeight - 0); /* eset list */
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
        zindex: 99,
		cursorwidth: 10
    });
}

function init_ajax_complete()
{
	removeScrollDM();
	init_expandLevel();
	addDMScroll();
}

function dm_ajax_completed()
{
	resizeSic();
	resizeApp();
}

function init_expandLevel()
{
	if( ($('#setbox-list li.set ul.child-set').length < 1) && ($('#setbox-list li.set > div > a').length > 0) )
	{
		$('#setbox-list li.set').find('ul').addClass('child-set').find('li').addClass('child').find('a').live('click', (function(event){ext_child_click(event, $(this));}));
	}
}

function ext_child_click(event, dom)
{
    event.preventDefault();
	$('#setbox-list div').removeClass('open');
	$('#setbox-list li.child').removeClass('active');
	$(dom).parent('li').addClass('active').parent('ul').siblings('div').addClass('active');
    }

//    function expandLevel(event) {
//        if (event != undefined) { event.preventDefault(); }
//        init_expandLevel();
//        removeScrollDM();
//        var openMe = $(this).parent('div').parent('li').find('ul');
//        var openMe_siblings = $(this).parent('div').parent('li').siblings().find('ul');

//        $(this).parent('div').parent('li').siblings().find('div').removeClass('open').removeClass('active');
//        $('#setbox-list li.child').removeClass('active');
//        if (($(this).parent('div').hasClass('open')) || ($(this).parent('div').hasClass('active'))) {
//            $(this).parent('div').removeClass('open').removeClass('active');
//            openMe.slideUp('normal');
//        }
//        else {
//            $(this).parent('div').addClass('open');
//            openMe_siblings.slideUp('normal', function () {
//                openMe.slideDown('normal');
//                openMe.css('zoom', '1'); //ie7 fix	        	
//            });
//        }
//        addDMScroll();
//    }
function expandLevel(that, event) {
    if (event != undefined) { event.preventDefault(); }
    init_expandLevel();
    removeScrollDM();
    var openMe = that.parent('div').parent('li').find('ul');
    var openMe_siblings = that.parent('div').parent('li').siblings().find('ul');

    that.parent('div').parent('li').siblings().find('div').removeClass('open').removeClass('active');
    $('#setbox-list li.child').removeClass('active');
    if ((that.parent('div').hasClass('open')) || (that.parent('div').hasClass('active'))) {
        that.parent('div').removeClass('open').removeClass('active');
        openMe.slideUp('normal');
    }
    else {
        that.parent('div').addClass('open');
        openMe_siblings.slideUp('normal', function () {
            openMe.slideDown('normal');
            openMe.css('zoom', '1'); //ie7 fix	        	
        });
    }
    addDMScroll();
}

var ie7 = (document.all && !window.opera && window.XMLHttpRequest && typeof window.external.AddToFavoritesBar == 'undefined') ? true : false;

$(document).ready(function () {
    if (!ie7) {
        // Function to create resiable column, it does not work with IE7 so IE7 will be excluded.
        // Exclude IE7	
        $("#setbox").resizable({
            maxWidth: 350,
            minWidth: 260,
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
    /*LOADED BY AJAX > dm.js
    $('#setbox-list li.set > div > a').click(
		function (event) {
		    expandLevel(event);
		}
	);
	*/
	//only for doc ready
	init_expandLevel();

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
            $('#setbox-scroll').animate(aniArgs, (speed), function () { addDMScroll(); });
            $('ul#left-menu').stop().hide('slide', { direction: 'down' }, speed, function () {
                $('#left-menu-collapse a').show();
                $('ul#left-menu').addClass('closed');
            });
        }
        else
        {
            aniArgs['height'] = hiddenHeight;
            $('ul#left-menu').stop().show('slide', { direction: 'down' }, (speed / 3), function () {
                $('#setbox-scroll').animate(aniArgs, (speed / 2), function () { addDMScroll(); });
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
	$("#graph").css("height",popupHeight - 220); /* calculate height for graph, 250 is with the rule visualiser visible */
}
// Resize visualiser div based on graph div
function resizeRvDiv()
	{
	var graphWidth = $("#graph").width();
	$("#rule-visualiser-wrap-outer").css("width",graphWidth + 1);
}
	
function resizeSic() 
{
        var winWidth = $('#graph').width();
	$('span.sic').width(winWidth - 460);
}
function resizeApp() 
{
	var sicWidth = $('td.caction').width();
	$('div.appointment-empty').width(sicWidth);
}
	
$(document).ready(function() {
	$(window).on('load resize', function(){ resizeSic(); resizeApp(); });
	

	$(".tabs").tabs();
	//
	$("#select-field li .btn-minus").css("display", "none");
    /*
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
	*/
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
	$(".popup-inline.dm-btn").colorbox({inline:true,width:"700px"});
	$(".buttons .popup-inline a").colorbox({inline:true,width:"700px"});	
	

	// Resize graph height based on browser viewport
	$(window).resize(function() {
		resizeDmDiv();
		resizeRvDiv()
	});
	resizeDmDiv();
	resizeRvDiv();
	
	// Resize SIC
	resizeSic();
	resizeApp();

    // Force focus on input field after cbox complete.

/* MODAL DIALOG BOX USING JQUERY UI */

// Basic
$('.dialog-normal').dialog({
	height		:	'auto',
	modal		:	true,
	resizable	:	false,
	autoOpen	:	false
});

// Confirmation
$('.dialog-confirm').dialog({
	height		:	'auto',
	modal		:	true,
	resizable	:	false,
	autoOpen	:	false,
	buttons		:	{Cancel: function() {$(this).dialog('close');}}
});

// The trigger
$('.dialog-open-normal').click(function() {
	$('.dialog-normal').dialog({title:$(this).attr('title')});
	$('.dialog-normal').dialog('open');
});

});

/**
------------------------------------------------------------------------

	Function - Intervals call

------------------------------------------------------------------------
**/

/*
//CONFIG
var dm_time_intervals_minutes = 10;

//------>>
var dm_timerX = 0;
function timer_controller()
{
	if(dm_timerX == 0)
	{
		dm_timerX = self.setInterval(function(){
			dm_intervals_callee();
		},(dm_time_intervals_minutes*(15* 100*60)));		
	} 
	else
	{
		dm_timerX = window.clearInterval(dm_timerX);
		dm_timerX = 0;
		}
	}
$(document).ready(function() {

	//TODO: any dom validation? for controlled start?
	timer_controller();
});
//------>>

function dm_intervals_callee()	{
	//console.log('intervals called');  
	    //alert('10m intervals called.. find me at functions_dm.js');
    if (currentSet)
        currentSet.LockSet();
}
*/

