/**
global vars
**/
var el_sort_by_dtg = 'dtg';
var el_sort = 'desc';
var keyword_search = '';
var defaultSearchValue = '';


function openSubClick(event) {
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


// Resize height of div automatically on viewport change
function viewportChange()	{
	  var viewportHeight = $(window).height();
	  //alert(viewportWidth + ' X ' + viewportHeight);
	  $("#mailbox-scroll").css("height",viewportHeight - 375); /* mailbox list */
	  $("#email-list").css("height",viewportHeight - 184); /* email list */
	  $("#email-content").css("height",viewportHeight - 108); /* email content */
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
/*
//scroll to plugins
;(function(d){var k=d.scrollTo=function(a,i,e){d(window).scrollTo(a,i,e)};k.defaults={axis:'xy',duration:parseFloat(d.fn.jquery)>=1.3?0:1};k.window=function(a){return d(window)._scrollable()};d.fn._scrollable=function(){return this.map(function(){var a=this,i=!a.nodeName||d.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!i)return a;var e=(a.contentWindow||a).document||a.ownerDocument||a;return d.browser.safari||e.compatMode=='BackCompat'?e.body:e.documentElement})};d.fn.scrollTo=function(n,j,b){if(typeof j=='object'){b=j;j=0}if(typeof b=='function')b={onAfter:b};if(n=='max')n=9e9;b=d.extend({},k.defaults,b);j=j||b.speed||b.duration;b.queue=b.queue&&b.axis.length>1;if(b.queue)j/=2;b.offset=p(b.offset);b.over=p(b.over);return this._scrollable().each(function(){var q=this,r=d(q),f=n,s,g={},u=r.is('html,body');switch(typeof f){case'number':case'string':if(/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(f)){f=p(f);break}f=d(f,this);case'object':if(f.is||f.style)s=(f=d(f)).offset()}d.each(b.axis.split(''),function(a,i){var e=i=='x'?'Left':'Top',h=e.toLowerCase(),c='scroll'+e,l=q[c],m=k.max(q,i);if(s){g[c]=s[h]+(u?0:l-r.offset()[h]);if(b.margin){g[c]-=parseInt(f.css('margin'+e))||0;g[c]-=parseInt(f.css('border'+e+'Width'))||0}g[c]+=b.offset[h]||0;if(b.over[h])g[c]+=f[i=='x'?'width':'height']()*b.over[h]}else{var o=f[h];g[c]=o.slice&&o.slice(-1)=='%'?parseFloat(o)/100*m:o}if(/^\d+$/.test(g[c]))g[c]=g[c]<=0?0:Math.min(g[c],m);if(!a&&b.queue){if(l!=g[c])t(b.onAfterFirst);delete g[c]}});t(b.onAfter);function t(a){r.animate(g,j,b.easing,a&&function(){a.call(this,n,b)})}}).end()};k.max=function(a,i){var e=i=='x'?'Width':'Height',h='scroll'+e;if(!d(a).is('html,body'))return a[h]-d(a)[e.toLowerCase()]();var c='client'+e,l=a.ownerDocument.documentElement,m=a.ownerDocument.body;return Math.max(l[h],m[h])-Math.min(l[c],m[c])};function p(a){return typeof a=='object'?a:{top:a,left:a}}})(jQuery);
*/

/**
 * Copyright (c) 2007-2012 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * @author Ariel Flesler
 * @version 1.4.3.1
 */
;(function($){var h=$.scrollTo=function(a,b,c){$(window).scrollTo(a,b,c)};h.defaults={axis:'xy',duration:parseFloat($.fn.jquery)>=1.3?0:1,limit:true};h.window=function(a){return $(window)._scrollable()};$.fn._scrollable=function(){return this.map(function(){var a=this,isWin=!a.nodeName||$.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!isWin)return a;var b=(a.contentWindow||a).document||a.ownerDocument||a;return/webkit/i.test(navigator.userAgent)||b.compatMode=='BackCompat'?b.body:b.documentElement})};$.fn.scrollTo=function(e,f,g){if(typeof f=='object'){g=f;f=0}if(typeof g=='function')g={onAfter:g};if(e=='max')e=9e9;g=$.extend({},h.defaults,g);f=f||g.duration;g.queue=g.queue&&g.axis.length>1;if(g.queue)f/=2;g.offset=both(g.offset);g.over=both(g.over);return this._scrollable().each(function(){if(e==null)return;var d=this,$elem=$(d),targ=e,toff,attr={},win=$elem.is('html,body');switch(typeof targ){case'number':case'string':if(/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(targ)){targ=both(targ);break}targ=$(targ,this);if(!targ.length)return;case'object':if(targ.is||targ.style)toff=(targ=$(targ)).offset()}$.each(g.axis.split(''),function(i,a){var b=a=='x'?'Left':'Top',pos=b.toLowerCase(),key='scroll'+b,old=d[key],max=h.max(d,a);if(toff){attr[key]=toff[pos]+(win?0:old-$elem.offset()[pos]);if(g.margin){attr[key]-=parseInt(targ.css('margin'+b))||0;attr[key]-=parseInt(targ.css('border'+b+'Width'))||0}attr[key]+=g.offset[pos]||0;if(g.over[pos])attr[key]+=targ[a=='x'?'width':'height']()*g.over[pos]}else{var c=targ[pos];attr[key]=c.slice&&c.slice(-1)=='%'?parseFloat(c)/100*max:c}if(g.limit&&/^\d+$/.test(attr[key]))attr[key]=attr[key]<=0?0:Math.min(attr[key],max);if(!i&&g.queue){if(old!=attr[key])animate(g.onAfterFirst);delete attr[key]}});animate(g.onAfter);function animate(a){$elem.animate(attr,f,g.easing,a&&function(){a.call(this,e,g)})}}).end()};h.max=function(a,b){var c=b=='x'?'Width':'Height',scroll='scroll'+c;if(!$(a).is('html,body'))return a[scroll]-$(a)[c.toLowerCase()]();var d='client'+c,html=a.ownerDocument.documentElement,body=a.ownerDocument.body;return Math.max(html[scroll],body[scroll])-Math.min(html[d],body[d])};function both(a){return typeof a=='object'?a:{top:a,left:a}}})(jQuery);

var ie7 = (document.all && !window.opera && window.XMLHttpRequest && typeof window.external.AddToFavoritesBar=='undefined') ? true : false;

$(document).ready(function () {

    // Function to create mailbox list dropdown
    /*var ie7 = (document.all && !window.opera && window.XMLHttpRequest && typeof window.external.AddToFavoritesBar=='undefined') ? true : false;
    if(ie7)	{
    $("#mailbox ul#mailbox-list > li > div").click(function(){
    $(this).toggleClass("open").next("ul").toggle();
    });
    }
    if(!ie7)	{*/
    /*
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
    });	
    */

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
            minWidth: 320,
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
    /* UPDATED
    $('#mailbox-list ul').hide();
    $('#mailbox-list li a, #mailbox-list li div').click(
    function() 
    {
    var openMe = $(this).next();
    var mySiblings = $(this).parent().siblings().find('ul');
    if (openMe.is(':visible')) {
    openMe.slideUp('normal'); 
    } else {
    mySiblings.slideUp('normal');
    openMe.slideDown('normal');
    }
    }
    );*/
    $('#mailbox-list ul').hide();
    $('#mailbox-list li a').click(
		function() 
		{
		    var thisDiv = '';
			if($(this).find('a').length > 0)
			{
		        thisDiv = $(this);
		    }
			else
			{
		        thisDiv = $(this).parent('div');
		    }
		    removeScroll();
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
		    }
		}
	);


		// Accordion for ABM


    $('#session ul').hide();
    $('.openSub').bind('click', openSubClick);
    //		function (event) {
//		    event.preventDefault();
//		    removeScroll();
//		    var openMe = $(this).next();
//		    var mySiblings = $(this).parent().siblings().find('ul');
//		    var nextSpan = $(this).find('span');
//		    if (openMe.is(':visible')) {
//		        openMe.slideUp('normal', function () { addScroll(); nextSpan.removeClass('open'); });
//		    }
//		    else {
//		        mySiblings.slideUp('normal', function () { addScroll(); });
//		        openMe.slideDown('normal', function () { addScroll(); nextSpan.addClass('open'); });
//		    }
//		}
    //



    $('#session ul li:last').addClass("last");
    // Tooltip for ABM
    // Setup a content array for the tooltips
    // IN PROGRESS
    var tip1 = "<p><strong>Farnham, Pat</strong></p><p><span>Tel:</span>+61 2 8888 8888</p><p><span>Mobile:</span>+61 2 8888 8888</p><p><span>Email:</span><a href=\"mailto:Farnham.pat@abc.gov\">Farnham.pat@abc.gov</a></p>";
    $(".tip1").simpletip({ fixed: true, position: ["0", "-100"], persistent: true, content: tip1 });
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

    if ($('#eff-date, #exp-date, #reply-by-date, #dtg').length > 0) {
        $('#eff-date, #exp-date, #reply-by-date, #dtg').datetimepicker({
            //showOn: "both",
            showOn: 'button',
            buttonImage: "images/icon-abm_calendar.png",
            buttonImageOnly: true,
            timeFormat: "HH mm",
            dateFormat: "dd mm yy",
            timeSuffix: '',
            isRTL: false,
            separator: " " + theTimeZone + " ",
            constrainInput: false,
            numberOfMonths: 1,
            showTime: true,
            setDefaults: true,
            controlType: 'select',
            onSelect: function (returnText) {
                executeRepair(this, returnText);
            },
            onClose: function (returnText) {
                executeRepair(this, returnText);
            }
        });

        $('#eff-date, #exp-date, #reply-by-date, #dtg').keyup(function () {
            executeRepair(this, $(this).val());
        });

        function executeRepair(element, strValue) {
            $(element).css('border-color', '#BFBEBE');
            if (!checkDateTimeFormat(strValue)) {
                //console.log('INVALID FORMAT!');
                $(element).css('border-color', 'red');
            }
        }

        function checkDateTimeFormat(inputValue) {
            var pattern = "\\b[0-1][0-9]\\s[0-5][0-9]\\s[A-z]\\s[0-3][0-9]\\s[0-1][1-2]\\s[0-3][0-9][0-9][0-9]\\b";
            pattern = pattern.replace('[A-z]', '[' + theTimeZone + ']');
            pattern = new RegExp(pattern);
            return pattern.test(inputValue);
        }
    }

    if ($('#edit-session-status, #classification').length > 0) {
        //$('#edit-session-status, #classification').selectbox();
    }


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
        //$("#email-content .hide-control a").toggleClass('expanded');		
        $("#email-content .hide-control").toggleClass('open');
    });

    /**
    keyboard accessibility
    **/
	if( $('#email-list').length > 0 )
	{
		function moveCursorEmailList(move)
		{
            if ((move == undefined) || (move == 0)) { return; }

            var allFamily = $('#email-list div.email');
            var currentSelect = $('#email-list div.email.onFocus');
            var theSiblings = '';
            var elemetTest = '';

			if( $(allFamily).length > 0 )
			{
				if( currentSelect == undefined )
				{
                    $('#email-list div.email').first().addClass('onFocus');
                    return false;
                }

				if(move == 'first')
				{
                    $('#email-list div.email').removeClass('onFocus').first().addClass('onFocus');
                }
				else if(move == 'last')
				{
                    $('#email-list div.email').removeClass('onFocus').last().addClass('onFocus');
                }
				else
				{
					$(allFamily).each(function(index, dom)
					{
                        elemetTest = $(allFamily[(index - move)]);
						if( ( $(dom).hasClass('onFocus') ) && ( $(elemetTest).length > 0 ) )
						{
                            $(currentSelect).removeClass('onFocus');
                            $(elemetTest).addClass('onFocus');
                            return false;
                        }
                    });
                }

                $('#email-list').scrollTo($('#email-list div.email.onFocus'), 150);
                $('#email-list div.email.onFocus').click().focus();
            }
        }

        $('#email-list div.email').live('click', function () {
            $('#email-list div.email').removeClass('onFocus');
            $(this).addClass('onFocus');
        });

		function checkKey(e)
		{
            switch(e.keyCode)
            {
                case 38: //arrow up
                    moveCursorEmailList(1);
                    e.preventDefault();
                    break;

                case 40: //arrow down
                    moveCursorEmailList(-1);
                    e.preventDefault();
                    break;

                case 36: //home
                    moveCursorEmailList('first');
                    e.preventDefault();
                    break;

                case 35: //end
                    moveCursorEmailList('last');
                    e.preventDefault();
                    break;


                case 33: //page up
                    moveCursorEmailList(10);
                    e.preventDefault();
                    break;

                case 34: //page down
                    moveCursorEmailList(-10);
                    e.preventDefault();
                    break;

                case 27: //escape
                case 13: //enter
                case 0: //spacebar
                    e.preventDefault();
                    break;

                //the rest as default    
                //default:            	    
            }
            //console.log('HIT:' + e.keyCode);
            //alert('HIT:' + e.keyCode);
        }

        if ($.browser.mozilla) {
            $(document).keypress(checkKey);
        } else {
            $(document).keydown(checkKey);
        }
    }

    /**
    email list sort interaction
	
    document global line #1
    var el_sort_by_dtg = 'dtg';
    var el_sort = 'desc';

    **/
	if( $('#email-sort').length > 0 )
	{
        var sort_parent_id = '#email-sort';
        var dtg_sort_id = '#sort-col-1'
        var general_sort_id = '#sort-col-2'
        var dtg_sorting_element = $(sort_parent_id + ' ' + dtg_sort_id);
        var email_sort_order_element = $(sort_parent_id + ' ' + general_sort_id);
        var selectedClass = 'selected';
        var subPathToList = 'div.email-sort-options ul li';
        var listDataAttr = 'data';

		function clear_selected(parentElement)
		{
			if(parentElement != undefined)
			{
                $(parentElement).find(subPathToList).removeClass(selectedClass);
            }
        }

        clear_selected(dtg_sorting_element);
        clear_selected(email_sort_order_element);

        var elementSets = [
					'dtg_sorting_element',
					'email_sort_order_element'
				];

        $.each(elementSets, function (indEle, theElement) {
            $(eval(theElement)).find(subPathToList).each(function (index, dom) {
                if (
					($(dom).attr(listDataAttr) == el_sort_by_dtg)
					||
					($(dom).attr(listDataAttr) == el_sort)
				)
				{
                    $(dom).addClass(selectedClass);
                }

                $(dom).click(function (event) {
                    event.preventDefault();
                    var testTemp = $(dom).parent().closest('.col').attr('id');
					if(testTemp != undefined)
					{
                        var currentParent = $(sort_parent_id + ' #' + testTemp);
                        clear_selected(currentParent);
                        $(dom).addClass(selectedClass);


						
						if( dtg_sort_id == '#' + testTemp )
						{
                            el_sort_by_dtg = $(dom).attr(listDataAttr);
							$(dtg_sort_id + ' a').first().html( $(dom).html() );
                        }
						else
						{
                            el_sort = $(dom).attr(listDataAttr);
							$(general_sort_id + ' a').first().html( $(dom).html() );
                        }

						$('.mbx').first().trigger('click');

                        //interaction
                        setTimeout(function () {
                            $('#' + testTemp).find('.email-sort-options').stop().slideToggle(400);
                        }, 200);
                    }
                });
            });
        });
	}

	/**
	search
	**/
	if( $('#search-inbox').length > 0 )
    {
    	var defaultPrefix = 'Message contains: ';
        defaultSearchValue = $('#search-inbox').attr('placeholder');

        if( $('#search-inbox').val() == "" )
        {
        	$('#search-inbox').val( defaultSearchValue );
        }

        $('#search-inbox').focus(function(){
        	if( $('#search-inbox').val() == defaultSearchValue )
	        {
	        	$('#search-inbox').val("");
	        }
        });

        $('#search-inbox').blur(function(){
        	if( $('#search-inbox').val() == "" )
	        {
	        	$('#search-inbox').val(defaultSearchValue);
	        }
        });

        $("#search-inbox").keyup(function() {

	  		var value = $("#search-inbox").val();	  		

	  		if(value != defaultSearchValue)
	  		{
	  			$("#search-results .group.keyword ul li a").html(defaultPrefix + value);
	  		}
	  		
			if(value != "")
			{
				$("#search-results").slideDown('fast');
				$("#email-search .remove").show();
			}
			else
			{
				$("#search-results").slideUp('fast');
				$("#email-search .remove").hide();
			}

		});

		$("#search-results > .group.keyword > ul > li > a").click(function(event){
  			event.preventDefault();

  			var value = $("#search-inbox").val();
  			if(value != defaultPrefix)
  			{
  				$('.mbx').first().trigger('click');
  			}
			//return false;
  		});

  		$("#search-inbox").blur(function() {
			$("#search-results").slideUp('fast');
		});

		$("#email-search .remove").click(function(event) {
			event.preventDefault();
			$("#email-search .remove").hide();
			$("#search-inbox").val(defaultSearchValue);
		});

		$("#search-results .group ul li a").click(function(event){
			event.preventDefault();
			//return false;
		});
		$('#search').attr('onsubmit', 'return false;')
		$('#search').submit(function(event){
			event.preventDefault();
			//return false;
		});
    }
});