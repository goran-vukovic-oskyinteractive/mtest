$(document).ready(function () {
    /**
    email-list-loader
    **/
    var lastId = -1;
    var lastTime = '';
    //var folder = 0;
    var count = 10;
    var mdt = 0;
    var fid = 1;
    var loadedFirst = false;
    if (($('#email-list').length > 0) && (!dummylist)) {
        $('#email-list').bind('scrollstart', function () {
            //console.log('scrollstart fired');
            //$('#buttons .col-wrap .col-left').html($('#buttons .col-wrap .col-left').html() + '<span style="display:block;font-size:9px;color:red;">scrollstart fired</span>');
            setInterval(function () { $('#buttons .col-wrap .col-left span').remove(); }, 5000);
        });

        $('#email-list').bind('scrollstop', function () {
            //console.log('scrollstop fired');
            //$('#buttons .col-wrap .col-left').html($('#buttons .col-wrap .col-left').html() + '<span style="display:block;font-size:9px;color:red;">scrollstop fired</span>');
            setInterval(function () { $('#buttons .col-wrap .col-left span').remove(); }, 5000);
        });

        var labeled = [];
        var dayarray = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
        var montharray = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");

        $.fn.removeLoadingBar = function () {
            $('#email-list .load-bar').remove();
        }

        if ($('#email-list').attr('list') == undefined) {
            $('#email-list').attr('list', '1');
        }

        function error_loading_email(thetype) {
            var pretext = 'Error, failed to load email.';
            switch (thetype) {
                case 'finish':
                    pretext = 'No new email.';
                    break;
            }
            $('#email-list').append('<div class="ajax-msg">' + pretext + '</div>').removeLoadingBar(); ;
        }

        function request_emails(max_dt, folder_id) {
            //alert(folder_id);
            var theCompleteList = '';

            var temp_time = Math.round((new Date()).getTime() / 1000);
            if ($('#email-list div.email').length > 0) {
                temp_time = $('#email-list div.email').last().attr('unix_max');
            }
            else if (max_dt != undefined) {
                temp_time = max_dt;
                labeled = [];
            }

            $('#email-list').append('<div class="load-bar"></div>');
            //alert((new Date()).toLocaleString());
            //alert(document.location.protocol + "//" + window.location.hostname + "/Message/MessageFolder");
            //alert("/Mercury/Message/MessageFolder");
            var ts = (new Date()).toLocaleString();
            var index = ts.indexOf("GMT");
            if (index >= 0)
                ts = ts.substring(0, index);
            //alert(ts);
            $.ajax({
                type: "post",
                data: {
                    fid: folder_id,
                    i: lastId,
                    c: count,
                    tl: lastTime, //last record time
                    tc: ts,
                    o: 1
                },
                //url: document.location.protocol + "//" + window.location.hostname + "/sample/emails.php",
                //url: "/test/data1.json",
                //url: "/Mercury/Message/MessageFolder",
                url: "/Message/MessageFolder",
                //contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                async: true,
                beforeSend: function (xhr) {
                    //$('#email-list').append('<div class="load-bar"></div>');
                },
                success: (function (thedata) {
                    //if (thedata.length > 0)
                    {
                        lastId = thedata.LastId;
                        lastTime = thedata.LastTime
                        theCompleteList += thedata.Html;
                    }
                })
            }).done(function () {
                //alert("done");
                if (theCompleteList.length > 0) {
                    $('#email-list div.email').removeClass('last');
                    $('#email-list').append(theCompleteList).removeLoadingBar();
                    removeScroll();
                    addScroll();

                    if ($('#email-list div.email.last').length > 0) {
                        var exe = ($('#email-list div.email').length >= max_per_page);

                        $('#email-list div.email.last').waypoint(function (event, direction) {
                            if (!exe) {
                                request_emails(max_dt, folder_id);
                                exe = true;
                            }
                            else {
                                var pagination = '';
                                var current_page = parseInt($('#email-list').attr('list'));
                                var number_of_page = 1;

                                $.getJSON('sample/info.php', function (data) {
                                    if (data) {
                                        number_of_page = Math.ceil(data.email_count / max_per_page);

                                        pagination += '<div class="pagination">';

                                        indexer = 1;
                                        while (indexer <= number_of_page) {
                                            pagination += '<span class="nav item' + (indexer == current_page ? ' active' : '') + '">';
                                            pagination += '<a href="#" rel="' + indexer + '">' + indexer + '</a>';
                                            pagination += '</span>';
                                            indexer++;
                                        }
                                        pagination += '</div>';

                                        $('#email-list').append(pagination);

                                        $('#email-list .pagination span.item a').bind('click', function (event) {
                                            if (event.preventDefault) { event.preventDefault() } else { event.stop() };
                                            var max_dt = $('#email-list div.email.last').attr('unix_max');
                                            $('#email-list').html('').attr('list', $(this).attr('rel'));
                                            request_emails(max_dt, folder_id);
                                        });
                                    }
                                });
                            }
                        }, {
                            offset: '100%',
                            context: '#email-list',
                            onlyOnScroll: true,
                            triggerOnce: true
                        });
                        //alert("we have email");
                        //load_email($(this).attr('id'));
                        if (!loadedFirst) {
                            //load the first message content
                            var items = $('#email-list div.email');
                            load_email(items[0].id);
                            loadedFirst = true;

                            //first time loaded only
                            $('#email-list div.email').first().addClass('onFocus');
                        }
                    }
                }
                else {
                    error_loading_email('finish');
                }

            }).fail(function () {
                error_loading_email('fail');
            });
        }

        request_emails(mdt, fid);
    }
    else {
        $('#email-list').html('<div class="date-bar"><h2>Today</h2></div><div id="email0001" class="email unread flash attachment"><div class="email-icon"><span class="icon-status"></span><span class="icon-attachment"></span></div><div class="email-summary"><h3><a href="#">Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit amet, consectetur</a></h3><p class="sender">Peter Rogers</p><p class="date">150347Z FEB 2012</p></div><div class="email-precedence"><span class="icon-precedence"></span></div></div><div id="email0002" class="email unread immediate"><div class="email-icon"><span class="icon-status"></span><span class="icon-attachment"></span></div><div class="email-summary"><h3><a href="#">Lorem ipsum dolor sit amet, consectetur</a></h3><p class="sender">Peter Rogers</p><p class="date">150347Z FEB 2012</p></div><div class="email-precedence"><span class="icon-precedence"></span></div></div><div id="email0003" class="email flash action attachment"><div class="email-icon"><span class="icon-status"></span><span class="icon-attachment"></span></div><div class="email-summary"><h3><a href="#">Lorem ipsum dolor sit amet, consectetur</a></h3><p class="sender">Peter Rogers</p><p class="date">150347Z FEB 2012</p></div><div class="email-precedence"><span class="icon-precedence"></span></div></div><div id="email0004" class="email priority release attachment"><div class="email-icon"><span class="icon-status"></span><span class="icon-attachment"></span></div><div class="email-summary"><h3><a href="#">Lorem ipsum dolor sit amet, consectetur</a></h3><p class="sender">Peter Rogers</p><p class="date">150347Z FEB 2012</p></div><div class="email-precedence"><span class="icon-precedence"></span></div></div><div class="date-bar"><h2>Yesterday</h2></div><div id="email0005" class="email routine action attachment"><div class="email-icon"><span class="icon-status"></span><span class="icon-attachment"></span></div><div class="email-summary"><h3><a href="#">Lorem ipsum dolor sit amet, consectetur</a></h3><p class="sender">Peter Rogers</p><p class="date">150347Z FEB 2012</p></div><div class="email-precedence"><span class="icon-precedence"></span></div></div><div id="email0006" class="email priority release attachment"><div class="email-icon"><span class="icon-status"></span><span class="icon-attachment"></span></div><div class="email-summary"><h3><a href="#">Lorem ipsum dolor sit amet, consectetur</a></h3><p class="sender">Peter Rogers</p><p class="date">150347Z FEB 2012</p></div><div class="email-precedence"><span class="icon-precedence"></span></div></div><div class="load-bar"></div><div class="pagination"><!--span class="nav prev"><a href="#">Previous</a></span--><span class="nav item" rel="1"><a href="#">1</a></span><span class="nav item" rel="2"><a href="#">2</a></span><span class="nav item" rel="3"><a href="#">3</a></span><!--span class="nav next"><a href="#">Next</a></span--></div>');
    }


    function load_email(id) {
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

    if (dummyemail) {
        $('#email-list .email').live('click', function (event) {
            if (event.preventDefault) { event.preventDefault() } else { event.stop() };
            load_email($(this).attr('id'));
        });
    }

    function hide_max_list_applied() {
        $('.max_list_applied').each(function (indexer, dom) {
            hide_max_list_applied_sub(dom);
        });
    }

    function hide_max_list_applied_sub(dom) {
        $(dom).find('li.more').remove();

        has_hidden = false;

        if ($(dom).find('li:not(.more)').length > max_receipient['list_item']) {
            $(dom).find('li:not(.more)').each(function (intIndex, subDom) {
                if ((intIndex + 1) > max_receipient['list_item']) {
                    $(subDom).css('display', 'none');
                    has_hidden = true;
                }
            });
        }

        if (has_hidden) {
            $(dom).append('<li class="more"><a href="#">' + max_receipient['and_more'] + '</a></li>')
        }
    }

    $('.max_list_applied li.more').live('click', function (event) {
        if (event.preventDefault) { event.preventDefault() } else { event.stop() };
        if ($(this).find('a').html() === max_receipient['hide']) {
            hide_max_list_applied_sub($(this).parent('.max_list_applied'));
        }
        else {
            $(this).siblings('li').css('display', 'inline');
            $(this).find('a').html(max_receipient['hide']);
        }
    });

    if ($('.max_list_applied').length > 0) {
        hide_max_list_applied();
    }
    $('.mbx').click(
		function () {
		    //make an ajax call to refresh the folder
		    lastId = -1;
		    lastTime = '';
		    mdt = 0;
		    loadedFirst = false;
		    var fid = $(this).attr("fid")
		    Clean();

		    //alert(fid);
		    request_emails(mdt, fid);
		}
	);

    function Clean() {
        $('#email-list').empty();
    }
});