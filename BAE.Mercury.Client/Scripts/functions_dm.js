// Resize height of div automatically on viewport change
function viewportChange() {
    var viewportHeight = $(window).height();
    //alert(viewportWidth + ' X ' + viewportHeight);

    //start added by Firdaus
    var h1 = $('#header').outerHeight(true);
    var h2 = $('#buttons').outerHeight(true);
    var h3 = $('#left-menu-collapse').outerHeight(true);
    var h4 = $('ul#left-menu').outerHeight(true);
    if ($("ul#left-menu").is(":visible")) {
        $("#setbox-scroll").css("height", viewportHeight - h1 - h2 - h3 - h4); /* setbox list */
    }
    else {
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
function removeScroll() {
    $("#setbox-scroll, #eset-list, #eset-content").getNiceScroll().remove();
    $("#setbox-scroll, #eset-list, #eset-content").css("overflow", "hidden");
}
// Add scroll bar
function addDMScroll() {
    $("#setbox-scroll, #eset-list, #eset-content").niceScroll({
        autohidemode: true,
        cursorborder: "none",
        cursorcolor: "#6c6c6c",
        zindex: 99
    });
}

var ie7 = (document.all && !window.opera && window.XMLHttpRequest && typeof window.external.AddToFavoritesBar == 'undefined') ? true : false;

$(document).ready(function () {

    // Function to create setbox list dropdown
    /*	if(ie7)	{
    $("#setbox ul#setbox-list > li > div").click(function(){
    $(this).toggleClass("open").next("ul").toggle();
    });
    }

    jQuery.fn.toggleNext = function()	{
    if($(this).hasClass('open'))	{
    $(this).addClass('toBeProcessClose');
    }
    else	{
    $(this).addClass('toBeProcessOpen');
    }
    $('#setbox-list > li > div').removeClass('open').next().stop().slideUp('fast');
    if($(this).hasClass('toBeProcessClose'))	{
    $(this).removeClass('open').next().stop().slideUp('fast');
    }
    else if	($(this).hasClass('toBeProcessOpen'))
    {
    $(this).addClass('open').next().stop().slideDown('fast');
    }
    $('#setbox-list > li > div').removeClass('toBeProcessOpen').removeClass('toBeProcessClose');
    };
    $('#setbox-list > li > div').click(function() {
    $(this).toggleNext();
    });	*/

    /*	$('#setbox-list > li > div').click(function() {
    $('#setbox-list > li > div').removeClass('open');
    $(this).addClass('open');
    });*/

    if (!ie7) {
        // Function to create resiable column, it does not work with IE7 so IE7 will be excluded.
        // Exclude IE7	
        $("#setbox").resizable({
            maxWidth: 350,
            minWidth: 220,
            handles: 'e',
            start: function (event, ui) {
                removeScroll();
            },
            stop: function (event, ui) {
                addDMScroll();
            }

        });
        $("#eset-list-wrap").resizable({
            maxWidth: 500,
            minWidth: 350,
            handles: 'e',
            alsoResize: "#search-inbox,#search-results",
            start: function (event, ui) {
                removeScroll();
            },
            stop: function (event, ui) {
                addDMScroll();
            }
        });
        $("#session-list").resizable({
            maxWidth: 500,
            minWidth: 400,
            handles: 'e',
            alsoResize: "#search-inbox,#search-results",
            start: function (event, ui) {
                removeScroll();
            },
            stop: function (event, ui) {
                addDMScroll();
            }
        });
        // alert("test");
    }

    // Dropdown Menu
    $(".btn-drop-parent").click(function () {
        $(".btn-drop").hide("fast");
        $(this).siblings(".btn-drop").stop().slideToggle("fast");
    });


    // Function to set dynamic height on each column on browser resize
    $(window).resize(function () {
        viewportChange();
    });
    viewportChange();


    // Custom scrollbar
    addDMScroll();
    //viewportChange();

    // Advance Search
    $("a#advance-search-button").click(function (event) {
        event.preventDefault();
        $("#advance-search").stop().slideToggle("fast"); //.removeScroll();
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
    $('#setbox-list li a').click(
		function () {
		    var thisDiv = '';
		    if ($(this).find('a').length > 0) {
		        thisDiv = $(this);
		    }
		    else {
		        thisDiv = $(this).parent('div');
		    }
		    //console.log(thisDiv);

		    removeScroll();
		    //var openMe = $(this).next();
		    var openMe = $(this).parent('div').parent('li').find('ul');
		    var mySiblings = $(this).parent('div').parent('li').siblings().find('ul');
		    $(this).parent('div').parent('li').siblings().find('div').removeClass('open');
		    if (openMe.is(':visible')) {
		        openMe.slideUp('normal');
		        $(this).parent('div').removeClass('open');
		    } else {
		        mySiblings.slideUp('normal');
		        openMe.slideDown('normal', function () {
		            addDMScroll();
		        });
		        $(this).parent('div').addClass('open');
		        //To do: IE7 needs a refresh of DIV here
		    }
		}
	);

    // Accordion for ABM
    $('#session ul').hide();
    $('.openSub').click(
		function (event) {
		    event.preventDefault();
		    removeScroll();
		    var openMe = $(this).next();
		    var mySiblings = $(this).parent().siblings().find('ul');
		    var nextSpan = $(this).find('span');
		    if (openMe.is(':visible')) {
		        openMe.slideUp('normal', function () { addDMScroll(); nextSpan.removeClass('open'); });
		    }
		    else {
		        mySiblings.slideUp('normal', function () { addDMScroll(); });
		        openMe.slideDown('normal', function () { addDMScroll(); nextSpan.addClass('open'); });
		    }
		}
	);
    $('#session ul li:last').addClass("last");
    // Tooltip for ABM
    // Setup a content array for the tooltips
    // IN PROGRESS
    if ($('.tip1').length > 0) {
        var tip1 = "<p><strong>Farnham, Pat</strong></p><p><span>Tel:</span>+61 2 8888 8888</p><p><span>Mobile:</span>+61 2 8888 8888</p><p><span>Email:</span><a href=\"mailto:Farnham.pat@abc.gov\">Farnham.pat@abc.gov</a></p>";
        $(".tip1").simpletip({ fixed: true, position: ["0", "-100"], persistent: true, content: tip1 });
    }
    // Example of how the content will load when clicking on the item
    $('#session-content .sample-1,#session-content .sample-2,#session-content .sample-3').hide();
    $('ul#session li.unit.sample-1').click(function (event) {
        event.preventDefault();
        removeScroll();
        $('#session-content .sample-1').slideDown(400, function () { addDMScroll(); }).siblings().hide();
        $('ul#session li.unit.sample-1').addClass("current");
        $('ul#session li.unit.sample-2').removeClass("current");
        $('ul#session li.unit.sample-3').removeClass("current");
    });
    $('ul#session li.unit.sample-2').click(function (event) {
        event.preventDefault();
        removeScroll();
        $('#session-content .sample-2').slideDown(400, function () { addDMScroll(); }).siblings().hide();
        if ($('ul#session li.unit.sample-2').length > 0) {
            $('ul#session li.unit.sample-2').addClass("current");
        }

        if ($('ul#session li.unit.sample-1').length > 0) {
            $('ul#session li.unit.sample-1').removeClass("current");
        }

        if ($('ul#session li.unit.sample-3').length > 0) {
            $('ul#session li.unit.sample-3').removeClass("current");
        }

    });
    $('ul#session li.unit.sample-3').click(function (event) {
        event.preventDefault();
        removeScroll();
        $('#session-content .sample-3').slideDown(400, function () { addDMScroll(); }).siblings().hide();
        $('ul#session li.unit.sample-3').addClass("current");
        $('ul#session li.unit.sample-1').removeClass("current");
        $('ul#session li.unit.sample-2').removeClass("current");
    });

    // Date/Time Picker for Add Session	
    var theTimeZone = $('#eff-timezone,#timezone').val();
    if (theTimeZone == '') {
        theTimeZone = ' ';
    }

    if ($('#eff-date, #exp-date, #reply-by-date, #dtg, #audit-from, #audit-to').length > 0) {
        try {
            //ie6 fix
            document.execCommand("BackgroundImageCache", false, true);
        } catch (exception) {
            // other browsers do nothing
        }


        //DO NOT MAKE ANY CHANGES HERE SEE jquery-ui-timepicker-addon.js
        var datetimepicker_opt = new Object;

        datetimepicker_opt = {
            showOn: 'button',
            buttonImage: "images/icon-abm_calendar.png",
            buttonImageOnly: true,
            timeFormat: "hhmm",
            dateFormat: "dd|M yy",
            //timeSuffix: '',
            //isRTL: false,
            separator: theTimeZone + " ",
            //constrainInput: false,
            //numberOfMonths: 1,
            showTime: true
            //setDefaults: true,
            //controlType: 'select'			
            /*onSelect: function(returnText){
            executeRepair(this, returnText);
            },
            onClose: function(returnText){
            executeRepair(this, returnText);
            }*/
        };
        //IE having issue with drop-down
        if (!ie7) { datetimepicker_opt.controlType = 'select'; }

        $('#eff-date, #exp-date, #reply-by-date, #dtg, #audit-from, #audit-to').datetimepicker(datetimepicker_opt);

        $('#eff-date, #exp-date, #reply-by-date, #dtg').keyup(function () {
            executeRepair(this, $(this).val());
        });

        function executeRepair(element, strValue) {
            $(element).css('border-color', '#BFBEBE');
            /*if(!checkDateTimeFormat(strValue))
            {
            //console.log('INVALID FORMAT!');
            $(element).css('border-color', 'red');
            }*/
        }

        function checkDateTimeFormat(inputValue) {
            //version 1
            //var pattern = "\\b[0-1][0-9]\\s[0-5][0-9]\\s[A-z]\\s[0-3][0-9]\\s[0-1][1-2]\\s[0-3][0-9][0-9][0-9]\\b";	
            var pattern = "\\b[0-9][0-9][0-9][0-9][0-9][0-9][theTZ]\\s[A-z][A-z][A-z]\\s[0-3][0-9][0-9][0-9]\\b";
            pattern = pattern.replace('[theTZ]', '[' + theTimeZone + ']');
            pattern = new RegExp(pattern);
            return pattern.test(inputValue);
        }
    }

    /*if( $('#edit-session-status, #classification').length > 0 )
    {
    $('#edit-session-status, #classification').selectbox();
    }*/


    // Countdown script demo
    if ($('#eset-list .eset.timer').length > 0) {
        $('#eset-list .eset.timer').each(function (indexer, dom) {

            var totalT = 0;
            totalT = parseInt($(dom).find('.timer .hour').html()) * (60 * 60);
            totalT = totalT + parseInt($(dom).find('.timer .minute').html()) * 60;
            totalT = totalT + parseInt($(dom).find('.timer .second').html());

            var refreshIntervalId = setInterval(function () {
                //console.log(totalT);
                totalT = totalT - 1;
                if (totalT >= 0) {
                    var temp = 0;
                    var time = totalT;
                    var hr = Math.floor(time / (60 * 60));
                    $(dom).find('.timer .hour').html(("00" + hr).slice(-2));
                    var min = time - (hr * (60 * 60));
                    min = Math.floor(min / 60);
                    $(dom).find('.timer .minute').html(("00" + min).slice(-2));
                    var sc = time - ((hr * (60 * 60)) + (min * 60));
                    $(dom).find('.timer .second').html(("00" + sc).slice(-2));

                }
                else {
                    clearInterval(refreshIntervalId);
                }
            }, 1000);

        });
    }

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

    // New Message
    $("#editor-wrap #advance-button a").click(function () {
        removeScroll();
        $("#eset-content .section.advance").slideToggle('fast', function () { addDMScroll(); });
        $("#editor-wrap #advance-button").stop().toggleClass(function () {
            if ($(this).hasClass('close')) {
                $(this).find('a').html('Show Advanced Options');
                $(this).removeClass('close');
                return 'open';
            } else {
                $(this).find('a').html('Hide Advanced Options');
                $(this).removeClass('open');
                return 'close';
            }
        });
    });
    $("#eset-content .hide-control label, #eset-content .hide-control .arrow a").click(function () {
        removeScroll();
        $("#eset-content .section .hide").slideToggle('fast', function () { addDMScroll(); });
        $("#eset-content .hide-control").toggleClass('open');
    });

    // Collapsible left menu - old
    /*$("#left-menu-collapse a").click(function(event) {
    event.preventDefault();
    $("ul#left-menu").slideToggle("fast");
    });*/


    // Collapsible left menu - new (Firdaus)
    $('#left-menu-collapse a').click(function (event) {
        event.preventDefault();
        removeScroll();
        var viewportHeight = $(window).height();
        var h1 = $('#header').outerHeight(true);
        var h2 = $('#buttons').outerHeight(true);
        var h3 = $('#left-menu-collapse').outerHeight(true);
        var h4 = $('ul#left-menu').outerHeight(true);
        var visibleHeight = viewportHeight - h1 - h2 - h3;
        var hiddenHeight = viewportHeight - h1 - h2 - h3 - h4;

        // create the object literal
        //http://stackoverflow.com/questions/2274242/using-a-variable-for-a-javascript-object-key
        var aniArgs = {};
        var speed = 500;

        $('#left-menu-collapse a').hide();

        if ($('ul#left-menu').is(':visible')) {
            aniArgs['height'] = visibleHeight;
            $('#setbox-scroll').animate(aniArgs, (speed));
            $('ul#left-menu').stop().hide('slide', { direction: 'down' }, speed, function () {
                $('#left-menu-collapse a').show();
            });
            //$('ul#left-menu').stop().hide();


            //$('#setbox-scroll').css('height', visibleHeight);
            /*$('#setbox-scroll').animate(aniArgs, 250, function() {
            viewportChange();
            });*/


            //$('#setbox-scroll').animate(aniArgs, 250);
            //$('#setbox-scroll').css('height',viewportHeight - h1 - h2 - h3 - h4);
        }
        else {
            aniArgs['height'] = hiddenHeight;
            $('ul#left-menu').stop().show('slide', { direction: 'down' }, (speed / 3), function () {
                //viewportChange();
                $('#setbox-scroll').animate(aniArgs, (speed / 2));
                $('#left-menu-collapse a').show();
                //addDMScroll();
            });
            //$('ul#left-menu').stop().show();
            //$('#setbox-scroll').animate(aniArgs, 250, function() {
            //	viewportChange();				
            //});
            //$('#setbox-scroll').css('height', hiddenHeight);
        }
        addDMScroll();
        /*viewportChange();*/


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
                removeScroll();
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

    // Check if user agent is iPad
    $.browser.safari = /safari/.test(navigator.userAgent.toLowerCase());
    if ($.browser.safari) {
        $('body').addClass('mac-os');
    }

    // Window Popup
    $("a[target='popup']").click(function (event) {
        var myObject = $(this);
        var href = myObject.attr("href");
        var name = myObject.attr("title");
        var config = "width=1000, height=750, top=50, left=50, scrollbars=1, toolbar=0, status=0, menubar=0";
        var popup = window.open(href, name, config);

        if (window.focus) {
            popup.focus();
        }
        event.preventDefault();
    });

});
/* end main script */
/* Javascript function for Distribution Management page */
$(document).ready(function() {

/*
	//
	$(".tabs").tabs();
	//
	$("#select-field li .btn-minus").css("display","none");
	$(".btn-plus").click(function() {
		removeScroll();
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
	
*/	
});