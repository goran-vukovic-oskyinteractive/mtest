/// <reference path="jquery-1.7.1.intellisense.js" />
/// <reference path="jquery-ui-1.8.20.js" />
/// <reference path="countdown.js" />
/// <reference path="stringUtility.js" />
// =================================================
//          %name: messageDetails.js %
//       %version: 6 %
//      Copyright: Copyright 2012 BAE Systems Australia
//                 All rights reserved.
// =================================================

//This class encapulates functionality needed to populate the content of, and control javascript for, the Message Details view.
var messageDetails = {
    
    // Applies the given html into the main container div 
    // and initiates any javascript functionality needed for this section of the page.
    // It's not possible to simply set up javascript on $(document).ready because 
    // this part of the page is populated AFTER the dom is ready via an ajax call.               
    populateHtml: function (htmlData)
    {
        $("#messageDetails").html(htmlData);  
        
        this.checkDisplayOfExpandLinks();
        this.applyCountdowns();
        
        // Expand the 'From' field
        $(".from .expand").click(function (event) {
            event.preventDefault();
            
            $(".from .more").stop().toggleClass("hide");
            $(".from .expand").stop().toggleClass("down");
        });
        
        // Expand the Action/Info fields 
        // Works differently to the 'From' field because hide/show isn't all or nothing here. It's all or *some*
        $(".expand-arrow").click(function (event) {
            event.preventDefault();
            
            var expandableElementId = $(this).attr("data-expands");
            if(expandableElementId)
            {
                var expandableElement = $('#'+ expandableElementId);
                if (expandableElement)
                {
                    $(expandableElement).stop().toggleClass("expanded");
                }
                                
                $(this).stop().toggleClass('down');
            }           
        });        
    },
    
    // For the addressee lists being we wish to display a 'show more'
    // link/button if there are more addressees than initially fits in the container.
    checkDisplayOfExpandLinks: function ()
    {
        var thisObj = this; //avoid issue with using 'this' inside jQuery 'each()' method.
        $(".expand-arrow").each(function() {
            var expndableElementId = $(this).attr("data-expands");
            if (expndableElementId)
            {
                var expandableElement = $('#' + expndableElementId);

                if (expandableElement)
                {
                    var isOverflowing = thisObj.checkVerticalOverflow(expandableElement);
                    if (isOverflowing)
                    {
                        $(this).show();
                    }
                    else
                    {
                        $(this).hide();
                    }
                }
            }
        });
    },
    
    // Determines if the passed element is overflowing its bounds vertically.    
    checkVerticalOverflow: function (el)
    {
        var clientHeight = $(el).prop('clientHeight');
        var scrollHeight = $(el).prop('scrollHeight');

        var isOverflowing = clientHeight < scrollHeight;

        return isOverflowing;
    },
    
    // Attaches a timer countdown for those fields that are needed to show countdowns
    applyCountdowns: function ()
    {        
        $(".countdownItem").each(function () {
            
            var countDownItem = $(this);
            var timeSpanExpiresInMilliseconds =  parseInt(countDownItem.attr('data-expires-milliseconds'));
            var currentTime = new Date().getTime();
            var expiryTime = currentTime + timeSpanExpiresInMilliseconds;
            var timeExpired = false;
            
            if (expiryTime)
            {
                
                if (expiryTime == currentTime)
                {
                    timeExpired = true;
                }
                
                if (!timeExpired) {

                    // set up a countDown for this field. Countdown object will fire given callback periodically.
                    countDownItem.countdown({
                        timestamp: expiryTime,
                        callback: function (days, hours, minutes, seconds) {

                            var message = "";
                            message += "(" + pad(days,2) + ":";
                            message += pad(hours,2) + ":";
                            message += pad(minutes,2) + ":";
                            message += pad(seconds,2) + " from now)";

                            countDownItem.html(message);
                        }
                    });

                } else
                {
                    countDownItem.html('(Expired)');
                }
            }                                    
        });
    }
};



