/// <reference path="jquery-1.7.1.intellisense.js" />
// ================================================================================
//          %name: Initialise.js %
//       %version: 29 %
//      Copyright: Copyright 2012-2013 BAE Systems Australia
//                 All rights reserved.
// ================================================================================

// Resize height of div automatically on viewport change
function viewportChange()
{
  var viewportHeight = $(window).height();

  $("#mailbox").css("height", viewportHeight - 108); /* mailbox list */
  $( "#message-list-wrap" ).css( "height", viewportHeight - 108 ); /* message list */
  if ( $( "#message-search" ).length != 0 )
  {
      $( "#listContainer" ).css( "height", viewportHeight - $( "#message-search" )[0].offsetHeight - 160 ); /* message list */
  }
  else
  {
      $( "#listContainer" ).css( "height", viewportHeight   - 200 ); /* message list */
  }
    $("#message-content").css("height", viewportHeight - 108); /* message content */
  $( "#editor" ).css( "height", viewportHeight - 108 ); /* message content */
  //start added by Firdaus
  var h1 = $('#header').outerHeight(true);
  var h2 = $('#buttons').outerHeight(true);
  var h3 = $('#action-list-collapse').outerHeight(true);
  var h4 = $('ul#action-list').outerHeight(true);
  if ($("ul#action-list").is(":visible"))
  {
    $("#mailbox-scroll").css("height", viewportHeight - h1 - h2 - h3 - h4); /* mailbox list */
  }
  else
  {
    $("#mailbox-scroll").css("height", viewportHeight - h1 - h2 - h3); /* mailbox list */
  }

  // Add the nice scroll feature.
  removeScroll();
  addScroll();
}

// Remove scrollbar on resize 

function removeScroll()
{
  if ($("#mailbox").length > 0)
  {
    $("#mailbox-scroll, #listContainer, #message-content").css("overflow", "hidden");
    $("#mailbox-scroll, #listContainer, #message-content").getNiceScroll().remove();
  }
}

// Add scroll bar

function addScroll()
{
  if ($("#mailbox").length > 0)
  {
    $("#mailbox-scroll, #message-content").niceScroll({
      autohidemode: true,
      cursorborder: "none",
      cursorwidth: 8,
      cursorminheight: 55,
      cursorcolor: "#6c6c6c",
      zindex: 99,
      listObject: (typeof (LstObj) != "undefined") ? LstObj : null // Update ChrisN : Code shouldn't reference global vars in other script files
    });
  }

  if ( $( "#listContainer" ).length > 0 )// message.list.js should be loaded
  {
    addListContainerScroll();
  }
}

function addListContainerScroll()
{
  $("#listContainer").niceScroll( {
    autohidemode: true,
    cursorborder: "none",
    cursorwidth: 8,
    cursorminheight: 55,
    cursorcolor: "#6c6c6c",
    zindex: 99,
    scrollspeed: 30,
    mousescrollstep: 15,
    listObject: (typeof (LstObj) != "undefined") ? LstObj : null // Update ChrisN : Code shouldn't reference global vars in other script files
  });
  $( "#listContainer" ).getNiceScroll().resize();
  $( "#listContainer" ).getNiceScroll()[0].cursor.keydown( function ( event )
  {
      keyHandler( event, LstObj.ChosenObj );//function in message.list.js
  } );
}

// Attaches the toggling behaviour to the folders so that clicking the twistie will expand and collapse the folders children.
function applyMailboxFolderToggleAbility()
{
    $('#mailbox-list > li > div.hasChildren').click(function ()
    {
        $(this).toggleNext();
    });
}

// Attaches the ability to resize the mailbox side pane.
function applyMailboxResizeAbility()
{
    $("#mailbox").resizable({
        maxWidth: 350,
        minWidth: 220,
        handles: 'e',
        start: function (event, ui)
        {
            removeScroll();
        },
        stop: function (event, ui)
        {
            addScroll();
        }
    });
}

