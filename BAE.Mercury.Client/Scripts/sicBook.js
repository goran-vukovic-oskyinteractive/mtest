/// <reference path="jquery-1.7.1.intellisense.js" />
/// <reference path="jquery.dynatree-1.2.2.js" />
// ================================================================================
//          %name: sicBook.js %
//       %version: 7 %
//      Copyright: Copyright 2012 BAE Systems Australia
//                 All rights reserved.
// ================================================================================

var sicBook = {
  dynatreeSetup: function( getChildrenUrl, getRootNodesUrl )
  {

    // Attach the dynatree widget to an existing <div id="tree"> element 
    // and pass the tree options as an argument to the dynatree() function: 
    $( "#tree" ).dynatree( {
      minExpandLevel: 1,
      persist: false,
      imagePath: "Content/themes/skin-custom/",
      clickFolderMode: 1,
      activeVisible: false,
      fx: { height: "toggle", duration: 200 },
      strings: {
        loadError: "SIC information is currently unavailable"
      },
      initAjax: {
        url: getRootNodesUrl
      },
      onDblClick: function( node, event )
      {
        var key = '';
        key = node.data.key;
        // If this is a leaf node, i.e., full SIC, not partial ...
        if ( key.length === 3 )
        {
          addSicToSelected( key );
        }
      },
      onLazyRead: function( node )
      {
        node.appendAjax( {
          url: getChildrenUrl,
          data: {
            sicId: node.data.key
          }
        } );
      }
    } );

  }
};

// Constructs the dynatree node path based on SIC information.
//
// @param {String} sic A partial or full specified sic.
// @return {String} Returns a string value containing the dynatree path format of the SIC.

function generateSicPath( sic )
{
  var path = '';
  for ( var i = 0; i < sic.length; i++ )
  {
    var node = sic.slice( 0, i + 1 );
    path += '/' + node;
  }
  return path;
}

// Navigates to the corresponding dynatree node based on SIC value specified in the search field.
//
// @param {String} event Javascript event details for this function.

function navigateToSIC( event )
{
  var sic = $( "#sicSearch" ).val().toUpperCase();
  var regex = new RegExp( "^[A-Z0-9]+$" );
  // If not a valid SIC format ...
  if ( !regex.test( sic ) )
  {
    // Collapse all the node.
    $( "#tree" ).dynatree( "getRoot" ).visit( function( node )
    {
      node.expand( false );
    } );
  }
  else // case of valid SIC.
  {
    // Expand the dyna tree to the SIC node.
    var path = generateSicPath( sic );

    var tree = $( "#tree" ).dynatree( "getTree" );
    // Make sure that the specified node is loaded, by traversing the parents. 
    // The callback is executed for every node as we go: 
    tree.loadKeyPath( path, function( node, status )
    {
      if ( status == "loaded" )
      {
        // 'node' is a parent that was just traversed. 
        // If we call expand() here, then all nodes will be expanded 
        // as we go 
        node.expand();
      }
      else if ( status == "ok" )
      {
        // 'node' is the end node of our path. 
        // If we call activate() or makeVisible() here, then the 
        // whole branch will be expanded now 
        node.activate();
        // put focus so that the scrolling moves to the item.
        node.focus();
        // put focus back to editable search field.
        setTimeout( function()
        {
          $( "#sicSearch" ).focus();
        }, 20 );
      }
    } ); // end loadKeyPath().
  } //end case of valid sic format ...
}

// Add a SIC to the collection of selections. Only allows new SICs and a maximum of eight SICs in the collection.
//
// @param {String} sic A SIC to add to collection of selections.

function addSicToSelected( sic )
{
  var sicCount = getSelectedSicCount();

  // If maximum has been reached ...
  if ( sicCount === 8 )
  {
    alert( 'A maximum of 8 SICs are allowed. You cannot add more.' );
  }// If the sic is not already a selected sic ...
  else if ( !checkSicExists( sic ) )
  {
    // Add in SIC to the collection of selections.
    var sicBlockHtml = '<div class="sic-block"><span class="sic-block-text">' + sic
      + '</span><div class="sic-block-icon" onclick="javascript:removeSicFromSelected(this)">X</div></div>';
    $( '#sicSelections' ).append( sicBlockHtml );
  }
  else
  {
    alert( "This SIC (" + sic + ") has already been added to this message" );
  }
}

// Get the number of SICs in the collection of selected SICs.
//
// @return {Integer} Returns A count of the number of SICs in the collection of selected SICs.

function getSelectedSicCount()
{
  var sics = $( '#sicSelections div.sic-block' );
  return sics.size();
}

