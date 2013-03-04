/// <reference path="jquery-1.7.1.intellisense.js" />
/// <reference path="messageDetails.js" />
// ============================================================================
//          %name: message.list.js %
//       %version: 22 %
//      Copyright: Copyright 2012-2013 BAE Systems Australia
//                 All rights reserved.
// ============================================================================

var LoadReverse = false; //flag for direction of loading
var LstObj = null;
var safariWait = false;//flag to stop reload cause by safari event firing order
var scrollWheelWait = false;//flag to turn off reload by scrollwheel
var keystrokeWait = false; //flag to turn off reload by keystroke
var pageIndexLoading = -1;//pageIndex that is currently loading..used to control multiple calls to server for the same page
var loadrequired = false;
var stopWait = false;

//globals for storing current info
var gSortField = "ReceivedTime"; //sort by datetime
var gSortDir = 1; // descending
var gOffset = 0;
var gRecordID = -1;
var gBlockload = 0;

// The following two globals and functions that follow are to allow the infinite list to be used with 
// different data sources.  These are the ajax functions that are called to retrieve message or messages
// for a list.  They are defaulted to the functions for the MWC Inbox, but the functions allow different
// callbacks to be registered.
var getMessagesCall = "GetMessages";
var loadListCall = "LoadListFromFolder";
function SetGetMessagesCall(newCall) {
    getMessagesCall = newCall;
}
function SetLoadListCall(newCall) {
    loadListCall = newCall;
}
// The following two globals and functions allow the infinite list to be used with different data sources 
// that don't need a mark as read call
var gRequiresMarkAsRead = true;
var markAsReadCall = "/Message/UpdateReadDT";
function SetRequiresMarkAsRead(flag) {
    gRequiresMarkAsRead = flag;
}
function SetMarkAsRead(newCall) {
    markAsReadCall = newCall;
}






// This function escapes any special jquery characters from an id
function escapeSpecialCharactersInId(theId) {
    return theId.replace(/(:|\.)/g, '\\$1');
}

// This function selects a div based on the message ID
function SelectMessage(theId)
{
    var escaptedId = escapeSpecialCharactersInId(theId);
    var record = $("#msg_" + escaptedId);
    return record;
}


// This method removes the passed in IDs from the list of messages
// It is intended to be called from page specific javascript code
// for example when a message is discarded.
function RemoveFromMessageList(recordIdsToRemove) {
    // To be implemented by David
    alert(recordIdsToRemove);
}

