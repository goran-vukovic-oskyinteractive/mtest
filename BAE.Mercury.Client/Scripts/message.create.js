
// <reference path="jquery-1.7.1.intellisense.js" />
/// <reference path="jquery-ui-1.8.20.js" />
// =================================================
//          %name: message.create.js %
//       %version: 18 %
//      Copyright: Copyright 2012 BAE Systems Australia
//                 All rights reserved.
// =================================================


//$('.watermark').watermark('clearWatermarks');  
//use this before submitting form to clear any non - entered fields

/*
on document ready, assign event handlers and build autocomplete on inputs
*/
$( document ).ready( function ()
{
    //add watermarks to all marked fields
    $( '.watermark' ).watermark();
    //action and info addressee input keydown evnt assignment
    $( ".addressInput, .sicInput" ).on( "keydown", "", function ( event )
    {
        addressInputKeyDown( event, $( this ) );
    } );
    //action and info field keydown evnt assignment
    $( ".action, .info, .sic").on( "keydown", "div", function ( event )
    {
        addressKeyDown( event, $( this ) );
    } );
    //on addressee div focus, set border black
    $( ".action, .info, .sic" ).on( "focus", "div .a,.b,.c", function ( event )
    {
        $( this ).css( 'border', 'solid 1px Black' );
    } );
    //on addressee div blur, set border to background color
    $( ".action, .info, .sic" ).on( "blur", "div .a,.b,.c", function ( event )
    {
        $( this ).css( 'border', 'solid 1px #efecf4' );
    } );
    //on addressee div dblclick , set border black
    $( ".action, .info, .sic" ).on( "dblclick", "div .a,.b,.c", function ( event )
    {
        $( this ).css( 'border', 'solid 1px Black' );
    } );
    //on addressee div scroll event assignment
    $( ".addresscontainer, .siccontainer" ).on( "scroll", "", function ( event )
    {
        addresseeScroll( event, $( this ) );
        return false;
    } );
    //show message instructions div
    $( "#messageInstruct" ).on( "mousedown", "", function ( event )
    {
        showMessInstruct( event, $( this ) );
    } );
    //create "exact contains" expression for code to use
    $.expr[":"].econtains = function ( obj, index, meta, stack )
    {
        return ( obj.textContent || obj.innerText || $( obj ).text() || "" ).toLowerCase() == meta[3].toLowerCase();
    };
    //handlers select event on autocomplete addressee inputs
    //ui is auto-complete dropdown items parent object
    function buildAddress(event, ui)
    {
        var $input = $( this );//get input control
        var isSic = $input.hasClass("sicInput");
        if ( checkTermExists( jQuery.trim( ui.item.label ), isSic ) ) //ui.item.label is the selected menu item
        {
            event.preventDefault(); //stop the selected value being inserted into input
            return;
        }
        
        stopKeyDown = true; //stop creation of typed characters on the enter
        if ( isSic )
        {
            if ( $( ".sic div" ).length < 8 )//check for maximum number of SICs
            {
                $input.before( "<div tabindex='0' class='a' ><span class='addresstext'>" + ui.item.label + "</span></div>" );
            }
            else
            {
                alert("Only 8 SICs may be added to a message");
            }
        }
        else
        {
            $input.before( "<div tabindex='0' class='a' ><div class='icon'></div><span class='addresstext' >" + ui.item.label + "</span></div>" );
        }
        
        $input.val( "" );//set input value to "" on close event of autocomplete menu
        syncAddressee($input.parent(), ui.item.label);
        event.preventDefault();; //stop the selected value being inserted into input
        resizeAddressees($input.parent());
        enableSelects();
    }

    //create autocomplete actions on addressee inputs
    var addressAutoComplete = function()
    {
        var $input = $( this );//get input control
        //create autocomplete options: MVC route to server, function to run on select
        var options = {
            source: $input.attr( "data-otf-autocomplete" ),
            select: buildAddress,//Triggered when an item is selected from the menu
            focus: function ( event, ui ) //Triggered when focus is moved to an item (not selecting). 
            {
                event.preventDefault();
                stopKeyDown = true;//stop creation of typed characters on the enter
                $( ui.item ).find( "li" ).css( "list-style", "none" );
                return false;//cancel event to stop item being put into input
            },
            close: function ()//Triggered when the menu is hidden
            {
                stopKeyDown = false;//allow creation of typed characters on the enter
            }
        };
        $input.autocomplete( options ); //build autocomplete onto input control

        if ( $input.hasClass( "sicInput" ) )
        {
            $input.autocomplete("option", "minLength", "1"  ); //must type one character before search is done
        }
        else
        {
            $input.autocomplete( "option", "minLength", "2" ); //must type two characters before search is done
        }
       
    };
    //build autocomplete functionality on all 
    $("input[data-otf-autocomplete]").each(addressAutoComplete);

    // Opens the SIC address book in a modal window.
    $('#siccap').click(function ()
    {
      // Add a container for the modal dialog, or get the existing one
      var dialog = ($('#ModalDialog').length > 0) ? $('#ModalDialog') : $('<div id="ModalDialog" style="display:hidden"></div>').appendTo('body');
      // load the data via ajax
      $.get('/Sic/OpenSicBook', {},
          function (responseText, textStatus, xmlHttpRequest)
          {
            dialog.html(responseText);
            dialog.dialog({
              bgiframe: true,
              modal: true,
              width: 940,
              title: 'SIC Book'
            });
          }
      );
    });
} );

