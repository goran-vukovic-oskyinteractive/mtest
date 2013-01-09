/// <reference path="jquery-1.7.1.intellisense.js" />
/// <reference path="messageDetails.js" />
// =================================================
//          %name: message.list.js %
//       %version: 10.1.1.1.13 %
//      Copyright: Copyright 2012 BAE Systems Australia
//                 All rights reserved.
// =================================================

var LoadReverse = false; //flag for direction of loading
var LstObj = null;
var safariWait = false;//flag to stop reload cause by safari event firing order
var scrollWheelWait = false;//flag to turn off reload by scrollwheel
var keystrokeWait = false; //flag to turn off reload by keystroke
/*
    Object to maintain metadata about the infinite list.
*/
function ListPosition( listcount, pagesize, listheight, pagecount )
{
    this.ListCount = listcount; //total of records that can be loaded for this list
    this.PageSize = pagesize; //number of records in a page
    this.ListHeight = listheight; //actual height of fully loaded list
    this.Pagecount = pagecount; //number of pages that could be loaded
    this.RecordHeight = 85;
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
    this.blockLoaded = blockLoaded; //checks this.IndexString to see if block index is currently loaded 
    this.scrollDirection = "";
    this.IndexString = "|"; //string to store delimted list of loaded block offset indexes
   
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
                rtn =  LstObj.ListCont.scrollTop();
            } else
            {
                rtn = LstObj.ListCont.scrollTop;
            }
        }
        else
        {
            rtn =  LstObj.ListCont.scrollTop();
        }
        return rtn;
    }