// Start jQuery
$(document).ready(function()
{
    // Dropdown Menu
    $(".btn-drop-parent").click(function () {
        $(".btn-drop").hide("fast");
        $(this).siblings(".btn-drop").stop().slideToggle("fast");
    });


  // process click event on sort menus

  function sortOptClickEvent(event)
  {
    var obj = $(event.srcElement);
    event.preventDefault();
    $(".message-sort-options").hide('fast'); //hide both menus
    if (obj.hasClass("m1")) // is criterion menu
    {
      //set absolute position in page
      $("#criterionOptions").css("left", obj.offset().left + "px");
      $("#criterionOptions").css("top", (parseInt(obj.offset().top) + 20) + "px");
      $("#criterionOptions").stop().animate({
        height: "toggle",
        opacity: "toggle"
      }, 300);

    }
    else
    { //is direction menu
      //set absolute position in page
      $("#orderOptions").css("left", (obj.offset().left - 60) + "px");
      $("#orderOptions").css("top", (parseInt(obj.offset().top) + 20) + "px");
      $("#orderOptions").stop().animate({
        height: "toggle",
        opacity: "toggle"
      }, 300);
    }
  }

  // Function to create mailbox list dropdown
  jQuery.fn.toggleNext = function()
  {
    if ($(this).hasClass('open'))
    {
      $(this).addClass('toBeProcessClose');
    }
    else
    {
      $(this).addClass('toBeProcessOpen');
    }
    $('#mailbox-list > li > div').removeClass('open').next().stop().slideUp('fast');
    if ($(this).hasClass('toBeProcessClose'))
    {
      $(this).removeClass('open').next().stop().slideUp('fast');
    }
    else if ($(this).hasClass('toBeProcessOpen'))
    {
      $(this).addClass('open').next().stop().slideDown('fast');
    }
    $('#mailbox-list > li > div').removeClass('toBeProcessOpen').removeClass('toBeProcessClose');
  };

  applyMailboxFolderToggleAbility();
    
  // Function to set dynamic height on each column on browser resize
  $(window).resize(function()
  {
    viewportChange();
  });
  viewportChange();

  // Function to create resizeable column, it does not work with IE7 so IE7 will be excluded.
  // Exclude IE7
  var ie7 = (document.all && !window.opera && window.XMLHttpRequest && typeof window.external.AddToFavoritesBar == 'undefined') ? true : false;
  if (!ie7)
  {
    applyMailboxResizeAbility();
      
    $("#message-list-wrap").resizable({
      maxWidth: 500,
      minWidth: 385,
      handles: 'e',
      alsoResize: "#search-inbox,#search-results",
      start: function(event, ui)
      {
        removeScroll();
      },
      stop: function(event, ui)
      {
        addScroll();
      }
    });

    $("#session-list").resizable({
      maxWidth: 500,
      minWidth: 400,
      handles: 'e',
      alsoResize: "#search-inbox,#search-results",
      start: function(event, ui)
      {
        removeScroll();
      },
      stop: function(event, ui)
      {
        addScroll();
      }
    });
  }
    //resize message list when search area is opened
  $("a#advanced-search-button").click(function(event)
  {
      var viewportHeight = $( window ).height();
        event.preventDefault();
        removeScroll();
        $( "#advanced-search" ).stop().slideToggle( 'fast', function ()
        {
            if ( $( '#advanced-search' ).is( ':hidden' ) )
            {
                $( "#listContainer" ).css( "height", viewportHeight - 200 ); /* message list */
            }
            else
            {
                $( "#listContainer" ).css( "height", viewportHeight - $("#message-search")[0].offsetHeight - 160 ); /* message list */
            }
        } );
        addScroll();
  });

  $("#search-inbox").click(function()
  {
    if (this.value == this.defaultValue)
    {
      this.value = '';
    }
  });

  $("#search-inbox").blur(function()
  {
    if (this.value == '')
    {
      this.value = this.defaultValue;
    }
  });

  $("#search-inbox").keyup(function()
  {
    value = $("#search-inbox").val();
    if (!value == '')
    {
      $("#search-results").slideDown('fast');
      $("#message-search .remove").show();
    }
    else
    {
      $("#search-results").slideUp('fast');
      $("#message-search .remove").hide();
    }
    $("#search-inbox").blur(function()
    {
      $("#search-results").slideUp('fast');
    });
  });

  $("#message-search .remove").click(function()
  {
    $("#message-search .remove").hide();
    $("#search-inbox").val('Search Inbox');
  });

  $("a.col-arrow").click(function(event) { sortOptClickEvent(event); });

  // Hide the sort options/directions drop downs when the user clicks elsewhere
  $("a.col-arrow").blur(function(event) { $(".message-sort-options").hide('fast'); });
  // Custom scrollbar
  addScroll();

  // Collapsible left menu - new (Firdaus)
  $('#action-list-collapse a').click(function(event)
  {
    event.preventDefault();
    removeScroll();
    var viewportHeight = $(window).height();
    var h1 = $('#header').outerHeight(true);
    var h2 = $('#buttons').outerHeight(true);
    var h3 = $('#action-list-collapse').outerHeight(true);
    var h4 = $('ul#action-list').outerHeight(true);
    var visibleHeight = viewportHeight - h1 - h2 - h3;
    var hiddenHeight = viewportHeight - h1 - h2 - h3 - h4;

    // create the object literal
    //http://stackoverflow.com/questions/2274242/using-a-variable-for-a-javascript-object-key
    var aniArgs = {};
    var speed = 500;

    $('#action-list-collapse a').hide();

    if ($('ul#action-list').is(':visible'))
    {
      aniArgs['height'] = visibleHeight;
      $('#mailbox-scroll').animate(aniArgs, (speed));
      $('ul#action-list').stop().hide('slide', { direction: 'down' }, speed, function()
      {
        $('#action-list-collapse a').show();
      });
    }
    else
    {
      aniArgs['height'] = hiddenHeight;
      $('ul#action-list').stop().show('slide', { direction: 'down' }, (speed / 3), function()
      {
        $('#mailbox-scroll').animate(aniArgs, (speed / 2));
        $('#action-list-collapse a').show();
      });
    }
    addScroll();

  });
  // End Collapsible left menu - new (Firdaus)


  // Custom scrollbar
  //    When you call "niceScroll" you can pass some parameters to custom visual aspects:

  //•cursorcolor - change cursor color in hex, default is "#000000"
  //•cursoropacitymin - change opacity very cursor is inactive (scrollabar "hidden" state), range from 1 to 0, default is 0 (hidden)
  //•cursoropacitymax - change opacity very cursor is active (scrollabar "visible" state), range from 1 to 0, default is 1 (full opacity)
  //•cursorwidth - cursor width in pixel, default is 5 (you can write "5px" too)
  //•cursorborder - css definition for cursor border, default is "1px solid #fff"
  //•cursorborderradius - border radius in pixel for cursor, default is "4px"
  //•zindex - change z-index for scrollbar div, default value is 9999
  //•scrollspeed - scrolling speed, default value is 60
  //•mousescrollstep - scrolling speed with mouse wheel, default value is 40 (pixel)
  //•touchbehavior - enable cursor-drag scrolling like touch devices in desktop computer, default is false
  //•hwacceleration - use hardware accelerated scroll when supported, default is true
  //•boxzoom - enable zoom for box content, default is false
  //•dblclickzoom - (only when boxzoom=true) zoom activated when double click on box, default is true
  //•gesturezoom - (only when boxzoom=true and with touch devices) zoom activated when pitch out/in on box, default is true
  //•grabcursorenabled, display "grab" icon for div with touchbehavior = true, default is true
  //•autohidemode, how hide the scrollbar works, true=default / "cursor" = only cursor hidden / false = do not hide
  //•background, change css for rail background, default is ""
  //•iframeautoresize, autoresize iframe on load event (default:true)
  //•cursorminheight, set the minimum cursor height in pixel (default:20)
  //•preservenativescrolling, you can scroll native scrollable areas with mouse, bubbling mouse wheel event (default:true)
  //•railoffset, you can add offset top/left for rail position (default:false)
  //•bouncescroll, enable scroll bouncing at the end of content as mobile-like (only hw accell) (default:false)
  //•spacebarenabled, enable page down scrolling when space bar has pressed (default:true)
  //•railpadding, set padding for rail bar (default:{top:0,right:0,left:0,bottom:0})
  //•disableoutline, for chrome browser, disable outline (orange hightlight) when selecting a div with nicescroll (default:true)

});