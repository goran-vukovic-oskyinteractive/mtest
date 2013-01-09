
// <reference path="jquery-1.7.1.intellisense.js" />
// =================================================
//          %name: message.dtg.js %
//       %version: 3 %
//      Copyright: Copyright 2012 BAE Systems Australia
//                 All rights reserved.
// =================================================


/*
on document ready, assign event handlers and build auto validate on inputs
*/
$(document).ready(function() {
    //cycle through each DTG control on the page
    $( ".dtg" ).each( function ()
    {
        var dtgControl = $(this);
 
        //select all of input on focus event
        $( ".dtginput" ).on( "click", "input[type=text]",
            function ( event )
            {
                $( this ).select();
            } );
        //validate field on blur
        $( ".dtginput" ).blur( function (event)
        {
            var sel = $( event.srcElement );
            if ( !validateDTG( sel ) )
            {
                sel.removeClass( "valid" );
                sel.addClass( "invalid" );
                sel.attr( "title", "The format of this DTG is incorrect." );
            }
            else
            {
                sel.removeClass( "invalid" );
                sel.addClass( "valid" );
            }
            event.stopPropagation();
        });
    });
    

   
} );

//global array used for converting date month index to string month and back;
var monthsArray = ["JAN", "FEB", "MAR", "APR", "MAY", "JUNE",
               "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

//validation of DTG control
//input: object, input control being validated
// pageValid: boolean is page validation call
function validateDTG( input, pageValid )
{
    if ( input.val() == "" )
    {
        return true;
    }
    var inVal = input.val().toUpperCase(); //make sure 
    //regex to match valid DTG format
    var reg = /^(3[0-1]|2[0-9]|1[0-9]|0[1-9])(0[0-9]|1[0-9]|2[0-3])([0-5][0-9])Z\s(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s[0-9]{4}$/;
    if ( reg.test( jQuery.trim( inVal ) ) )
    {
        var daysvalid = checkMonthDayLimit( input );//check number of days is valid
        if ( !daysvalid )
        {
            return false;
        }
        if ( !pageValid ){ 
            var fieldid = input.parent().parent()[0].id.replace( "_dtg", "" );//get id of bound field
            var dtval = getDateTimeOffsetFromDTG( inVal ) //get formatted datetime for vmNewMessage fields
            $( "#" + fieldid ).val( dtval ); //put UTC DateTimeOffset into bound field
        }
        return true;
    }
    return false;
}

/*
Create zulu DateTimeOffset value from DTG string
*/
function getDateTimeOffsetFromDTG( dtgstr )
{    
    // DTG format is:   ddhhmmZ JAN 2012
    //get datetime components from DTG string
    var date = dtgstr.substring( 0, 2 )
    var hour = dtgstr.substring( 2, 4 )
    var min = dtgstr.substring( 4, 6 )
    var mon = dtgstr.substring( 8, 11 )
    var year = dtgstr.substring( 12, 16 )
    //convert text month name to javascript month index
    monthIndex = jQuery.inArray( mon.toUpperCase(), monthsArray ) +1;//convert string month to index
    if ( monthIndex < 10 )
    {
        monthIndex = "0" + monthIndex;
    }
    // need to supply ISO datetime string  has format  YYYY-MM-DDTHH:mm:ss.sssZ  ( .toISOString() doesn't work for unknown reason)
    return year +"-"+ monthIndex +"-"+ date +"T"+ hour + ":" + min + ":00.000Z"; // d.toISOString() //.toString().replace( "UTC+1100", "UTC" );
}

/*
Check that the number of days is within the max for that month and year
*/
function checkMonthDayLimit(  dtgControl )
{
    var monthIndex = -1;
    //get month index from dtg string
    var month= dtgControl.val().substring( 8, 3 );
    if ( month != null )
    {
        monthIndex = jQuery.inArray( month, monthsArray );//convert string month to index
    }
    var yearIndex = -1;
    //get year value from dtg string
    var year = dtgControl.val().substring( 12, 4 )
    if ( year != null )
    {
        yearIndex = parseInt( dtgControl.val().substring( 12, 4 ) )
    }
         
    if ( monthIndex > -1 && year> -1 )
    {//have month and year so we can calculate the maximum date for the month
        var date = parseInt(dtgControl.val().substring( 0, 2 ))
        var daylimit = daysInMonth( monthIndex + 1, year );//monthIndex is zero based so add 1
        
        if ( date > daylimit )
        {
            return false;
        }
    }
    return true;
}

/*
Gets the number of days in a given month and year;
The month passed to the Date constructor is actually 0 based (i.e. 0 is January, 1 is February etc) 
so it is in effect creating a date for the day 0 of the next month. 
Because day 0 equates to the last day of the previous month the number 
returned is effectively the number of days for the month we want.
*/
function daysInMonth( month, year )
{
    return new Date( year, month, 0 ).getDate();
}


/* 
Split the parts of the DTG into the divs in the DTG control
id: id of control to be updated 
utcDate: javascript datetime object 
*/
function writeToDTG( id, utcDate )
{
    var DTG = $( ".dtginput", "#" + id );//get the control to be updated 
    //assign values from date
    var datestr = twoDigits( utcDate.getDate() ).toString() + twoDigits( utcDate.getHours() ).toString() +  twoDigits(utcDate.getMinutes().toString()) + "Z "
                        + monthsArray[utcDate.getMonth()] + " " + utcDate.getFullYear().toString();
    DTG.val( datestr );// put datestr into visible input;
    DTG.removeClass( "invalid" );
    DTG.addClass( "valid" );
    DTG.attr( "title", "" );
    var dtval = getDateTimeOffsetFromDTG( datestr ); //get DateTimeOffset value from string
    $( "#" + id.replace( "_dtg", "" ) ).val( dtval ) //assign DateTimeOffset to hidden bound input
}

//format hours and days and minutes with two digits
function twoDigits( h )
{
    if ( h < 10 )
    {
        return "0" + h;
    }
    return h;
}