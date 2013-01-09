/// <reference path="jquery-1.7.1.intellisense.js" />
// =================================================
//      %name: Initialise.js %
//      %version: 10 %
//      Copyright: Copyright 2012 BAE Systems Australia
//                 All rights reserved.
// =================================================
// Resize height of div automatically on viewport change
function viewportChange()
{
    var viewportHeight = $( window ).height();
    
    $( "#mailbox" ).css( "height", viewportHeight - 108 ); /* mailbox list */
    $( "#message-list-wrap" ).css( "height", viewportHeight - 108 ); /* message list */
    $( "#listContainer" ).css( "height", viewportHeight - 200 ); /* message list */
    $( "#message-content" ).css( "height", viewportHeight - 108 ); /* message content */
}
// Start jQuery
$( document ).ready( function ()
{
    // Remove scrollbar on resize 
    function removeScroll()
    {
        if ( $( "#mailbox" ).length > 0 )
        {
            $( "#mailbox, #listContainer, #message-content" ).css( "overflow", "hidden" );
            $("#mailbox, #listContainer, #message-content").getNiceScroll().remove();
            //alert("removing scroll");
        }
    }
    // Add scroll bar
    function addScroll()
    {
        if ( $( "#mailbox" ).length > 0 )
        {
            $("#mailbox,  #message-content").niceScroll({
                autohidemode: true,
                cursorborder: "none",
                cursorwidth: 8,
                cursorminheight: 55,
                cursorcolor: "#6c6c6c",
                zindex: 99
            });
        }

        if ( $( "#listContainer" ).length > 0 )
        {
            //if ( !$.browser.safari )
            //{
                addListContainerScroll();
            //}
        }
    }

    function addListContainerScroll()
    {
        $( "#listContainer" ).niceScroll( "#messageList", {
            autohidemode: true,
            cursorborder: "none",
            cursorwidth: 8,
            cursorminheight: 55,
            cursorcolor: "#6c6c6c",
            zindex: 99,
            scrollspeed: 30,
            mousescrollstep: 15
        } );

    }
 
// Function to create mailbox list dropdown
    jQuery.fn.toggleNext = function ()
    {
        if ( $( this ).hasClass( 'open' ) )
        {
            $( this ).addClass( 'toBeProcessClose' );
        }
        else
        {
            $( this ).addClass( 'toBeProcessOpen' );
        }
        $( '#mailbox-list > li > div' ).removeClass( 'open' ).next().stop().slideUp( 'fast' );
        if ( $( this ).hasClass( 'toBeProcessClose' ) )
        {
            $( this ).removeClass( 'open' ).next().stop().slideUp( 'fast' );
        }
        else if ( $( this ).hasClass( 'toBeProcessOpen' ) )
        {
            $( this ).addClass( 'open' ).next().stop().slideDown( 'fast' );
        }
        $( '#mailbox-list > li > div' ).removeClass( 'toBeProcessOpen' ).removeClass( 'toBeProcessClose' );
    };
    $( '#mailbox-list > li > div' ).click( function ()
    {
        $( this ).toggleNext();
    } );
    // Function to set dynamic height on each column on browser resize
    $( window ).resize( function ()
    {
        viewportChange();
    } );
    viewportChange();

    // Function to create resiable column, it does not work with IE7 so IE7 will be excluded.
    // Exclude IE7
    var ie7 = ( document.all && !window.opera && window.XMLHttpRequest && typeof window.external.AddToFavoritesBar == 'undefined' ) ? true : false;
    if ( !ie7 )
    {
        $( "#mailbox" ).resizable( {
            maxWidth: 350,
            minWidth: 180,
            handles: 'e',
            start: function ( event, ui )
            {
                removeScroll();
            },
            stop: function ( event, ui )
            {
                addScroll();
            }
        } );
        $( "#message-list-wrap" ).resizable( {
            maxWidth: 500,
            minWidth: 360,
            handles: 'e',
            start: function ( event, ui )
            {
                removeScroll();
            },
            stop: function ( event, ui )
            {
                addScroll();
            }
        } );
        // alert("test");
    }

    // Custom scrollbar
    addScroll();

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

} );