//global selected record ID array
var gSelectedRecords = [];
var gLastSelected = null;
var gLastIsShift = false;
/*
    Object to maintain metadata about the infinite list.
*/
function ListPosition( listcount, pagesize, listheight, pagecount, recordheight )
{
    this.ListCount = listcount; //total of records that can be loaded for this list
    this.PageSize = pagesize; //number of records in a page
    this.ListHeight = listheight; //actual height of fully loaded list
    this.Pagecount = pagecount; //number of pages that could be loaded
    this.RecordHeight = recordheight;
    this.Groups = []; //  [groupname, full= 0/1, display='block'/'none', recordcount]  -- WILL BE USED IN FUTURE CODE
    this.Wait = false; // scroll ajax loading flag
    this.CurrentList = 1; //id of list being loaded
    this.Currentpage = 0; //the current page for ajax loading
    this.InCallback = false; //flag for callback process occurring      
    this.CurrentObj = null; // object to be selected after delay process on keydown
    this.ChosenObj = null; //carrier object for list container event handling
    this.ListCont = $( "#listContainer" ); //cached container object
    this.MessageList = $("#messageList");
    this.lastPos = 0; //controls page loading when scrolling towards source end of list
    this.onScroll = onScroll;
    this.onScrollStart = onScrollStart;
    this.onScrollStop = onScrollStop;
    this.scrollCheck = scrollCheck; //function for handling scroll event
    this.keyCheck = keyCheck;
    this.tidyContainers = tidyContainers; //function to maintain block records during scroll
    this.removeOuterContainer = removeOuterContainer; //function to empty or load container during scroll
    this.removeContainer = removeContainer;
    this.getScrollTop = getScrollTop;
    this.doStop = doStop;
    this.blockLoaded = blockLoaded; //checks this.IndexString to see if block index is currently loaded 
    this.scrollDirection = "";
    this.IndexString = "|"; //string to store delimted list of loaded block offset indexes
    this.boxName = "inbox";
    var loadNeeded = false;
    var scrollStartVal = 0; 
    
    /*
    detect if offset is in stored loaded index string and return true if it is
    */
    function blockLoaded( offset )
    {
        if (this.IndexString.indexOf( "|" + offset + "|" ) == -1 )
        {
            return false;
        }
        return true;
    }

    /*
    this.ListCont.scrollTop() sometimes returns 0 for safari.
    This function tries to return correct value
    */

    function getScrollTop()
    {
        var rtn = 0;
        if ( $.browser.safari )
        {
            if ( LstObj.ListCont[0].scrollTop == 0 )
            {
                rtn =  $(LstObj.ListCont).scrollTop();
            }
            else
            {
                rtn = LstObj.ListCont[0].scrollTop;
            }
        }
        else
        {
            rtn =  $(LstObj.ListCont).scrollTop();
        }
        return rtn;
    }

/*
    controls scroll action on scroll event
    */
    function onScroll(event)
    {
        var scr = getScrollTop();
        if ( scr < this.lastPos )
        {
            this.scrollDirection = "up";
        }
        else
        {
            this.scrollDirection = "down";
        }
        this.lastPos = scr;

        if ( this.Wait || safariWait )
        {
            safariWait = false;
            return true;
        }
        if ( LoadReverse && LstObj.Pagecount <= 5 )
        {
            var h = parseInt( LstObj.MessageList.css( "height" ) ) - LstObj.RecordHeight * $( ".msg" ).length;
            $( "#spacer" ).css( "height", h ); //set height of spacer to offset * pagesize * recordHeight
        }
 
        scrollCheck( this.ListCont ); //check to see if new pages need to be loaded
    }

    /*
    scroll start event handler: sets initial position
    */
    function onScrollStart( event )
    {       
        scrollStartVal = getScrollTop();
    }

    /*
    scrollstop event handler determines if new pages of data need to be loaded at the new scroll position gOffset
    */
    function onScrollStop( event )
    {
        var scr = getScrollTop(); //get present position
        var containerfirst = $( "#messageList .offsetCont:first" ); //get first page container
        var containerlast = $( "#messageList .offsetCont:last" ); //get last page container
        if ( this.ListCount > 100 ) //only do this if there are more than 100 records
        {
            if ( containerfirst.length == 0 || ( containerlast.length > 0 && containerlast[0].offsetTop + containerlast[0].offsetHeight < scr ) || ( containerfirst.length > 0 && containerfirst[0].offsetTop > scr + 10 ) )
            {
                loadrequired = true; //set flag for load at new position 
                doStop( scr );//do stop process to reload close pages
            }
        }
        if ( loadrequired == false )
        {
            scrollWheelWait = false;
            scrollCheck( this.ListCont );
        }
    }

    /*
      clears message list and loads a new set of 5 pages around the new scroll point
       */
    function doStop( scr )
    {
        if ( loadrequired == false ) //check to see if this process is already occurring
        {
            return true;
        }
        loadrequired = false;
        //work out position in page index
        var scrollPageOffset = Math.floor(( ( scr ) / LstObj.ListHeight ) * ( LstObj.Pagecount ) );
        //offset backwards to surround current scroll point with records
        if ( scrollPageOffset > 1 ) 
        {
            scrollPageOffset -= 2;
        }
        else
        {
            scrollPageOffset = 0;
        }
        gBlockload = 5; //set flag for multiple loads in sequence
        $( "#messageList" ).html( "" ); //wipe all records
        LstObj.IndexString = "|";//reset block loaded string
        //ensure that loads start at least five pages before end of list
        if ( LstObj.Pagecount - 5 < parseInt( scrollPageOffset ) ) 
        {
            scrollPageOffset = LstObj.Pagecount - 5;
        }
        //load first page in sequence (others loaded when triggered by sequence in  insertPage function
        loadPage( scrollPageOffset, 0 ); 
         
        scrollStartVal = getScrollTop(); 
    }

    /*
    determine from the new and old scroll position  if the next or previous 
    page of data needs to be loaded to maintain the list.
    Also called from keystroke handler --- keyevent then passed in
    \
     listCont: passed in listcontainer div
    */
    function scrollCheck( listCont, keyevent )
    {
        var dir;
        var obj;
        var delta = 2000; //default delta for scroll comparison (also used for up/down keystroke)
        if ( keyevent ) //a keystroke has occurred
        {
            switch ( keyevent.keyCode )
            {
                case 38://up
                    dir = "up";
                    obj = $( "#messageList .message:first" ); //get first record loaded
                    break;
                case 33://page up    
                    dir = "up";
                    delta = 3000; //increase delta
                    obj = $( "#messageList .message:first" ); //get first record loaded
                    break;
                case 40://down   
                    dir = "down";
                    obj = $( "#messageList .message:last" ); //get last record loaded
                    break;
                case 34://page down  
                    dir = "down";
                    delta = 3000;
                    obj = $( "#messageList .message:last" ); //get last record loaded
                    break;
                default:
            }
        }
        else
        {
            if ( LstObj.scrollDirection != "" )
            {
                if ( LstObj.scrollDirection == "down" )
                {
                    obj = $( "#messageList .message:last" ); //get last record loaded
                    dir = "down";
                }
                else
                {
                    obj = $( "#messageList .message:first" ); //get first record loaded
                    dir = "up";
                }
                LstObj.scrollDirection = "";
            }
            else
            {
                var scr = getScrollTop();
                //determine direction of scroll
                if ( scrollStartVal <= scr ) //use dom object because .scrollTop() doersn't work in safari
                {
                    obj = $("#messageList .message:last"); //get last record loaded
                    dir = "down";
                } else
                {
                    obj = $("#messageList .message:first"); //get first record loaded
                    dir = "up";
                }
            }
        }
       
        if ( obj.length === 0 ) //catch error
        {
            doStop();
            return;
        }

        var offset;
        offset = obj.parent().attr( "data-off" ) / LstObj.PageSize; //get page offset
        var scr = getScrollTop();
        if ( dir == "up" )
        {
            if ( scr - obj[0].offsetTop < delta ) //if inside loading zone
            {
                if ( offset > 0 )//don't load first page
                {
                
                        if ( !LstObj.blockLoaded( offset - 1 ) )//check for page loaded
                        {
                            loadPage(offset - 1, -1); //call ajax load of page of data
                        }
                 
                }
            }
        }
        else
        {
            //     ( top of container    minus                   ( bottom of list viewport) )   <   delta
            if ( obj[0].offsetTop - ( scr + listCont.height() ) < delta ) //if inside loading zone
            {
                
                if ( !LstObj.blockLoaded( parseInt( offset ) + 1 ) && LstObj.Pagecount >  parseInt( offset ) + 1 )
                    {
                        loadPage( parseInt( offset ) + 1, 1 );
                    }
              
            }
        }
       
    }

    /*
    call scrollCheck and pass in keystroke event
    */
    function keyCheck( event )
    {
        scrollCheck( LstObj.ListCont, event );
    }

    /*
     private: cycle through all loaded blocks and empty or fill them if required
    */
    function tidyContainers()
    {
        var scrolltop = getScrollTop();

        var list = $( "#messageList .offsetCont" ); //reload to ensure new records loaded get toggled
        if ( list.length > 3 )
        {
            list.each( function ()
            {
                removeOuterContainer( $( this ), scrolltop );
            } );
        }
    }

    /*
       private:  determine whether block container should be removed and take action
       20 * 85 pixels is 1700pixels....3100 pixels is close to two blocks
        this gives reasonable buffer for pageing keystrokes...works for present tested resolutions
    */
    // --cont: passed in  message block container div
    function removeOuterContainer( cont, scrolltop )
    {
        // get start and end offsets of block container div
        var start = cont[0].offsetTop;
        var end = start + cont[0].offsetHeight;
        if ( start < scrolltop && end < scrolltop )
        { //---------------------------------------------------------------------------------------------------- ABOVE "LIVE" ZONE
            if ( scrolltop - end > 3100 ) //is outside "live" zone
            {
                removeContainer( cont, true );
            }
        }
        else if ( start > scrolltop && end > scrolltop )
        {//---------------------------------------------------------------------------------------------------- BELOW "LIVE" ZONE
            if (scrolltop>3000 &&  start - scrolltop > 3100 )  //    is outside "live" zone
            {
                removeContainer( cont, false );
            }
        }
    }

    /*
      private:   remove records from container
      -cont: passed in  message container div
      resizeContainer; boolean ...to resize or not to resize, that is the question
    */
    function removeContainer( cont, resizeContainer )
    {
        var doff = cont.attr( "data-off" ) / LstObj.PageSize;//get data offset attribute
        if ( doff !=null )
        {
            //remove offsetIndex from IndexString
            LstObj.IndexString = LstObj.IndexString.replace( "|" + doff + "|", "|" );
        }
        if ( resizeContainer )
        {
            //remove it after changing of spacer height
            var height = cont.height();
            var spHt = $( "#spacer" ).css( "height" ); //get height
            $( "#spacer" ).css( "height", parseInt( spHt, 10 ) + height ); //set to height
        }
        cont.remove(); //empty container         
    }
} // end of ListPosition object

