$(document).ready(function() {
	/**
	email-list-loader
	**/	
	if( ( $('#email-list').length > 0 ) && (!dummylist) )
	{
		$('#email-list').bind('scrollstart', function(){
            //console.log('scrollstart fired');
            $('#buttons .col-wrap .col-left').html($('#buttons .col-wrap .col-left').html() + '<span style="display:block;font-size:9px;color:red;">scrollstart fired</span>');
            setInterval(function(){$('#buttons .col-wrap .col-left span').remove();}, 5000);
		});

		$('#email-list').bind('scrollstop', function(){
		    //console.log('scrollstop fired');
		    $('#buttons .col-wrap .col-left').html($('#buttons .col-wrap .col-left').html() +  '<span style="display:block;font-size:9px;color:red;">scrollstop fired</span>');
		    setInterval(function(){$('#buttons .col-wrap .col-left span').remove();}, 5000);
		});

		var labeled = [];
		var dayarray= new Array("Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
		var montharray= new Array("January","February","March","April","May","June","July","August","September","October","November","December");

		$.fn.removeLoadingBar = function() { 
		    $('#email-list .load-bar').remove();
		}

		if( $('#email-list').attr('list') == undefined )
		{
			$('#email-list').attr('list', '1');
		}

		function error_loading_email(thetype)
		{
			var pretext = 'Error, failed to load email.';
			switch(thetype)
			{
				case 'finish':
					pretext = 'No new email.';
				break;
			}
			$('#email-list').append('<div class="ajax-msg">' + pretext + '</div>').removeLoadingBar();;
		}

		function request_emails(max_dt)
		{
			var theCompleteList = '';

			var temp_time = Math.round((new Date()).getTime() / 1000);
			if( $('#email-list div.email').length > 0 )
			{
				temp_time = $('#email-list div.email').last().attr('unix_max');
			}
			else if(max_dt != undefined)
			{
				temp_time = max_dt;
				labeled = [];
			}

			$('#email-list').append('<div class="load-bar"></div>');
			$.ajax({
				type: "GET",
				data: { 
						c: per_request, 
						t: temp_time,
						time: Math.round((new Date()).getTime() / 1000) 
					},
				url: document.location.protocol + "//" + window.location.hostname + "/sample/emails.php",
				dataType: 'json',
				async: true,
				beforeSend: function (xhr) {
					//$('#email-list').append('<div class="load-bar"></div>');
				},
				success: (function(thedata)
				{
					if(thedata.length > 0)
					{	
						for (var i = 0; i < thedata.length; i++)
						{
							var nowdt = new Date;
							var dt = new Date(thedata[i].received*1000);
							var dtid_format =  "" + dt.getFullYear() + (dt.getMonth()+1) + dt.getDate();

							if(($('.dlabel_' + dtid_format).length < 1) && ($.inArray(dtid_format, labeled) < 0))
							{
								labeled[labeled.length] = dtid_format;
								if(
									(nowdt.getDate() == dt.getDate())
									&&
									(nowdt.getMonth() == dt.getMonth())
									&&
									(nowdt.getFullYear() == dt.getFullYear())
								)
								{
									theCompleteList +='<div class="date-bar dlabel_' + dtid_format + '">';
										theCompleteList +='<h2>Today</h2>';
									theCompleteList +='</div>';
								}
								else
								{
									theCompleteList +='<div class="date-bar">';
										theCompleteList +='<h2>' 
												+ dayarray[dt.getDay()] + ', ' 
												+ dt.getDate() + ' ' 
												+ montharray[dt.getMonth()] + ' ' 
												+ dt.getFullYear() + '</h2>';
									theCompleteList +='</div>';
								}
							}

							theCompleteList +='<div id="email' + thedata[i].received + '" class="email ' 
													+ thedata[i].action + ' ' 
													+ thedata[i].precedence 
													+ (thedata[i].read ? '' : ' unread ')
													+ (thedata[i].attachment ? ' attachment ' : '')
													+ (thedata[i].private ? ' release ' : '')
													+ ((thedata.length - 1) == i ? ' last ' : '')
													+ '" unix_max="' + thedata[i].received + '">';
								theCompleteList +='<div class="email-icon"><span class="icon-status"></span><span class="icon-attachment"></span></div>';
								theCompleteList +='<div class="email-summary">';
									theCompleteList +='<h3><a href="#">' + thedata[i].title + '</a></h3>';
									theCompleteList +='<p class="sender">' + thedata[i].from + '</p>';
									theCompleteList +='<p class="date">' + thedata[i].dtg + '</p>';
								theCompleteList +='</div>';
								theCompleteList +='<div class="email-precedence"><span class="icon-precedence"></span></div>';
							theCompleteList +='</div>';
						}	
					}					
				})
			}).done(function(){ 
				if(theCompleteList.length > 0)
				{
					$('#email-list div.email').removeClass('last');
					$('#email-list').append(theCompleteList).removeLoadingBar();
					removeScroll();
					addScroll();

					if($('#email-list div.email.last').length > 0)
					{
						var exe = ($('#email-list div.email').length >= max_per_page);
						
						$('#email-list div.email.last').waypoint(function(event, direction) {
							if(!exe)
							{
								request_emails();
								exe = true;
							}
							else
							{
								var pagination = '';
								var current_page = parseInt($('#email-list').attr('list'));
								var number_of_page = 1;
								
								$.getJSON('sample/info.php', function(data) {
  									if(data)
  									{
  										number_of_page = Math.ceil( data.email_count / max_per_page );

  										pagination += '<div class="pagination">';

  										indexer = 1;
  										while(indexer <= number_of_page)
  										{
  											pagination += '<span class="nav item' + (indexer == current_page ? ' active' : '')  + '">';
												pagination += '<a href="#" rel="' + indexer + '">' + indexer + '</a>';
											pagination += '</span>';
  											indexer++;
  										}											
										pagination += '</div>';

										$('#email-list').append(pagination);

										$('#email-list .pagination span.item a').bind('click', function(event){
											if(event.preventDefault){event.preventDefault()}else{event.stop()};
											var max_dt = $('#email-list div.email.last').attr('unix_max');
											$('#email-list').html('').attr('list', $(this).attr('rel'));
											request_emails(max_dt);
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
					}
				}
				else
				{
					error_loading_email('finish');					
				}

			}).fail(function(){
				error_loading_email('fail');
			});	
		}

		request_emails();
	}
	else
	{
		$('#email-list').html('<div class="date-bar"><h2>Today</h2></div><div id="email0001" class="email unread flash attachment"><div class="email-icon"><span class="icon-status"></span><span class="icon-attachment"></span></div><div class="email-summary"><h3><a href="#">Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit amet, consectetur</a></h3><p class="sender">Peter Rogers</p><p class="date">150347Z FEB 2012</p></div><div class="email-precedence"><span class="icon-precedence"></span></div></div><div id="email0002" class="email unread immediate"><div class="email-icon"><span class="icon-status"></span><span class="icon-attachment"></span></div><div class="email-summary"><h3><a href="#">Lorem ipsum dolor sit amet, consectetur</a></h3><p class="sender">Peter Rogers</p><p class="date">150347Z FEB 2012</p></div><div class="email-precedence"><span class="icon-precedence"></span></div></div><div id="email0003" class="email flash action attachment"><div class="email-icon"><span class="icon-status"></span><span class="icon-attachment"></span></div><div class="email-summary"><h3><a href="#">Lorem ipsum dolor sit amet, consectetur</a></h3><p class="sender">Peter Rogers</p><p class="date">150347Z FEB 2012</p></div><div class="email-precedence"><span class="icon-precedence"></span></div></div><div id="email0004" class="email priority release attachment"><div class="email-icon"><span class="icon-status"></span><span class="icon-attachment"></span></div><div class="email-summary"><h3><a href="#">Lorem ipsum dolor sit amet, consectetur</a></h3><p class="sender">Peter Rogers</p><p class="date">150347Z FEB 2012</p></div><div class="email-precedence"><span class="icon-precedence"></span></div></div><div class="date-bar"><h2>Yesterday</h2></div><div id="email0005" class="email routine action attachment"><div class="email-icon"><span class="icon-status"></span><span class="icon-attachment"></span></div><div class="email-summary"><h3><a href="#">Lorem ipsum dolor sit amet, consectetur</a></h3><p class="sender">Peter Rogers</p><p class="date">150347Z FEB 2012</p></div><div class="email-precedence"><span class="icon-precedence"></span></div></div><div id="email0006" class="email priority release attachment"><div class="email-icon"><span class="icon-status"></span><span class="icon-attachment"></span></div><div class="email-summary"><h3><a href="#">Lorem ipsum dolor sit amet, consectetur</a></h3><p class="sender">Peter Rogers</p><p class="date">150347Z FEB 2012</p></div><div class="email-precedence"><span class="icon-precedence"></span></div></div><div class="load-bar"></div><div class="pagination"><!--span class="nav prev"><a href="#">Previous</a></span--><span class="nav item" rel="1"><a href="#">1</a></span><span class="nav item" rel="2"><a href="#">2</a></span><span class="nav item" rel="3"><a href="#">3</a></span><!--span class="nav next"><a href="#">Next</a></span--></div>');
	}

	function load_email(id)
	{
		id = (id == undefined ? 0 : id);

		$('#email-content').prepend('<div class="load-bar-email"></div>');
		$('#email-content div:not(.load-bar-email)').hide();

		var theEmail = '';

		$.ajax({
			type: "GET",
			data: { 
					c: 1, 
					t: Math.round((new Date()).getTime() / 1000),
					id: id,
					time: Math.round((new Date()).getTime() / 1000)
				},
			url: document.location.protocol + "//" + window.location.hostname + "/sample/emails.php",
			dataType: 'json',
			async: true,
			beforeSend: function (xhr) {
				
			},
			success: (function(thedata)
			{
				if(thedata.length > 0)
				{	
					theEmail = thedata;
				}			
			})
		}).done(function(){ 
			if(theEmail.length > 0)
			{
				theEmail = theEmail[0];
				
				/*
				$('#email-content .classification')
											.removeClass('protected')
											.removeClass('confidential')
											.removeClass('secret')
											.addClass(theEmail.view_level);
				*/

				$('#email-content .subject').html(theEmail.title);
				$('#email-content .detail .from .right').html(theEmail.from);
				$('#email-content .detail .from .originator p span.dtg').html(theEmail.dtg);
				
				$('#email-content .detail .info .precedence p span').removeClass();
				$('#email-content .detail .info .precedence p strong').html('');
				if( (theEmail.precedence != undefined) && (theEmail.precedence != "") )
				{
					$('#email-content .detail .info .precedence p span').addClass(theEmail.precedence);
					$('#email-content .detail .info .precedence p strong').html(ucwords(theEmail.precedence));
				}

				$('#email-content .detail .action .precedence p span').removeClass();
				$('#email-content .detail .action .precedence p strong').html('');
				if( (theEmail.precedence != undefined) && (theEmail.precedence != "") )
				{
					$('#email-content .detail .action .precedence p span').addClass(theEmail.action_plevel);
					$('#email-content .detail .action .precedence p strong').html(ucwords(theEmail.action_plevel));
				}

				$('#email-content .content').html(theEmail.content);

				$('#email-content .detail .action .right ul li').remove();
				if(theEmail.actions_c != undefined)
				{
					for(i=0; i<theEmail.actions_c.length; i++)
					{
						$('#email-content .detail .action .right ul').append('<li class="' 
																					+ theEmail.actions_c[i].class1 + ' ' 
																					+ theEmail.actions_c[i].class2
																					+ '"><a href="#"><span class="icon"></span>' 
																					+ theEmail.actions_c[i].title 
																					+ '</a></li>');
					}

					hide_max_list_applied();
				}

				$('#email-content .detail .info .right ul li').remove();
				if(theEmail.info_c != undefined)
				{
					for(i=0; i<theEmail.info_c.length; i++)
					{
						$('#email-content .detail .info .right ul').append('<li class="' 
																					+ theEmail.info_c[i].class1 + ' ' 
																					+ theEmail.info_c[i].class2  
																					+ '"><a href="#"><span class="icon"></span>' 
																					+ theEmail.info_c[i].title 
																					+ '</a></li>');
					}

					hide_max_list_applied();
				}

				$('#email-content .attachment ul li').remove();
				$('#email-content .attachment .attachments').hide();
				if( (theEmail.download != undefined) )
				{
					for(i=0; i<theEmail.download.length; i++)
					{
						$('#email-content .attachment ul').append('<li><a href="#">' 
																+  theEmail.download[i].name  
																+ ' <span class="size">' 
																+ theEmail.download[i].size 
																+ '</span></a></li>');
					}

					$('#email-content .attachment .attachments').show();
				}

				$('#email-content div:not(.attachments)').show();	
				removeScroll();
				addScroll();			
			}
			else
			{
				$('#email-content').html('');
				//error_loading_email('finish');
			}
			$('#email-content .load-bar-email').remove();

		}).fail(function(){
			$('#email-content').html('');
			error_loading_email('fail');
			$('#email-content .load-bar-email').remove();
		});	

	}

	if(dummyemail)
	{
		$('#email-list .email').live('click', function(event){
			if(event.preventDefault){event.preventDefault()}else{event.stop()};
			load_email( $(this).attr('id') );
		});	
	}

	function hide_max_list_applied()
	{
		$('.max_list_applied').each(function(indexer, dom){
			hide_max_list_applied_sub(dom);			
		});
	}

	function hide_max_list_applied_sub(dom)
	{
		$(dom).find('li.more').remove();	

		has_hidden = false;
		
		if( $(dom).find('li:not(.more)').length > max_receipient['list_item'] )
		{
			$(dom).find('li:not(.more)').each(function(intIndex, subDom){
				if((intIndex + 1) > max_receipient['list_item'])
				{
					$(subDom).css('display', 'none');
					has_hidden = true;
				}
			});	
		}
		
		if(has_hidden)
		{
			$(dom).append('<li class="more"><a href="#">' + max_receipient['and_more'] + '</a></li>')				
		}
	}
		
	$('.max_list_applied li.more').live('click', function(event){
		if(event.preventDefault){event.preventDefault()}else{event.stop()};
		if( $(this).find('a').html() === max_receipient['hide'])
		{
			hide_max_list_applied_sub($(this).parent('.max_list_applied'));		
		}
		else
		{
			$(this).siblings('li').css('display', 'inline');
			$(this).find('a').html(max_receipient['hide']);		
		}			
	});

	if( $('.max_list_applied').length > 0 )
	{
		hide_max_list_applied();
	}
});