/* 
Synchronise bound lists ActionAddressees and InfoAddressees 
with the div addressee displays
list: obj, container div for addressees ( will have class name "action" or "info" )
name: string, addressee being added
remove: boolean, remove from list
*/
function syncAddressee(list, name , remove)
{
    if ( list.hasClass( "action" ) )
    {
        if ( remove ) //delete option from bound list
        {
            var options = $( '#ActionAddressees option' );
            for ( var i = options.length -1 ; i >= 0  ; i-- ) //step backwards through list
            {
                if ( options[i].innerText == name )
                {
                    $( options[i] ).remove();
                    break;
                }
            }
        }
        else//add option to list
        {
            $( '#ActionAddressees' ).append( '<option value="' + name + '" selected="selected" >' + name + '</option>' ); 
        }
    }
    else if ( list.hasClass( "sic" ) )
    {
        if ( remove ) //delete option from bound list
        {
            var options3 = $( '#Sics option' );
            for ( var i = options3.length - 1 ; i >= 0  ; i-- ) //step backwards through list
            {
                if ( options3[i].innerText == name )
                {
                    $( options3[i] ).remove();
                    break;
                }
            }
        }
        else//add option to list
        {
            $( '#Sics' ).append( '<option value="' + name + '" selected="selected" >' + name + '</option>' );  
        }
    }
    else
    {
        if ( remove ) //delete option from bound list
        {
            var options2 = $( '#InfoAddressees option' );
            for ( var i = options2.length - 1 ; i >= 0  ; i-- ) //step backwards through list
            {
                if ( options2[i].innerText == name )
                {
                    $( options2[i] ).remove();
                    break;
                }
            }
        }
        else//add option to list
        {
            $( '#InfoAddressees' ).append( '<option value="' + name + '" selected="selected" >' + name + '</option>' );  
        }
    }
}

//scrolling container maximum height function
function addresseeScroll( event, obj )
{
    obj.css( "height", "65px" );
  //show sic field closer image
   $( ".siccloser" ).css( "display", "block" );
}

// check to see if an addressee has already been added to action or info field
function checkTermExists( address, isSic )
{
    var existing;
    if(isSic){
        existing = $( "div:econtains('" + $.trim( address.toString() ) + "')", ".sic" ); //econtains is defined on document ready above
    }
    else
    {
        existing = $( "div:econtains('" + $.trim( address.toString() ) + "')", ".action, .info" );  
    }
   
    if ( existing.length > 0 ) //check to see if address already exists
    {
        if ( isSic )
        {
            alert( "This SIC (" + address + ") has already been added to this message" );
        }
        else
        {
            alert( "This addressee (" + address + ") has already been added to this message" );
        }
        return true;
    }
    return false;
}