/*
   Assign scroll event handler and message click handlers for first set of messages.
   Assign key handler to listContainer div to catch message key events after mouse drag scroll
*/
$( document ).ready(
    function ()
    {
        LstObj = new ListPosition( $( "#msgcount" ).val(), $( "#recordsinpage" ).val(), $( "#listheight" ).val(), $( "#pagecount" ).val(), $("#recordheight").val() );
        LstObj.ListCont = $( "#listContainer" );   
        LstObj.IndexString = "|0|";
        LstObj.ListCont.scroll( function ( event )
        {
            LstObj.onScroll(event);
        } );

        LstObj.ListCont.bind( 'scrollstart', function ( e )
        {
            LstObj.onScrollStart( e );
        } );

        LstObj.ListCont.bind( 'scrollstop', function ( e )
        {
            LstObj.onScrollStop( e );
        } );

        LstObj.ListCont.keydown( function ( event )
        {
            if ( LstObj.ChosenObj )
            {
                keyHandler(event, LstObj.ChosenObj  );
            }
        } ); 
     
        // mouse scrollwheel scroll event
        if ( $.browser.mozilla )//Firefox
        {
            LstObj.ListCont.bind( 'DOMMouseScroll', function ( e )
            {
                if ( e.originalEvent.detail > 0 )
                {//scroll down
                    LstObj.scrollDirection = "down";
                }
                else
                { //scroll up
                    LstObj.scrollDirection = "up";
                }
                scrollWheelWait = true;
                LstObj.scrollCheck( LstObj.ListCont );
                
            } );
        }
        else//IE, Opera, Safari
        {
            LstObj.ListCont.bind( 'mousewheel', function ( e )
            {
                if ( e.originalEvent.wheelDelta < 0 )
                {//scroll down
                    LstObj.scrollDirection = "down";
                } else
                { //scroll up
                    LstObj.scrollDirection = "up";
                }
                scrollWheelWait = true;
                LstObj.scrollCheck( LstObj.ListCont );
            } );

        }
        storeState( 0, $("#folderids").val() );
        assignMsgEvnts();// assign   events to all message divs
        selectRecord( $( "#messageList .message:first" ) );//load first message into detail view    
        var firstcont = $( "#messageList .offsetCont" );
        firstcont.attr( "data-off", 0 ); //set offset attribute for first container
        firstcont.attr( "id", "offset0" );
        
        if ( LstObj.ListCount <= 20 )
        {
            removeLoader(true);

            LstObj.ListHeight = firstcont[0].offsetHeight;
            $( '#messageList' ).css( 'height', firstcont[0].offsetHeight );
        }
        else
        {
            removeLoader( false );
            gBlockload = 3; //set flag for multiple loads in sequence
            loadPage( 1, 1 );
        }

    } );

/*
show or hide the ajax loader image on back of list
*/
function removeLoader(remove)
{
    if ( remove )
    {
        LstObj.ListCont.css( 'background-image', 'none' );
    }
    else
    {
        LstObj.ListCont.css( 'background-image', 'url(../images/loading.gif)' );
    }
}

/*
    assign   events to all message divs
    using delegate event assignment on container #messageList, because that way 
    we don't have to assign to EACH message div.
    Events bubble up to container
*/
function assignMsgEvnts()
{
    //assign this onclick function to the messageList div . 
    //Filter: ".message" only accept events from divs with class="message"   
    LstObj.MessageList.on( "click", ".message", function (e)
    {
        doClick( $( this ) , e);
    } );
    //assign this ondoubleclick function to edit record from list    
    LstObj.MessageList.on( "dblclick", ".message", function ( e )
    {
        if ( LstObj.boxName == "draft" )
        {
            openWindow($(this).attr("data-url").replace("Message/Details", "UpdateMessage/Init").substr(1), "MessageEditor");
        }
        else
        {
            openWindow( $( this ).attr( "data-url" ).substr( 1 )+"&view=true", "MessageViewer" );
        }
    } );

    //assign this on  keydown function to the messageList div .    
    LstObj.MessageList.on( "keydown", ".message", function ( event )
    {
        keyHandler(event, $( this ) );
        event.preventDefault(); //stop default event from occurring
        return false;
    });
}

//write page offset and list name to global variables for sorting process hookup
function storeState( offset, list )
{
    LstObj.CurrentList = list;    
    gOffset = offset;
}

//calls the PrintController to generate a pdf (doesn't actually change page location )
//gRecordID is populated when the detail view of a message is generated
function printMessage()
{
    if ( $.browser.safari )
    {
        document.location = "/print/PrintMessage?printMessageId=" + gRecordID;
    }
    else
    {
        document.location.href("/print/PrintMessage?printMessageId=" + gRecordID);
    }
    return false;
}

// event handler for clicking discard
function promptDiscardMessages()
{
    // This is defined in message.list.js
    if (gSelectedRecords.length == 0)
    {
        alert(getResource('message','MultiSelectNone'));
    } else
    {
        var title = getResource('message','MsgDiscardDialogTitle');
        $("#dialog-confirm-discard").dialog({
            title: title,
            resizable: false,
            modal: true,
            open: function ()
            {
                $(this).siblings('.ui-dialog-buttonpane').find('button:eq(1)').focus();
            },
            buttons: {
                "Discard": function ()
                {
                    discardInboxMessages();
                    $(this).dialog("close");
                },
                Cancel: function ()
                {
                    $(this).dialog("close");
                }
            }
        });
    }
}

// Make a request to the server to perform the actual discard.
function discardInboxMessages()
{    
    var offsetTop = $("#msg_" + gSelectedRecords[0])[0].offsetTop;//get offset of first discarded record
    var ids = gSelectedRecords.join(',');
    var url = "/Message/DiscardMessageInstances?msgInstanceIds=" + ids;
    $.get(url, null, function(data)
    {
        $.ajax({
            url: "/Message/MessageFolders", datatype: 'html', cache: false, success: function (data)
            {
                // Update DOM with new message folders details.
                $('#mailbox').replaceWith(data);
                // Re-apply folder functionality.
                reinstateMailboxAbilities();
            }
        });
        // Clear selected messages.
        gSelectedRecords.length = 0;
       
        //reload message list where it is
        loadrequired = true;//set flag to reload list
        LstObj.doStop( offsetTop );//load pages around current position

        LstObj.ListCont.scrollTop(offsetTop); //find previous position  
    });
}

// Reinstates the mailbox abilities after a refresh of the pane.
function reinstateMailboxAbilities()
{
    applyMailboxFolderToggleAbility();
    var ie7 = (document.all && !window.opera && window.XMLHttpRequest && typeof window.external.AddToFavoritesBar == 'undefined') ? true : false;
    if (!ie7)
    {
        applyMailboxResizeAbility();
    }
}
 
/*open window without toolbars and sized to 1000 x 760
url: url to open in the new iwndow
title: Text to assign to the title of the window
*/
function openWindow( url, title )
{
    window.open( url, title, "menubar=0,toolbar=0,status=0,resizable=1,width=1000,height=760" );
}

