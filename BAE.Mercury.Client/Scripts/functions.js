// Resize height of div automatically on viewport change
function viewportChange()	{
	var viewportHeight = $(window).height();
	//alert(viewportWidth + ' X ' + viewportHeight);

	//start added by Firdaus
	var h1 = $('#header').outerHeight(true);
	var h2 = $('#buttons').outerHeight(true);
	var h3 = $('#left-menu-collapse').outerHeight(true);
	var h4 = $('ul#left-menu').outerHeight(true);
	if($("ul#left-menu").is(":visible"))
	{
		$("#mailbox-scroll").css("height",viewportHeight - h1 - h2 - h3 - h4); /* mailbox list */
	}
	else
	{
		$("#mailbox-scroll").css("height",viewportHeight - h1 - h2 - h3); /* mailbox list */
	}
	//end added by firdaus

	// original: $("#mailbox-scroll").css("height",viewportHeight - 420); /* mailbox list */
	$("#email-list").css("height",viewportHeight - 184); /* email list */	
	$("#email-content").css("height",viewportHeight - 108); /* email content */
	$("#unit-list-wrap .unit-list").css("height",viewportHeight - 85); /* email list */
	$("#email-content.unit-details").css("height",viewportHeight - 0); /* email list */
}
function ucwords (str) {
    return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
        return $1.toUpperCase();
    });
}
// Start jQuery
var has_hidden = false;


// Remove scrollbar on resize 
function removeScroll() {
	$("#mailbox-scroll, #email-list, #email-content").getNiceScroll().remove();					
	$("#mailbox-scroll, #email-list, #email-content").css("overflow","hidden");	
}
// Add scroll bar
function addScroll() {
	$("#mailbox-scroll, #email-list, #email-content").niceScroll({
		autohidemode : true,
		cursorborder : "none",
		cursorcolor : "#6c6c6c",
		zindex  : 99
	});	
}

var ie7 = (document.all && !window.opera && window.XMLHttpRequest && typeof window.external.AddToFavoritesBar=='undefined') ? true : false;