//handles enter keydown on input to create new addressee div if text is a valid address
function createTerm( input  )
{
    var isSic = false;
    if ( input.hasClass( "sicInput" ) )
    {
        isSic = true;
    }
    //"fred", "matt", "tom", "peter"
    var term = input.val().toUpperCase();
    if ( checkTermExists( term, isSic ) )
    {
        return false;
    }
    if ( stopKeyDown == true )
    {
        return false;
    }
    var url;
    if ( isSic )
    {
        url = "/Sic/ValidateSic?sic=" + term;
    }
    else
    {
        url = "/Address/ValidateAddress?address=" + term;
    }
    $.get( url, function ( data )
    {
        if ( data == "True" )
        {
            input.val( "" );
            if ( isSic )
            {
                if ( $( ".sic div" ).length < 8 )//check for maximum number of SICs
                {
                    input.before( "<div tabindex='0' class='a' > <span class='addresstext'>" + term + "</span></div>" );
                }
                else
                {
                    alert( "Only 8 SICs may be added to a message" );
                }
            }
            else
            {
                input.before( "<div tabindex='0' class='a' ><div class='icon'></div><span class='addresstext'>" + term + "</span></div>" );
            }
            
            syncAddressee( input.parent(), term );
            enableSelects();
        }
        else
        {
            if ( isSic )
            {
                alert( term + " is not a valid SIC" );
            }
            else
            {
                alert( term + " is not a valid addressee" );
            }
        }
    } );
    resizeAddressees(input.parent());
    return true;
}
var stopKeyDown = false;//global flag to control enter keydown firing

//event handler for address INPUT control only
//input: input control
function addressInputKeyDown( event, input )
{

    switch ( event.keyCode )
    {
        case 37://left    
            movePrev( input );
            break;
        case 8: //backspace
            if ( input.is( "input" ) && input.val() != "" )//allow backspace inside input text
            {
                return true;
            }
            var parent = input.parent().parent();//get container
            var p = input.prev( "div" ); //else remove previous addressee div
            if ( p.length > 0 )
            {
                syncAddressee( p.parent(), p.text(), true );
                p.remove();
            }
            input.focus();
            resizeAddressees( parent );
            enableSelects();
            break;
        case 13: //enter
            if ( createTerm( input ) )
            {
                input.focus();
            }
            event.preventDefault();
            return false;
           
        default:
            break;
    }
}

//event handler for address container divs
//obj: addressee div inside action or info field
function addressKeyDown( event, obj )
{
    var parentObj;
    switch ( event.keyCode )
    {
        case 13://enter   
            event.preventDefault(); //stop page from submitting on enter
            return false;
            break;
        case 37://left    
            movePrev(obj);
            break;
        case 39://right
            moveNext( obj );
            break;
        case 36: //home
            var home = obj.parent().children( "div" ).first(); //first div inside current container
            if ( home.length > 0 )
            {
                home.focus();
            }
            break;
        case 35: //end
            var end = obj.parent().children( "div" ).last();//last div inside current container
            if ( end.length > 0 )
            {
                end.focus();
            }
            break;
            
        case 8: //backspace
            if ( obj.length > 0 )
            {
                parentObj = obj.parent().parent();//need to get parent before we delete object
                movePrev( obj ); //try to move to previous div
                syncAddressee( obj.parent(), obj.text(), true );
                obj.remove();
                resizeAddressees( parentObj );
                enableSelects();
                event.preventDefault();//prevent backspace from sending page to previous url
                return false;
            }
            break;
        case 46: //delete
            if ( obj.length > 0 )
            {
                parentObj = obj.parent().parent();
                moveNext( obj ); //try to move to next div
                syncAddressee( obj.parent(), obj.text(), true );
                obj.remove();
                resizeAddressees( parentObj );
                enableSelects();
            }
            break;
        default:
            break;
    }
}

/*
check addressee lists to see if addressees are present
-if they are then enable appropriate precedence select control
-if not then set precedence to blank and disable
*/
function enableSelects()
{
    //check for action addressees
    if ( $( ".action div" ).length > 0 )
    {
        $( "#actionprec" ).prop( 'disabled', false );
    }
    else
    {
        $( "#actionprec" ).val( "" );
        $( "#actionprec" ).prop( 'disabled', true );
    }
    //check for info addressees
    if ( $( ".info div" ).length > 0 )
    {
        $( "#infoprec" ).prop( 'disabled', false );
    }
    else
    {
        $( "#infoprec" ).val( "" );
        $( "#infoprec" ).prop( 'disabled', true );
    }
}