/*
do ajax call to server for next page of messages to be inserted into the list
"GetMessages" is the name of the custom route defined in the App_Start/Routeconfig.cs file
--offset: page index to load
-- positionIndex: where to load the new page of data :
                0 ---at new scroll position
                -1 ---one page before new scroll position
                +1 ---one page after new scroll position
-- select:  boolean whther to select a record in this page
*/
function loadPage( offset, positionIndex, select )
{
    if ( pageIndexLoading == offset ) //page is already being loaded..don't proceed
    {
        return;
    }
    pageIndexLoading = offset;
    var reverse = "0";
    if ( offset == 0 ) //if reloading first page after drag, reset LoadReverse => normal operation
    {
        LoadReverse = false;
    }
    if ( LoadReverse ) //loading initial pages from bottom up
    {
        reverse = "1";
    }
    LstObj.InCallback = true; //set flag
 
    storeState( offset, LstObj.CurrentList );
    // do ajax call for next page
    // url: "GetMessages/{pageId}/{listId}/{sortBy}/{descending}/{reverse}",

    // MVC doesn't like getting an empty parameter (i.e. ..../xxxx//yyy/....) so we are doing this to pass a space if the list is empty
    var listToPass = (LstObj.CurrentList != "") ? LstObj.CurrentList : " ";
    
    $.get("/" + getMessagesCall + "/" + offset + "/" + listToPass + "/" + gSortField + "/" + gSortDir + "/" + reverse, function (data)
    {
        var rtns = data.split( "--*--" ); // get current header from data        
        var html = rtns[2]; //actual data
        var countrec = rtns[3]; //count of records to be inserted
        if ( isValidObject(html) &&  html !== '' )
        {
            insertPage( html, countrec, offset, positionIndex, select ); //new page            
        }
        LstObj.InCallback = false; //unset flag
        
    } );
}

/*
--determine position to insert new records
--insert retrieved html for messages into the list in a container with offset information added
--resize the spacer div if necessary to maintain position of records in list
-- if requires, select the third record from the top of the visible records

html: data to be inserted
countrec: number of records inserted
offset: page index of data
positionIndex: where to load the new page of data :
                0 ---at new scroll position
                -1 ---one page before new scroll position
                +1 ---one page after new scroll position
select:  boolean whther to select a record in this page
*/
function insertPage( html, countrec, offset, positionIndex, select )
{
    if(LstObj.blockLoaded(offset))
    {
        return;
    }
    LstObj.Wait = true; //set scroll block flag
    if ( offset == 0 )
    {
        $( "#spacer", "#messageList" ).remove();
        //store offset index in  LstObj.IndexString
        LstObj.IndexString += offset + "|";
        LstObj.MessageList.prepend( "<div  id='offset0'  class='offsetCont' data-off='"
                + offset * LstObj.PageSize + "'>" + html + "</div>" );//add html it to beginning of  messagelist    
  
        if ( $( "#messageList .msg:first" ) ) //do a check for correct record height after first page of records is loaded
        {
            LstObj.RecordHeight = $( "#messageList .msg:first" )[0].offsetHeight;
            $("#messageList").css("height", ((LstObj.RecordHeight * LstObj.ListCount)+20) + "px");
        }
    }
    else
    {
        var spacer = $( "#spacer", "#messageList" );
        if (  spacer.length === 0 )
        {
            LstObj.MessageList.prepend( "<div  id='spacer'></div>" );
            spacer = $( "#spacer", "#messageList" );
        }
        if ( positionIndex == 0 )// at new scroll position
        {
            //store offset index in  LstObj.IndexString
            LstObj.IndexString += offset + "|";
            spacer.css( "height", offset * LstObj.PageSize * LstObj.RecordHeight ); //set height of spacer to offset * pagesize * recordHeight
            spacer.after( "<div id='offset" + offset + "'  class='offsetCont' data-off='"
                    + offset * LstObj.PageSize + "'>" + html + "</div>" );//add html it to end of  message block containers     
           
        }
        if ( positionIndex == -1 ) //one page before new scroll position
        {
            //store offset index in  LstObj.IndexString
            LstObj.IndexString += offset + "|";
            var h = spacer.css( "height" );
            spacer.after( "<div id='offset" + offset + "' class='offsetCont' data-off='"
                        + offset * LstObj.PageSize + "'>" + html + "</div>" );//add html it to end of  message block containers    
            $( "#spacer" ).css( "height", parseInt( h, 10 ) - $( "#offset" + offset ).height() ); //set height of spacer to offset * pagesize * recordHeight
        }
        if ( positionIndex == 1 ) //one page after
        {
            //try to get the last container of messages---seems to be inherently difficult for jquery to do this after a recent insertion
            // so we have multiple tries...works most of the time
            var x = 1;
            var cont = $( "#messageList .offsetCont:last" );
            while ( cont.length === 0 && x < 10 )
            {
                cont = $( "#messageList .offsetCont:last" );
                x++;
            }
            if ( cont.length > 0 )//found it so add new data
            {
                //store offset index in  LstObj.IndexString
                LstObj.IndexString += offset + "|";
                cont.after( "<div id='offset" + offset + "'  class='offsetCont' data-off='"
                        + offset * LstObj.PageSize + "'>" + html + "</div>" );//add html it to end of  message block containers   
            }
            else //still cn't find it so try to find it by id
            {
                cont = $( "#offset" + ( offset - 1 ), "#messageList" );
                if ( cont.length > 0 ) //found it so add data
                {
                    //store offset index in  LstObj.IndexString
                    LstObj.IndexString += offset + "|";
                    cont.after( "<div id='offset" + offset + "'  class='offsetCont' data-off='"
                        + offset * LstObj.PageSize + "'>" + html + "</div>" );//add html it to end of  message block containers   
                }
            }
            if ( select )
            {
                //this is called on a separate thread using setTimeout so that is doesn't interfere with record loading
                setTimeout( function () { selectRec( offset ); }, 100 );
            }
            if ( offset == LstObj.Pagecount-1 )//last page laoded so resize list to fit
            {
                var lastMessage = $( "#messageList .msg:last" );
                $( "#messageList" ).css( "height", ( lastMessage[0].offsetTop + parseInt(LstObj.RecordHeight) ) ); //set list height to offsetTop of lat record plus recordHeight.
            }
        }
        if ( gBlockload == 0 )
        {
            LstObj.tidyContainers();//is normal load so tidy up
            $( "#listContainer" ).getNiceScroll().resize();
            stopWait = false;
       
        } else
        {
            loadPage(offset + 1, 1, select);//load next page in sequence
            gBlockload -= 1; //reduce by one
        }
        
    }
    LstObj.Wait = false;//unset scroll block flag   
}