$(document).ready(function () {

    // Function to create mailbox list dropdown
    /*	if(ie7)	{
    $("#mailbox ul#mailbox-list > li > div").click(function(){
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
    $('#mailbox-list > li > div').removeClass('open').next().stop().slideUp('fast');
    if($(this).hasClass('toBeProcessClose'))	{
    $(this).removeClass('open').next().stop().slideUp('fast');
    }
    else if	($(this).hasClass('toBeProcessOpen'))
    {
    $(this).addClass('open').next().stop().slideDown('fast');
    }
    $('#mailbox-list > li > div').removeClass('toBeProcessOpen').removeClass('toBeProcessClose');
    };
    $('#mailbox-list > li > div').click(function() {
    $(this).toggleNext();
    });	*/

    /*	$('#mailbox-list > li > div').click(function() {
    $('#mailbox-list > li > div').removeClass('open');
    $(this).addClass('open');
    });*/

    if (!ie7) {
        // Function to create resiable column, it does not work with IE7 so IE7 will be excluded.
        // Exclude IE7	
        $("#mailbox").resizable({
            maxWidth: 350,
            minWidth: 220,
            handles: 'e',
            start: function (event, ui) {
                removeScroll();
            },
            stop: function (event, ui) {
                addScroll();
            }

        });
        $("#email-list-wrap").resizable({
            maxWidth: 500,
            minWidth: 350,
            handles: 'e',
            alsoResize: "#search-inbox,#search-results",
            start: function (event, ui) {
                removeScroll();
            },
            stop: function (event, ui) {
                addScroll();
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
                addScroll();
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
    addScroll();
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
        $(".email-sort-options").hide("fast");
        $(this).siblings(".email-sort-options").stop().slideToggle("fast");
    });


    // Multilevel Accordion
    // Copyright (c) 2011 Peter Chapman - www.topverses.com
    // Freely distributable for commercial or non-commercial use
    $('#mailbox-list ul').hide();
    $('#mailbox-list li a').click(
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
		            addScroll();
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
		        openMe.slideUp('normal', function () { addScroll(); nextSpan.removeClass('open'); });
		    }
		    else {
		        mySiblings.slideUp('normal', function () { addScroll(); });
		        openMe.slideDown('normal', function () { addScroll(); nextSpan.addClass('open'); });
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
        $('#session-content .sample-1').slideDown(400, function () { addScroll(); }).siblings().hide();
        $('ul#session li.unit.sample-1').addClass("current");
        $('ul#session li.unit.sample-2').removeClass("current");
        $('ul#session li.unit.sample-3').removeClass("current");
    });
    $('ul#session li.unit.sample-2').click(function (event) {
        event.preventDefault();
        removeScroll();
        $('#session-content .sample-2').slideDown(400, function () { addScroll(); }).siblings().hide();
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
        $('#session-content .sample-3').slideDown(400, function () { addScroll(); }).siblings().hide();
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
    if ($('#email-list .email.timer').length > 0) {
        $('#email-list .email.timer').each(function (indexer, dom) {

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
            $("#email-search .remove").show();
        }
        else {
            $("#search-results").slideUp('fast');
            $("#email-search .remove").hide();
        }
        $("#search-inbox").blur(function () {
            $("#search-results").slideUp('fast');
        }
		);
    });

    $("#email-search .remove").click(function () {
        $("#email-search .remove").hide();
        $("#search-inbox").val('Search Inbox');
    });

    // New Message
    $("#editor-wrap #advance-button a").click(function () {
        removeScroll();
        $("#email-content .section.advance").slideToggle('fast', function () { addScroll(); });
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
    $("#email-content .hide-control label, #email-content .hide-control .arrow a").click(function () {
        removeScroll();
        $("#email-content .section .hide").slideToggle('fast', function () { addScroll(); });
        $("#email-content .hide-control").toggleClass('open');
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
            $('#mailbox-scroll').animate(aniArgs, (speed));
            $('ul#left-menu').stop().hide('slide', { direction: 'down' }, speed, function () {
                $('#left-menu-collapse a').show();
            });
            //$('ul#left-menu').stop().hide();


            //$('#mailbox-scroll').css('height', visibleHeight);
            /*$('#mailbox-scroll').animate(aniArgs, 250, function() {
            viewportChange();
            });*/


            //$('#mailbox-scroll').animate(aniArgs, 250);
            //$('#mailbox-scroll').css('height',viewportHeight - h1 - h2 - h3 - h4);
        }
        else {
            aniArgs['height'] = hiddenHeight;
            $('ul#left-menu').stop().show('slide', { direction: 'down' }, (speed / 3), function () {
                //viewportChange();
                $('#mailbox-scroll').animate(aniArgs, (speed / 2));
                $('#left-menu-collapse a').show();
                //addScroll();
            });
            //$('ul#left-menu').stop().show();
            //$('#mailbox-scroll').animate(aniArgs, 250, function() {
            //	viewportChange();				
            //});
            //$('#mailbox-scroll').css('height', hiddenHeight);
        }
        addScroll();
        /*viewportChange();*/


    });
    // End Collapsible left menu - new (Firdaus)


    //ryan collapsible left-menu (#mailbox)
    //ryan collapsible mail-listing (#email-list-wrap)
    var setOfcollapsible = [
							{
							    'id': 'mailbox',
							    'parent': 'email-search',
							    'width': 0,
							    'fade': '.counter, #mailbox-list li div a strong, #folder-list li a strong'
							},
							{
							    'id': 'email-list-wrap',
							    'parent': 'email-content',
							    'width': 0,
							    'fade': '#email-sort, #advance-search-button, .email div, #search .search-right'
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
                addScroll();
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
                    addScroll();
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