//resize action or info div if contents are reduced
function resizeAddressees(container)
{
    var list = $( ".a, .b, .c", container );
    if ( container.hasClass( "sic" ) )
    {
        if ( list.length > 0)
        {
            container.parent().css( "height", "65px" );
            //.siccloser {bottom:2px;right:2px;
            $( ".siccloser" ).css( "bottom", "2px" );
            $( ".siccloser" ).css( "right", "2px" );
            $( ".siccloser" ).css( "display", "block" );
        } 
        else
        {
            container.parent().css( "height", "32px" );
            $( ".siccloser" ).css( "display", "none" );
        }
    }
    else
    {
        if ( list.length < 3 )
        {
            container.css( "height", "32px" );
        }
    }
}

//resize sics cintainer to one line
function closeSics()
{
    $( ".sic").parent().css( "height", "32px" );
    $( ".siccloser" ).css( "display", "none" );
}

 
//find next valid addressee div
function moveNext(obj)
{
    var next = obj.next("div, input");
    if (next.length > 0)
    {
        next.focus();
    }
}

//find previous valid addressee div
function movePrev( obj )
{
    var prev = obj.prev( "div" );
    if ( prev.length > 0 )
    {
        prev.focus();
    }
}

/*
toggle visibilty of editdiv3 (advanced msg options) and change image when grey arrow image is clicked
*/
function openEditDiv3()
{
    var editdiv3 = $("#editdiv3");
    if ( editdiv3.css( "display" ) == "none" )
    {
        $( "#open1" ).attr( "src", "~/images/GreyArrowDown.gif" );       
    }
    else
    {
        $( "#open1" ).attr( "src", "~/images/GreyArrowRight.gif" );      
    }
   editdiv3.toggle( 200 );
}

/*
toggle visibilty of securityCategories  div  and chenge image when black arrow image is clicked
*/
function openSecCat()
{
    var securityCategories = $( "#securityCategories" );
    if ( securityCategories.css( "display" ) == "none" )
    {
        //calculate position of secclass
        var secclas = $( "#secclass" );
        var left = parseInt( secclas.css( "left" ) ) + secclas.parent()[0].offsetLeft;
        var top = parseInt( secclas.css( "top" ) ) + secclas.parent()[0].offsetTop + 22;
        securityCategories.css( "left", left + "px" );
        securityCategories.css( "top", top + "px" );
        $( "#open2" ).attr( "src", "~/images/BlackArrowDown.gif" );
    }
    else
    {
        $( "#open2" ).attr( "src", "~/images/BlackArrowRight.gif" );
    }
    securityCategories.toggle( 200 );
}

/*
show message instructions list on mousedown in message instructions control
*/
function showMessInstruct( event, input )
{
    var instrCont = $( "#instructionsContainer" );
    if ( instrCont.css( "display" ) == "none" )
    {
        //calculate position of messageInstruct
        var msgInstruct = $( "#messageInstruct" );
        var left = parseInt( msgInstruct.css( "left" ) ) + msgInstruct.parent()[0].offsetLeft;
        var top = parseInt( msgInstruct.css( "top" ) ) + msgInstruct.parent()[0].offsetTop + 22;
        instrCont.css( "left", left + "px" );
        instrCont.css( "top", top + "px" );
    }
    instrCont.toggle( 200 );
}

/*
Show and position DTG editor
id: id of DTG being edited
*/
function openDTGCal( id )
{
    //calculate position of DTG to be edited
    var container = $( "#dtpContainer" );
    var input = $( "#" + id );
    var left =parseInt(input.css( "left" )) + input.parent()[0].offsetLeft  ;
    var top = parseInt( input.css( "top" ) ) + input.parent()[0].offsetTop + 24;
    //-position DTG editor div and make visible
    container.css( "display", "block" );
    container.css( "position", "absolute" );
    container.css( "left", left+"px");
    container.css( "top", top + "px" );
    //store id of DTG being edited
    $( "#DTGControl" ).val( id );
    //-initialize css of hour and minute divs
    $( ".hourscol div" ).css( "background-color", "#E2F1FF" );//reset all
    $( ".minscol div" ).css( "background-color", "#E2F1FF" );//reset all
    //-show calendar widget and set z-index
    $( "#dpdate" ).datepicker( "show" );
    var widget = $( "#dpdate" ).datepicker( "widget" );
    widget.css("z-index", "400");
}