/*
cycle through loaded records and select third visible record from top
*/
function selectRec( offset )
{
    var selobj = $( " .message:last", $( "#messageList .offsetCont:first" ) );
    var list = $( "#messageList .message" ); //reload to ensure new records loaded get toggled
    var count = 0;
    list.each( function ()
    {
        if ( isScrolledIntoView( $( this ) ) )
        {
            if ( offset == 1 )//is return to beginning of list so select first record
            {
                selectRecord( $( this ) ); //load last message of first added container into detail view     
                return false;
            }
            count++;
            if ( count > 2 )
            {
                selectRecord( $( this ) ); //load last message of first added container into detail view     
                return false;
            }
        }
    } );

}


/*
    Load the message list with new set of messages on click of folder tree node

    @param {list} List id
    @param {reloadfrombottom} True to indicate to load from the bottom, false otherwise.
    @param {selectFirst} True to indicate that the first message should be selected, false otherwise. Default is true.
     @param {folderid} Id of folder to be set as selected
*/
function loadList( list, reloadfrombottom, selectFirst , folderid, boxName)
{
    if ( folderid )//if folder id passed in, set selected on the folder object and remove it from all others in folder list
    {
        $( "#mailbox ul#mailbox-list li ul li, #mailbox ul#mailbox-list li" ).removeClass( "selected" );
        $( "#" + folderid ).addClass( "selected" );
    }
    if(boxName)
    {
        LstObj.boxName = boxName.toLowerCase();
    }
    var selectBeginning = true;
    if (isValidObject (selectFirst))
    {
        selectBeginning = selectFirst;
    }
    if ( !isValidObject( reloadfrombottom ) ) //is a reload from the top
    {
        LoadReverse = false; //unset reverse flag
    }
    LstObj.CurrentList = list;
    var reverse = "0";
    if ( LoadReverse ) //loading inititial pages from bottom up
    {
        reverse = "1";
    }
    pageIndexLoading = 0;//reset variable
    // ---- do ajax call for reload of lists
    //  url: "LoadListFromFolder/{listId}/{reverse}/{sortBy}/{descending}",

    $.ajax({
        url: "/" + loadListCall + "/" + list + "/" + reverse + "/" + gSortField + "/" + gSortDir, cache: false, success: function (data)
        {
            if (data !== '') //there is data
            {
                $("#listContainer").getNiceScroll().remove();
                LstObj.ListCont.html(data); //load new set of messages into list    
                addListContainerScroll();//function is in initialise.js
                LstObj.MessageList = $("#messageList");
                LstObj.MessageList.css("height", LstObj.ListHeight + "px");
                //set message click handlers
                assignMsgEvnts();
            }
            var firstcont;
            LstObj.Wait = true;
            LstObj.InCallback = false;

            if (LoadReverse) //loading initial pages from bottom up
            {
                var pageIndex = $("#hdnPageIndex").val();
                if (LstObj.Pagecount <= 2)
                {
                    $("#spacer", "#messageList").remove();
                }
                else if (LstObj.Pagecount <= 5)
                {
                    var h = parseInt(LstObj.MessageList.css("height")) - LstObj.RecordHeight * $(".msg").length;
                    $("#spacer").css("height", h); //set height of spacer to offset * pagesize * recordHeight
                }
                storeState(pageIndex, list);
                if (pageIndex == LstObj.Pagecount - 2) //two pages loaded
                {
                    LstObj.IndexString = '|' + pageIndex + "|" + (parseInt(pageIndex) + 1) + "|";
                    firstcont = $("#messageList .offsetCont");
                    firstcont.attr("data-off", parseInt(pageIndex) * LstObj.PageSize);
                    firstcont.attr("id", "offset" + pageIndex);

                }
                else
                {
                    LstObj.IndexString = "|" + (parseInt(pageIndex) + 1) + "|";
                    firstcont = $("#messageList .offsetCont");
                    firstcont.attr("data-off", (parseInt(pageIndex) - 1) * LstObj.PageSize);
                    firstcont.attr("id", "offset" + (parseInt(pageIndex) - 1));

                }

                selectRecord($("#messageList .message:last"));
            }
            else //loading from top down
            {
                storeState(0, list);
                LstObj.IndexString = "|0|";
                LstObj.ListCont.scrollTop(0); //scroll back to top of list   
                firstcont = $("#messageList .offsetCont"); //get first block container
                firstcont.attr("data-off", 0);//set data offset of first block 
                firstcont.attr("id", "offset0");
                if (selectBeginning === true)
                {
                    selectRecord($("#messageList .message:first"));//load first message into detail view
                }
                else
                {
                    // Blank out contents of message details pane.
                    messageDetails.populateHtml('');
                }

                if ($("#messageList .msg").length < LstObj.PageSize)
                {
                    removeLoader(true);
                }
                else
                {
                    removeLoader(false);
                }
                gBlockload = 3; //set flag for multiple loads in sequence
                loadPage(1, 1, selectBeginning);//load further three pages
            }
            $("#listContainer").getNiceScroll().resize();
            LstObj.Wait = false;

        }
    });
}

/*
    calculate height of spacer to keep records in position
*/
function getOffset()
{
    var offset = 0;
    var list = $( ".offsetCont" );
    //cycle through record block containers to calculate total height
    list.each( function ()
    {
        offset += parseInt( $( this ).css( "height" ), 10 );
    } );
    return LstObj.ListHeight - offset;
}



/*
test for valid object
*/
function isValidObject( obj )
{
    if ( typeof obj === 'undefined' )
    {
        return false;
    }
    if ( obj === null )
    {
        return false;
    }
    return true;
}


var keywait = false;
/*
   handle the keydown event on the message list
   obj: message div
*/
var pageWait = false; //flag to delay pagedown call
function keyHandler(event, obj  )
{
    if ( isValidObject( LstObj.CurrentObj ) )
    {
        obj = LstObj.CurrentObj; //object exists so we are in the middle of a multiple keystroke sequence
    }
    if ( obj === null )
    {
        return true;
    }
    var pageObj;
   
    switch ( event.keyCode )
    {
        case 40://down
            if ( keywait )
            {
                return false;
            }
            LstObj.keyCheck( event );//check for needed page loading
            obj = getNextNode( obj, "down" );
            if ( isValidObject( obj ) )
            {
                LstObj.CurrentObj = obj;
            } else
            {
                return false;
            }
            keystrokeWait = true;//turn off drag reload
            moveToItem( LstObj.CurrentObj, "down", event );
            delaySelect( 300 );
            keywait = true;
            setTimeout( function () { keywait = false; }, 100 );
            break;
        case 38://up
            if ( keywait )
            {
                return false;
            }
            LstObj.keyCheck( event );//check for needed page loading
            obj = getNextNode( obj, "up" );
            if ( isValidObject( obj ) )
            {
                LstObj.CurrentObj = obj;
            } else
            {
                return false;
            }
            keystrokeWait = true;//turn off drag reload
            moveToItem( LstObj.CurrentObj, "up", event );
            delaySelect( 300 );
            keywait = true;
            setTimeout( function () { keywait = false; }, 100 );
            break;
        case 36: //home
            moveToBeginning();
            break;
        case 35: //end
            moveToEnd();
            break;
        case 33: //page up
            if ( pageWait )
            {
                return false;
            }
            keystrokeWait = true;//turn off drag reload
            LstObj.keyCheck( event );//check for needed page loading
            pageObj = doPage( "up", obj, event );
            if ( $.browser.safari )
            {//position record at top of viewport
                LstObj.ListCont.scrollTop( pageObj[0].offsetTop );
            }
            break;
        case 34: //page down
            if ( pageWait )
            {
                return false;
            }
            keystrokeWait = true;//turn off drag reload
            LstObj.keyCheck( event );//check for needed page loading
            var p2 = LstObj.getScrollTop();
            pageObj = doPage( "down", obj, event );
            if ( $.browser.safari )
            {//position record at bottom of viewport
                LstObj.ListCont.scrollTop( pageObj[0].offsetTop - LstObj.ListCont[0].offsetHeight + pageObj[0].offsetHeight );
            }
            break;
        case 13:

            break;
        default:
    }
    return false;
}

 