/*
    controls scroll action on scroll event
    */
    function onScroll(event)
    {
        if ( this.Wait || safariWait )
        {
            safariWait = false;
            return true;
        }
        var scr = getScrollTop();
        this.lastPos = scr;
        //determine if scroll is greater than 500 pixels
        if ( scrollStartVal - scr > 500 || scr - scrollStartVal > 500 )
        {
            if ( !scrollWheelWait && !keystrokeWait ) //if reload  not triggered by wheelscroll or keystroke
            {
                setTimeout( function () { setLoading( true ); }, 10 );
                loadNeeded = true; //set flag to re-load list at new position
            }
        }
    }

    /*
    scroll start event handler: sets initial position
    */
    function onScrollStart( event )
    {       
        scrollStartVal = getScrollTop();
    }

    /*
    scrollstop event handler: determines if new pages of data need to be loaded at the new scroll position
    */
    function onScrollStop( event )
    {
        if ( loadNeeded === true ) //flag has been set
        {
            loadNeeded = false; //reset flag
            var scr = getScrollTop();
            var scrollPageOffset = Math.floor(( ( scr ) / this.ListHeight ) * ( this.Pagecount ) ); //work out position in page index
            if ( scr < this.lastPos && scrollPageOffset > this.Pagecount - 2 ) // abort if at end of list and scrolling back
            {
                return false;
            }
 
            LstObj.MessageList.html( "" ); //clear list contents  
            LstObj.IndexString = "|";
            if ( !LstObj.blockLoaded( scrollPageOffset ) )//check to see if page already loaded
            {
                loadPage(scrollPageOffset, 0); //load target page 
            }
            if ( !LstObj.blockLoaded( parseInt( scrollPageOffset ) + 1 ) )//check to see if page already loaded
            {
                setTimeout(function() { loadPage(scrollPageOffset + 1, 1, true); }, 10); //load next page on separate thread...more stable
            }
            scrollStartVal = getScrollTop();
    
        }
        else
        {
            scrollWheelWait = false;
            scrollCheck(this.ListCont);
        }
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
                //determine direction of scroll
                if ( scrollStartVal < getScrollTop() ) //use dom object because .scrollTop() doersn't work in safari
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
                    //if ( checkContainers( offset - 1, false ) ) 
                    //{
                        if ( !LstObj.blockLoaded( offset - 1 ) )//check for page loaded
                        {
                            loadPage(offset - 1, -1); //call ajax load of page of data
                        }
                    //}
                }
            }
        }
        else
        {
            //     ( top of container    minus                   ( bottom of list viewport) )   <   delta
            if ( obj[0].offsetTop - ( scr + listCont.height() ) < delta ) //if inside loading zone
            {
                //if ( checkContainers( offset + 1, true ) )//check for page loaded
                //{
                    if ( !LstObj.blockLoaded( parseInt(offset) + 1 ) )
                    {
                        loadPage( parseInt( offset ) + 1, 1 );
                    }
                //}
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
            if ( start - scrolltop > 3100 )  //    is outside "live" zone
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
        LstObj = new ListPosition( $( "#msgcount" ).val(), $( "#recordsinpage" ).val(), $( "#listheight" ).val(), $( "#pagecount" ).val() );
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
        assignMsgEvnts();// assign   events to all message divs
        selectRecord( $( "#messageList .message:first" ) );//load first message into detail view    
        var firstcont = $( "#messageList .offsetCont" );
        firstcont.attr( "data-off", 0 ); //set offset attribute for first container
    } );

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
    LstObj.MessageList.on( "click", ".message", function ()
    {
        doClick( $( this ) );
    } );
    //assign this ondoubleclick function to the messageList div .    
    LstObj.MessageList.on( "dblclick", ".message", function ()
    {
        doClick( $( this ) );
    } );
    //assign this on  keydown function to the messageList div .    
    LstObj.MessageList.on( "keydown", ".message", function ( event )
    {
        keyHandler(event, $( this ) );
        event.preventDefault(); //stop default event from occurring
        return false;
    } );
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
    LstObj.InCallback = true; //set flag
    //set html for loading image
    setLoading( true );
    // do ajax call for next page
    $.get( "/GetMessages/" + offset + "/" + LstObj.CurrentList + "/0", function ( data )
    {
        var rtns = data.split( "--*--" ); // get current header from data        
        var html = rtns[2]; //actual data
        var countrec = rtns[3]; //count of records to be inserted
        if ( html !== '' )
        {
            insertPage( html, countrec, offset, positionIndex,select ); //new page            
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
        LstObj.MessageList.prepend( "<div  class='offsetCont' data-off='"
                + offset * LstObj.PageSize + "'>" + html + "</div>" );//add html it to beginning of  messagelist    
        setLoading( false );//remove loading image
    }
    else
    {
        var spacer = $( "#spacer", "#messageList" );
        if ( spacer.length === 0 )
        {
            LstObj.MessageList.prepend( "<div  id='spacer'></div>" );
            spacer = $( "#spacer", "#messageList" );
        }
        if ( positionIndex == 0 )// at new scroll position
        {
            //store offset index in  LstObj.IndexString
            LstObj.IndexString += offset + "|";
            spacer.css( "height", offset * LstObj.PageSize * 77 ); //set height of spacer to offset * pagesize * recordHeight
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
        }
        LstObj.tidyContainers();
        setLoading( false );//remove loading image
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
*/
function loadList( list, reloadfrombottom )
{
    if ( !isValidObject( reloadfrombottom ) ) //is a reload from the top
    {
        LoadReverse = false; //unset reverse flag
    }
    LstObj.CurrentList = list;

    if ( LoadReverse ) //loading intitial pages from bottom up
    {
        list = list + "/1";
    }  
    // ---- do ajax call for reload of lists
    $.get( "/LoadListFromFolder/" + list, function ( data )
    {
        if ( data !== '' ) //there is data
        {
            LstObj.ListCont.html( data ); //load new set of messages into list    
            LstObj.MessageList = $( "#messageList" );
            //set message click handlers
            assignMsgEvnts();
        }
        var firstcont;
        LstObj.Wait = true;
        LstObj.InCallback = false;

        if ( LoadReverse ) //loading intitial pages from bottom up
        {
            var currentpage = LstObj.Pagecount - 2;
            LstObj.IndexString = '|' + currentpage + "|" + (parseInt(currentpage)+1) + "|";
            firstcont = $( "#messageList .offsetCont" );
            firstcont.attr( "data-off", currentpage * LstObj.PageSize );
            firstcont.attr( "id", "offset" + currentpage );
            selectRecord( $( "#messageList .message:last" ) );
        }
        else //loading from top down
        {
            LstObj.IndexString = "|0|";
            LstObj.ListCont.scrollTop( 0 ); //scroll back to top of list   
            firstcont = $( "#messageList .offsetCont" ); //get first block container
            firstcont.attr( "data-off", 0 );//set data offset of first block 
            firstcont.attr( "id", "offset1" );
            selectRecord( $( "#messageList .message:first" ) );//load first message into detail view       
        }

        LstObj.Wait = false;
        setLoading( false );
    } );
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
   called by the click event--- load the detail view, highlight, select and set focus
*/
function doClick( obj )
{
    obj.focus();
    getDetails( obj.attr( "data-url" ) ); //use the data-url attribute 
    sel( obj );
    LstObj.ChosenObj = obj; //for listContainer eventhandling
}

/*
    select class
*/
var lastSelObj;
function sel( obj )
{
    if ( lastSelObj )
    {
        lastSelObj.removeClass( "itemselected" );
    }
    obj.focus();
    lastSelObj = obj;
    obj.addClass( "itemselected" );
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
            moveToItem( LstObj.CurrentObj, "down" );
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
            moveToItem( LstObj.CurrentObj, "up" );
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
            pageObj = doPage( "up", obj );
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
            pageObj = doPage( "down", obj );
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
    if ( obj.prev( "div" ).hasClass( "listGroupheader" ) ) //previous div is header
    {
        if ( obj.prev( "div" ).prev( "script" ).length > 0 ) //div before that is script
        {
            if ( obj.prev( "div" ).prev().prev().length === 0 )//no div before that
            {
                return checkPrevBlock( obj );
            }
            else//previous div exists
            {
                return false;
            }
        }
        else //div before that is NOT script
        {
            if ( obj.prev( "div" ).prev().length > 0 )//previous div exists
            {
                return false;
            }
            else
            {
                return checkPrevBlock( obj );
            }
        }
    }
    else
    {
        if ( obj.prev( "div" ).length > 0 ) //previous div exists
        {
            return false;
        }
        else
        {
            return checkPrevBlock( obj );
        }
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
function doPage( dir, obj )
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
        if ( sibling !== null ) //sibling exists checxk to see if it is the first or last one visible in the page
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
    if ( loopcount === 0 ) //is already at top or bottom of visible items and the page motion is out of the visible frame so need to count further
    {
        if ( dir === "up" )
        {
            for ( var i = 1; i <= pagesize; i++ )  
            {
                if ( isFirstRecord( obj ) )
                {
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
    moveToItem( obj, dir ); //set new position on this object
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
 Clear reversed order of page laoding for scroll up if set and
  clear current list and reload first page of list if list not fully loaded. 
  Select first record
*/
function moveToBeginning()
{
    LstObj.MessageList.html( "" ); // clear list contents  
    LstObj.IndexString = "|";
    LstObj.Wait = true; // turn on scroll disabling flag

    if ( LoadReverse === true )
    {
        LoadReverse = false; // reset flag
    }
    LstObj.ListCont.scrollTop( 0 ); // scroll to top of list
    loadList( LstObj.CurrentList ); // 
}

/*
  clear current list and reload last 2 pages of list.
  Set reversed order of page laoding for scroll up.
  Select last record
*/
function moveToEnd()
{
    LstObj.Wait = true;
    if ( $.browser.safari )
    {
        safariWait = true;
    }
    LoadReverse = true; //set reverse load flag
    LstObj.MessageList.html( "" ); //clear list contents  
    LstObj.IndexString = "|";
    loadList( LstObj.CurrentList, true ); //insert last page 
}

/*
  highlight and select an item without firing the click event
  obj: message div
  dir: up or down
*/
function moveToItem( obj, dir )
{
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
    sel( obj ); //select  
    LstObj.ChosenObj = obj;
    obj.focus();
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
This code calls the ChildList loader after the last keystroke 
up or down is at least delay * milliseconds ago.
*/
var timer;
function delaySelect( delay )
{
    var obj = LstObj.CurrentObj;
    clearTimeout( timer );
    timer = setTimeout( function () { selectRecord( obj ); }, delay );
}

/*
    fire the click event of a div and set focus on it
    obj: message div
*/
function selectRecord( obj )
{
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
    Ajax call to get page details on message click in list
    urlstr : URL
*/
function getDetails( urlstr )
{
    setLoading( true );
    $.ajax(
    {
        url: urlstr,
        success: function ( data )
        {
             //load the html into the target div  
            messageDetails.populateHtml(data);
            
            setLoading( false ); //show loading image
        }
    } );
}

/*
show or hide loading image 
*/
function setLoading( show )
{
    if ( show )
    {
        $('#messagewait').css("display", "block");
    }
    else
    {
        $( '#messagewait' ).css( "display", "none" );
    }
}


function addListScroll()
{
    $( "#listContainer" ).niceScroll( "#messageList", {
        autohidemode: true,
        cursorborder: "none",
        cursorwidth: 8,
        cursorminheight: 55,
        cursorcolor: "#6c6c6c",
        zindex: 99,
        scrollspeed: 30,
        mousescrollstep: 15,
        preservenativescrolling: false
    } );
}

function removeListScroll()
{
    $( "#listContainer" ).getNiceScroll().remove();
    $( "#listContainer" ).css( "overflow", "hidden" );
}

