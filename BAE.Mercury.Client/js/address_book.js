$(document).ready(function () {

    //    function openSubClick(event) {
    //        event.preventDefault();
    //        removeScroll();
    //        var openMe = $(this).next();
    //        var mySiblings = $(this).parent().siblings().find('ul');
    //        var nextSpan = $(this).find('span');
    //        if (openMe.is(':visible')) {
    //            openMe.slideUp('normal', function () { addScroll(); nextSpan.removeClass('open'); });
    //        }
    //        else {
    //            mySiblings.slideUp('normal', function () { addScroll(); });
    //            openMe.slideDown('normal', function () { addScroll(); nextSpan.addClass('open'); });
    //        }
    //    }


    /**
    email-list-loader
    **/
    var lastId = -1;
    var lastTime = '';
    loadSeassions();

    function load_session(id) {
        //get the hidden div from list
        var message_content_id = "#c" + id;
        //alert(message_content_id);
        var cont = $(message_content_id).html();
        var cont1 = $('#email-content').html();
        //alert(cont);
        $('#email-content').prepend('<div class="load-bar-email"></div>');
        $('#email-content div:not(.load-bar-email)').hide();

        $('#email-content').empty();
        $('#email-content').append(cont);
        var theEmail = '';
    }


    function loadSeassions() {
        var i = 5;
        $.ajax({
            type: "post",
            data: {
                sid: 1,
                sort_by_dtg: false,
                sort: false
            },
            url: "/AddressBook/SessionData",
            //contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            async: true,
            beforeSend: function (xhr) {
                //$('#email-list').append('<div class="load-bar"></div>');
            },
            success: (function (thedata) {
                //if (thedata.length > 0)
                {
                    $("#appointments").append(thedata.Html).css('display', 'none');
                    $('.openSub').unbind('click');
                    $('.openSub').bind('click', openSubClick);

                    $('ul#session li.unit.sample-1').click(function (event) {
                        //copy the html over
                        var cont = $('#sample1').html();
                        //alert(cont);
                        $('#session-content').empty();
                        $('#session-content').append(cont);

                        $('#email-content').prepend('<div class="load-bar-email"></div>');
                        $('#email-content div:not(.load-bar-email)').hide();

                        $('#email-content').empty();
                        $('#email-content').append(cont);
                        var theEmail = '';

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


                }
            })
        }).done(function () {
        }).fail(function () {
        });
    }

});