/*
Logic to return valid node or null if limit reached
 obj: message div
*/
function getNextNode( obj, dir )
{
    if ( obj === null || obj.length >1)
    {
        return null;
    }
    if ( dir === "down" )
    {
        var nextDiv = obj.next();
        if ( nextDiv.length === 0 ) //doesn't exist so need to get first child of next container
        {
            nextDiv = getnextDiv( obj );
        }
        else if ( nextDiv.is( "script" ) )
        {
            obj = nextDiv;//select script
            nextDiv = obj.next(); //what comes after script?
            if ( nextDiv.length === 0 ) //doesn't exist so need to get first child of next container
            {
                nextDiv = getnextDiv( obj );
            }
        }
        if ( nextDiv.hasClass( "listGroupheader" ) ) // is header, so step over
        {
            if ( nextDiv.next().length === 0 )
            {
                return getnextDiv( nextDiv );
            }
            else
            {
                obj = nextDiv;
                var x = 0;
                while ( obj.hasClass( "listGroupheader" ) || obj.css( "display" ) === "none" || obj.is( "script" ) )
                {
                    if ( obj.next().length === 0 )
                    {
                        obj = getnextDiv( obj );
                    }
                    else
                    {
                        obj = obj.next();
                    }
                    x += 1;
                    if ( x > 10 )
                    {
                        break;
                    }
                }
                return obj;
            }
        }
        else
        {
            return nextDiv;
        }
    }
    else
    {
        var prevDiv = obj.prev();
        if ( prevDiv.length === 0 ) //doesn't exist
        {
            prevDiv = getPrevDiv( obj );
        }
        if ( prevDiv.hasClass( "listGroupheader" ) || prevDiv.is( "script" ) ) // is header or script, so step over
        {
            if ( prevDiv.prev().length === 0 )
            {
                prevDiv = getPrevDiv( prevDiv );
            }
            else
            {
                prevDiv = prevDiv.prev();
            }
        }
        if ( prevDiv.hasClass( "listGroupheader" ) || prevDiv.is( "script" ) ) //do twice
        {
            if ( prevDiv.prev().length === 0 )
            {
                prevDiv = getPrevDiv( prevDiv );
            }
            else
            {
                prevDiv = prevDiv.prev();
            }
        }
        if ( prevDiv[0].id === "spacer" ) // don't step onto spacer
        {
            return obj;
        }
        else
        {
            if ( prevDiv.hasClass( "listGroupheader" ) )
            {
                return obj;
            }
            return prevDiv;
        }
    }
}

/*
  step over block container  boundary and return last member of previous block
   obj: message div
*/
function getPrevDiv( obj )
{
    var par = obj.parent();
    if ( par.length > 0 && par.hasClass( "offsetCont" ) && par.prev().length > 0 )
    {// this is the end of a block container and a next container exists
        var child = par.prev().children().last();
        if ( child.length > 0 )//  there is a first child
        {
            return child;
        }
    }
    return obj;
}

/*
  step over block container  boundary and return  first member of  next block
   obj: message div
*/
function getnextDiv( obj )
{
    var par = obj.parent();
    if ( par.length > 0 && par.hasClass( "offsetCont" ) && par.next().length > 0 )
    {// this is the end of a block container and a next container exists
        var child = par.next().children().first();
        if ( child.length > 0 )//  there is a first child
        {
            return child;
        }
    }
    return obj;
}

/*
Detect list first node for paging
 obj: message div
*/
function isFirstRecord( obj )
{
    if ( $( ".msg:first","#messageList" ).attr( "id" ) == obj.attr( "id" ) )
    {
        return true;
    }
    else
    {
        return false;
    }
}

/*
    check for previous block
     obj: message div
*/
function checkPrevBlock( obj )
{
    if ( obj.parent().prev().length === 0 )//previous block doesn't exist
    {
        return true;
    }
    else //previous block exists
    {
        return false;
    }
}

/*
Detect list last node for paging
 obj: message div
*/
function isLastRecord( obj )
{
    if ( obj.next().length === 0 )
    {
        if ( obj.parent().next().length === 0 )
        {
            return true;
        }
    }
    return false;
}


/*
    looping logic for positioning selection on paging from pageup and pagedown keys
    dir: up or down
     obj: message div 
*/
function doPage( dir, obj, e )
{
    var loopcount = 0;
    var found = false;
    var sibling;
    LstObj.Wait = true;
    // loop to find valid next or previous siblings until top or bottom of page is reached
    var x = 0;
    while ( found === false && x < 15)
    {
        x += 1;
        // increment x to limit loop to 15 ...safety measure as events are not predictable
        // determine if next or previous sibling exists...jump out of while loop
        if ( dir === "up" )
        {
            if ( isFirstRecord( obj ) )
            {
                break;
            }
            sibling = getNextNode( obj, "up" );
        }
        else
        {
            if ( isLastRecord( obj ) )
            {
                break;
            }
            sibling = getNextNode( obj, "down" );
        }
        if ( sibling !== null ) //sibling exists check to see if it is the first or last one visible in the page
        {
            if ( isScrolledIntoView( sibling ) )
            {
                obj = sibling;
                loopcount++; //increment loop count
            }
            else
            {
                found = true;
            }
        }
        else
        {
            found = true;
        }
    }
    var lastObj = null;
    var pagesize = Math.floor( parseInt( LstObj.ListCont.height(), 10 ) / LstObj.RecordHeight );
    var isTop = false;
    if ( loopcount === 0 ) //is already at top or bottom of visible items and the page motion is out of the visible frame so need to count further
    {
        if ( dir === "up" )
        {
            for ( var i = 1; i <= pagesize; i++ )  
            {
                if ( isFirstRecord( obj ) )
                {
                    isTop = true;
                    break;
                } else
                {
                    lastObj = obj;
                    obj = getNextNode( obj, "up" );
                    if ( obj === null )//no further record exists
                    {
                        obj = lastObj; //get previous one
                        break;
                    }
                    
                }
            }
        }
        else
        {
            for ( var j = 1; j <= pagesize; j++ )  
            {
                if ( isLastRecord( obj ) )
                {
                    break;
                } else
                {
                    lastObj = obj;
                    obj = getNextNode( obj, "down" );
                    if ( obj === null )//no further record exists
                    {
                        obj = lastObj; //get previous one
                        break;
                    }
                   
                }
            }
        }
    }
    moveToItem( obj, dir, e ); //set new position on this object
    if ( isTop == true )
    {
        LstObj.ListCont.scrollTop( 0 ); // scroll to top of list
    }
    delaySelect( 300 ); //call the delayed select
    LstObj.Wait = false; //reset loading flag
    pageWait = true;
    setTimeout( function() { pageWait = false; }, 300 );
    return obj;
}