/*
Do any pre-postback data preparation for validation
*/
function doPagePreparation()
{
    //transfer text from richtext editor to bound body field
    $( "#body" ).val( tinyMCE.activeEditor.getContent() );
    //clear out any watermark text
    $( '.watermark' ).watermark( 'clearWatermarks' );
}

/*
This function is called before postback to validate msg rules that cannot be checked easily 
using model property validation attributes.
*/
function doPageValidation()
{
    ClearValidationErrors();
    var rtnval = true;
    //---check that a security classification has been added
    if ( $( "#secclass" ).children( ':selected' ).val() == "" )
    {
        $( ".validationsummary ul" ).append( "<li>Security Classification must be selected.</li>" );  //display message
        rtnval = false;
    }
    //check that an addressee has been added
    if ( $( ".action div" ).length==0 && $( ".info div" ).length==0  )
    {
        $( ".validationsummary ul" ).append( "<li>At least one addressee must be added.</li>" );
        rtnval = false;
    }
    //check that an action precedence  has been set
    if ( $( ".action div" ).length > 0 && $( "#actionprec" ).children( ':selected' ).val() == "" )
    {
        $( ".validationsummary ul" ).append( "<li>An action precedence must be set</li>" );
        rtnval = false;
    }
    //check that an info precedence  has been set
    if ( $( ".info div" ).length > 0 && $( "#infoprec" ).children( ':selected' ).val() == "" )
    {
        $( ".validationsummary ul" ).append( "<li>An info precedence must be set</li>" );
        rtnval = false;
    }
    //check that an info precedence is less than or equal to action precedence
    if ( $( "#actionprec" ).prop( "selectedIndex" ) < $( "#infoprec" ).prop( "selectedIndex" ) )
    {
        $( ".validationsummary ul" ).append( "<li>The action precedence must greater than or equal to the info precedence.</li>" );
        rtnval = false;
    }
    $(".dtginput").each(function() {
        if ( !validateDTG( $( this ), true ) ) //validateDTG is in message.dtg.js
        {
            $( ".validationsummary ul" ).append( "<li>The value for "+ $(this).attr("data-vn")+" is not a valid datetime</li>" );
            rtnval = false;
        }
    } );

    // validate SIC field rules
    var rtn = validateSics();
    if ( rtn != "" )
    {
        $( ".validationsummary ul" ).append( rtn );
        rtnval = false;
    }

    if( rtnval == false)
    {
        //reset classes to error state and show validation summary
        $(".validationsummary").removeClass("validation-summary-valid");
        $(".validationsummary").addClass("validation-summary-errors");
        $(".validationsummary").css("display", "block");
    }
    //return validation result
    return rtnval;
}

/*
    Check for invalid Sic scenarios and retrun error string to be displayed
*/
function validateSics()
{
    var sicList = $( ".sic div" );
    var ABA = 0;
    var ACA = 0;
    var ADA = 0;
    sicList.each( function ()
    {
        if ( $( this ).text() == "ABA" )
        {
            ABA = 1;
        }
        if ( $( this ).text() == "ACA" )
        {
            ACA = 1;
        }
        if ( $( this ).text() == "ADA" )
        {
            ADA = 1;
        }
    } );
    var rtnstr = "";
    if ( ABA + ACA + ADA > 1 ) //more than 1 special sic is present
    {
        rtnstr = "<li>Only one special SIC (ABA , ACA or ADA ) may be used in a message.</li>" ;
    }

    if ( ABA + ACA + ADA == 1 && sicList.length == 1 ) //a special sic is present without a normal sic
    {
        rtnstr += "<li>If a special SIC (ABA , ACA or ADA ) is present, a normal SIC must also be added.</li>";
    }
    return rtnstr;
}
 
//initialise validation summary UL 
function ClearValidationErrors()
{
    $( ".validationsummary" ).html( "<ul></ul>" );
}
 
//submit form for image clicks
function submitForm()
{
    $( "form#NewMessageForm" ).submit();
}