// Check to see if a SIC has already been added as a selected SIC.
//
// @return {Boolean} Returns True if the next SIC to be added already exists in the collection of SIC.

function checkSicExists( sic )
{
  var existing = $( ".sic-block-text:econtains('" + $.trim( sic.toString() ) + "')", ".sic-chest" ); //econtains is defined on document ready above

  return (existing.length > 0) ? true : false;
}

// Removes a SIC from collection of selected.
//
// @param {Object} obj This is the div element that houses the 'X' button for people to click on.

function removeSicFromSelected( obj )
{
  // Remove the SIC block.
  $( obj ).parent().remove();
}

// Event handler for key down events on the 'Selections' div.
//
// @param {Object} event Event handler for SIC container divs.
// @param {Object} obj SIC div inside the Selections container.

function sicKeyDown( event, obj )
{
  var parentObj;
  switch ( event.keyCode )
  {
  case 13:
//enter   
    event.preventDefault(); //stop page from submitting on enter
    return false;
    break;
  case 37:
//left    
    movePrev( obj );
    break;
  case 39:
//right
    moveNext( obj );
    break;
  case 36:
//home
    var home = obj.parent().children( "div" ).first(); //first div inside current container
    if ( home.length > 0 )
    {
      home.focus();
    }
    break;
  case 35:
//end
    var end = obj.parent().children( "div" ).last(); //last div inside current container
    if ( end.length > 0 )
    {
      end.focus();
    }
    break;
    break;
  case 8:
//backspace
    if ( obj.length > 0 )
    {
      //parentObj = obj.parent().parent();//need to get parent before we delete object
      movePrev( obj ); //try to move to previous div
      obj.remove();
      event.preventDefault(); //prevent backspace from sending page to previous url
      return false;
    }
    break;
  case 46:
//delete
    if ( obj.length > 0 )
    {
      //parentObj = obj.parent().parent();
      moveNext( obj ); //try to move to next div
      obj.remove();
    }
    break;
  default:
    break;
  }
};

// Move the focus onto the next SIC div.
//
// @param {Object} obj Current SIC div with focus.

function moveNext( obj )
{
  var next = obj.next( "div" );
  if ( next.length > 0 )
  {
    next.focus();
  }
}

// Move the focus onto the previous SIC div.
//
// @param {Object} obj Current SIC div with focus.

function movePrev( obj )
{
  var prev = obj.prev( "div" );
  if ( prev.length > 0 )
  {
    prev.focus();
  }
}

// Accept the selected SICs and transfer them to the message.
//
// @param {Object} obj Accept SICs button element.

function acceptSICs( obj )
{

    var validsics = true;
    var sics = $( '#sicSelections div.sic-block span' );

    if ( sics.length > 0 )
    {
        // Join all the SICs code into a semi-colon delimited string.
        var sicsText = $( sics ).map( function()
        {
            return $( this ).text();
        } ).toArray().join( ";" );

        validsics  = importSICs( sicsText );
    }
    if ( validsics )
    {
        $( obj ).closest( '.ui-dialog-content' ).dialog( 'close' );
    }
    
}

// Accept the selected SICs and transfer them to the message.
//
// @param {Object} obj Cancel button element.

function closeSicBook( obj )
{
  $( obj ).closest( '.ui-dialog-content' ).dialog( 'close' );
}

// Transfer the SICs to the draft message.
// Do pre-trnsfer validation  to make sure only 8 sics total and none that have been already typed in
// @param {String} sics Semi-colon delimited string of SIC codes.

function importSICs( sics )
{
    var sicInput = $(".sic input");
    var sicsArray = sics.split( ";" );
    var alreadyPresent = $(".sic div").length;
    if ( alreadyPresent + sicsArray.length > 8 )
    {
        alert( "Only 8 SICs may be added to a message and " + alreadyPresent + " SICs are already present." );
        return false;
    }
    for ( var i = 0; i < sicsArray.length; i++ )
    {
        if ( checkTermExists( sicsArray[i], true ) ) //if it exists already on message
        {
            alert("The SIC '" + sicsArray[i] + "' already exists on the message");
            return false;
        }
        //write sic to message
        sicInput.before( "<div tabindex='0' class='a' > <span class='addresstext'>" + sicsArray[i] + "</span></div>" );
        syncAddressee( sicInput.parent(), sicsArray[i] ); //write to data bound list
    }
    var rtn = validateSics();//check sic rules
    if ( rtn != "" )
    {
        rtn = rtn.replace( "<li>", "" );
        rtn = rtn.replace( "</li>", "\r\n" );
        alert( rtn );
        return false;
    }
    return true;
}