/*
 determine whether item is visible in scrolled list
 elem: dom element to test for visibility
*/
function isScrolledIntoView( elem )
{
    var docViewTop = LstObj.getScrollTop();
    var docViewBottom = docViewTop + LstObj.ListCont.height();  //bottom of list
    try
    {
        var elemTop = elem[0].offsetTop; // get top of record
        var elemBottom = elemTop + elem.height(); // get bottom of record
      
        if ( $.browser.mozilla ) //|| $.browser.safari
        {
            var listTop = LstObj.ListCont[0].offsetTop;
            elemTop = elemTop - listTop;
            elemBottom = elemBottom - listTop;
        }
        return ( ( elemBottom <= docViewBottom  ) && ( elemTop >= docViewTop ) ); // determine if block is within limits
    }
    catch ( e )
    {
        return true;
    }
}

/*
   stop default event from occurring on event
*/
function cancelEventDefault( e )
{
    if ( window.event )
    {
        e = window.event;
    }
    e.cancelBubble = true;
    if ( e.preventDefault )
    {
        e.preventDefault();
        e.returnValue = false;
    }
    else
    {
        e.returnValue = false;
    }
}

/*
 Clear reversed order of page loading for scroll up if set and
  clear current list and reload first page of list if list not fully loaded. 
  Select first record
*/
function moveToBeginning()
{
    if ( LstObj.Pagecount == 1 )
    {
        selectRecord( $( "#messageList .message:first" ) );
    }
    else
    {
        LstObj.MessageList.html(""); // clear list contents  
        LstObj.IndexString = "|";
        LstObj.Wait = true; // turn on scroll disabling flag

        if (LoadReverse === true)
        {
            LoadReverse = false; // reset flag
        }
        LstObj.ListCont.scrollTop(0); // scroll to top of list
        loadList(LstObj.CurrentList); // 
    }
}

/*
  clear current list and reload last 2 pages of list.
  Set reversed order of page loading for scroll up.
  Select last record
*/
function moveToEnd()
{
    if ( LstObj.Pagecount == 1 )
    {
        selectRecord( $( "#messageList .message:last" ) );
    }
    else
    {
        LstObj.Wait = true;
        if ($.browser.safari)
        {
            safariWait = true;
        }
        LoadReverse = true; //set reverse load flag
        LstObj.MessageList.html(""); //clear list contents  
        LstObj.IndexString = "|";
        loadList(LstObj.CurrentList, true); //insert last page 
    }
}

var gOperation = "";
/*
  highlight and select an item without firing the click event
  obj: message div
  dir: up or down
*/
function moveToItem( obj, dir, e )
{
    var operation = "";
    if ( e.ctrlKey )
    {
        operation = "ctrl";
        gOperation = "ctrl";
    }
    if ( e.shiftKey )
    {
        operation = "shift";
        gOperation = "shift";
    }
   
    if ( dir && obj.hasClass( "listGroupheader" ) ) //check for header div
    {
        if ( dir === "up" )
        {
            obj = obj.prev( "div" );
        }
        else
        {
            obj = obj.next( "div" );
        }
    }
    LstObj.CurrentObj = obj;//set object to be selected after delay
    //------------------------------ensure that  first group header is shown if it exists--------------------------------------------------
    var smallDistance = 200;//pixels. close enough so that list is within one record of the first record of the list
    if ( dir === "up" && isFirstRecord( obj ) && $( "#listContainer" ).scrollTop() < smallDistance )
    {
        $( "#listContainer" ).scrollTop( 0 ); //scroll to the top of the list
    }
    
    if ( operation == "shift" )
    {
        doShiftProcess( obj );
    }
    else
    {
        if ( AllowPushToSelected() )
        {
            sel(obj, operation,null); //select  
            doPushToSelected( gRecordID ); //add id to array
        }
    }
    var id = obj.attr( "id" ).replace( "msg_", "" );//get id from record id
    gRecordID = id;
    
    LstObj.ChosenObj = obj;
    obj.focus();
}

var gStopSelect = false;// flag to stop selecting in shift multiselect due to max selection reached
function AllowPushToSelected()
{
    if ( gSelectedRecords.length < 30 )
    {
        return true;
    }
    else
    {
        var message = getResource('message', 'MultiSelectTooMany'); //call to JSON object
        alert( message.replace( "NUM", "30" ) );
        gStopSelect = true; //set flag to stop selecting in shift multiselect
        return false;
    }
}

// Mark a selection of items as read
function markRead()
{
    if (gRequiresMarkAsRead)
        {
            // Send the message instance IDs and the bool that says what to set the read DT to
            var ids = gSelectedRecords.join(',');
            $.get(markAsReadCall + "?ids=" + ids + "&markRead=true");
    
            var index;
    
            for (index = 0; index < gSelectedRecords.length; ++index)
            {
                var msgIdTag = "#msg_" + gSelectedRecords[index];
                $(".message-summary", msgIdTag).removeClass("unread");
            }
        }
}

// Mark a selection of items as unread
function markUnread()
{
    if (gRequiresMarkAsRead)
    {
        // Send the message instance IDs and the bool that says what to set the read DT to
        var ids = gSelectedRecords.join(',');
        $.get(markAsReadCall + "?ids=" + ids + "&markRead=false");

        var index;
        for (index = 0; index < gSelectedRecords.length; ++index)
        {
            var msgIdTag = "#msg_" + gSelectedRecords[index];
            $(".message-summary", msgIdTag).addClass("unread");
        }
    }
}

/*
This code calls the ChildList loader after the last keystroke 
up or down is at least delay * milliseconds ago.
*/
var timer;
function delaySelect( delay )
{
    var obj = LstObj.CurrentObj;
    clearTimeout( timer );
    timer = setTimeout( function () { selectRecord( obj, true ); }, delay );
}

/*
    fire the click event of a div and set focus on it
    obj: message div
    delay: call is coming from delay process
*/
var gDelay = false;//flag to indicate select has taken place due to delayed action
function selectRecord( obj, delay )
{
    gDelay = delay==true;
    keystrokeWait = false;
    if ( !isValidObject( obj ) )
    {
        obj = LstObj.CurrentObj;
    }
    if ( obj )
    {
        if ( obj.hasClass( "listGroupheader" ) )//check for header div -step over
        {
            if ( obj.next.length > 0 )
            {
                obj = obj.next( "div" );
            }
        }
        obj.focus();
        obj.click();
        LstObj.CurrentObj = null;
    }
}

/*
   called by the click event--- load the detail view, highlight, select and set focus
*/
function doClick( obj, e )
{
    var leaveSelected=null ;
    var operation = "";
    if ( e.ctrlKey || gOperation == "ctrl" )
    {
        operation = "ctrl";
    }
    if ( e.shiftKey || gOperation =="shift")
    {
        operation = "shift";
        if ( gDelay ==true)
        {
            leaveSelected = true;
            gLastIsShift = true;
        }
    }
    gOperation = "";//reset global controller variable
    obj.focus();
    if ( !gStopSelect ) //check to make sure max records has not been reached
    {
        sel(obj, operation, leaveSelected); //this must be done first
        getDetails(obj.attr("data-url"), operation, obj); //use the data-url attribute to get record details
        
        // Don't remove the "unread" class if the "ctrl" or "shift" button was pressed
        if (operation == "")
        {
            if (gRequiresMarkAsRead)
            {

                $(".message-summary", obj).removeClass("unread"); // Remove the "unread" class from the message summary node.
                // Send the message instance ID and the bool that says what to set the read DT to.
                $.get(markAsReadCall + "?ids=" + gRecordID + "&markRead=true");
            }
        }
        
        LstObj.ChosenObj = obj; //for listContainer eventhandling
    }
    else
    {
        gStopSelect = false;//reset flag
    }
}

/*
    select class
    obj: to be selected
    operation: "ctrl", "shift", ""
    leaveSelected: null or true, control selection clearing
*/
var lastSelObj;
function sel( obj, operation, leaveSelected )
{
    if ( leaveSelected == null )
    {
        removeSelecteds(operation);
    }
    obj.focus();
    switch ( operation )
    {
        case "ctrl":
            obj.toggleClass( "selected" ); //add or remove as necessary
            break;
        case "shift":
        default:
            obj.addClass( "selected" );//always add class
    }
}

//remove selection class from previously selected items
// operation : what type of selection is being done after this process
function removeSelecteds( operation )
{
    //remove previous selected class if required
    if ( gSelectedRecords.length > 0 && ( operation==null||operation == "" || ( operation == "shift" && gLastIsShift == false ) ) )
    {
        //cycle through array
        $.each( gSelectedRecords, function ()
        {
            var msg =  SelectMessage(this);//get record
            if ( msg.length > 0 ) //if div exists
            {
                msg.removeClass( "selected" );
            }
        } );
        gSelectedRecords = [];
    }
}

/*
common process in multiselect shift selection
*/
function doShiftProcess( record )
{
    if ( AllowPushToSelected() )
    {
        if (!record.hasClass("listGroupheader"))
        {
            var id = record.attr("id").replace("msg_", ""); //get id from record id
            doPushToSelected(id);
        }
        sel( record, "shift", true );
        return false;
    }
    return true;
}

//checks to see if ID already exists before pushing to global array
function doPushToSelected(id)
{
    if ( $.inArray( id, gSelectedRecords ) < 0 ) //add id if it is not already in array
    {
        gSelectedRecords.push( id ); //add id to array
    }
}

/*
    Ajax call to get page details on message click in list
    urlstr : URL from msg edit link
    operation: string--"", "ctrl" or "shift" to control what selection process is being executed
    obj: message div that was selected
    Stores or removes message IDs in  gSelectedRecords array according to process
    If the process is "", get selected message details to load in right panwe
*/
function getDetails( urlstr, operation, obj )
{
    gRecordID = urlstr.substring( urlstr.search( /\?id\=/ ) + 4 );

    switch ( operation )
    {
        case "ctrl":
            var index = $.inArray( gRecordID, gSelectedRecords );
            if ( index > -1 )
            {
                gSelectedRecords.splice( index, 1 ); //remove id from array if it exists
            }
            else
            {
                if ( AllowPushToSelected() )
                {
                    doPushToSelected( gRecordID ) ; //add id to array
                }
                else
                {
                    obj.removeClass("selected");
                    gStopSelect = false;//reset flag
                }
            }
            gLastIsShift = false;
            gDelay = false;//reset flag
            break;
        case "shift":
            var record = SelectMessage(gLastSelected);//find first record selected
            if ( record.length > 0  )
            {
                if ( !gDelay )
                {
                    if ( gLastIsShift == false )//check to make sure we are not extending a shift operation
                    {
                        gSelectedRecords = []; //reset array
                    }
                    //worrk out direction of multiselect
                    var dir = "down";
                    if ( record[0].offsetTop > obj[0].offsetTop )
                    {
                        dir = "up";
                    }
                    var maxReached = false;
                    while ( record.attr( "id" ) != "msg_" + gRecordID ) //loop through intervening records
                    {
                        maxReached = doShiftProcess( record );
                        if ( maxReached )
                        {
                            $( "#msg_" + gRecordID ).toggleClass( "selected" ); //add or remove as necessary
                            gStopSelect = false;
                            break;
                        }
                        if ( dir == "down" )
                        {
                            record = getNextNode( record, "down" ); //move to next record
                        } else
                        {
                            record = getNextNode( record, "up" ); //move to previous record
                        }
                    }
                    if ( !maxReached && AllowPushToSelected() )
                    {
                        doPushToSelected( gRecordID ); //add this record
                    } else
                    {
                        SelectMessage(gRecordID).removeClass( "selected" ); //remove currently selected class
                        gStopSelect = false;
                    }
                    gLastIsShift = true;
                }
                else
                {
                    gDelay = false;//reset flag
                }
            }
            else //it has been removed by scrolling
            {
                alert( getResource( 'message', 'MultiSelectError' ) );//call to JSON object
            }

            break;
        default:
            gSelectedRecords = [];//reset array
            gSelectedRecords.push( gRecordID ); //add id to array
            gLastIsShift = false;//reset flag
            gDelay = false;//reset flag
            //only get details on non-multiselect
            $.ajax(
            {
                url: urlstr,
                success: function ( data )
                {
                    //load the html into the target div  
                    messageDetails.populateHtml( data );
                }
            } );
    }

    gLastSelected = gRecordID;
    
}

