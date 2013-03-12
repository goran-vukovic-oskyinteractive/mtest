/***
OSKY INTERACTIVE
RYAN HARNE
11 MAR 2013
BAE - Distribution Management
**/
//simple sort & order snippet - can't extent library - IE not supported :-|
function sort_and_unique( my_array ) {
    my_array.sort();
    for ( var i = 1; i < my_array.length; i++ ) {
        if ( my_array[i] === my_array[ i - 1 ] ) {
                    my_array.splice( i--, 1 );
        }
    }
    return my_array;
};


$(document).ready(function(){

	/**
	SELECT MESSAGE
	**/
	//clean
	$('#dm-msg-selc-email-list #listContainer #messageList .offsetCont .message').removeClass('selected').css('cursor','pointer');

	var ruleVirSelectedMessages = new Array();

	//select multiple - data collective + distinct collection
	$('#dm-msg-selc-email-list #listContainer #messageList .offsetCont .message').live('click', function(event){
		event.preventDefault();		
		var tempVal = $(this).find('.msg_id_ref');
		if( (tempVal != undefined) && ( $(tempVal).html() != '') )
		{
			var thisID = $(this).attr('id');
			if($(this).hasClass('selected'))
			{				
				delete ruleVirSelectedMessages[thisID];
				$(this).removeClass('selected');
			}
			else
			{				
				tempVal = eval($(tempVal).html());
				$(tempVal).each(function(tvl_ind, tvl_val){
					if(ruleVirSelectedMessages[thisID] == undefined)
					{
						ruleVirSelectedMessages[thisID] = new Array();
					}
					ruleVirSelectedMessages[thisID][ruleVirSelectedMessages[thisID].length]	 = tvl_val;				
				});
				$(this).addClass('selected');
			}
		}
	});

	//process all data the close  + distinct collection
	$('#dm-msg-selc-email-list #listContainerSubmit .button a').live('click', function(event){
		event.preventDefault();

		//SIC RESET
		$('#dm-msg-selc-email-list #listContainer #messageList .offsetCont .message').removeClass('selected').css('cursor','pointer');
		$('.sic-table .sic.action, .sic-table .sic.info').removeClass('highlight');

		var selectedMsgRule = new Array();

		var keys = [];
		for(var k in ruleVirSelectedMessages) { keys.push(k); };

		if(keys.length > 0)
		{
			$(keys).each(function(k_ind, k_val){
				tempKeys = ruleVirSelectedMessages[k_val];
				$(tempKeys).each(function(tk_ind, tk_val){
					if(selectedMsgRule[tk_val[0]] == undefined)
					{
						selectedMsgRule[tk_val[0]] = new Array();			
					}
					selectedMsgRule[tk_val[0]][selectedMsgRule[tk_val[0]].length] = tk_val[1];
				});
			});
			
			$(selectedMsgRule).each(function(k_ind, k_val){
				if(k_val != undefined)
				{
					var sndRule = sort_and_unique(k_val);
					
					//starts loop all elements + apply highlights
					$('.sic-table .sic-info, .sic-table .sic-action').each(function(dom_ind, dom_dat){
						var tempVals = eval( $(dom_dat).html() );

						if(tempVals.length > 0)
						{
							//loop nested array
							$(tempVals).each(function(tv_ind, tv_set){
								//validate rule / match
								if(
									(tv_set[0] == k_ind)
									&&
									($.inArray(tv_set[1], sndRule) !== -1)
								)
								{
									if(!$(dom_dat).parent('td').hasClass('highlight'))
									{
										$(dom_dat).parent('td').addClass('highlight'); //debug
									}
								}
							});
						}
						
					});				
				}
			});
		}
		ruleVirSelectedMessages = new Array();
		$.colorbox.close();
		$("#email-list, #email-content").getNiceScroll().remove();	
	});

	//modal integration
	$('a.popup-inline[href="#dm-msg-selc-email-list"]').colorbox({
		inline:true,
		width:"700px",
		onComplete: (function(){ 
						var height = $(window).height() - (184 + 50); //functions.js:22 + submit button 50
						$('#dm-msg-selc-email-list #listContainer').css('height', height + 'px');
					})
	});

	/**
	SELECT FIELD
	**/

	var labels_types = ['', 'SIC', 'PRIVACY MARKING'];
	var labels_methods = ['', '=',  'starts with'];

	$(".popup-inline.select-field-button").colorbox({inline:true,width:"700px"});

	$('.popup-inline.select-field-button').live('click', function(event){
		event.preventDefault();
		$('#sic-select-field #sic-list').html('');
	});

	$('#sic-select-field .btn-plus').live('click', function(event) {
		event.preventDefault();
		var template = ''
		template = $('#sic-select-field').find('.section:hidden .inner').html();
		$(this).parent('.btn-add').siblings('#sic-list').append(template);
	});

	$('#sic-select-field .btn-minus').live('click', function(event) {
		event.preventDefault();
		$(this).parent('.btn-add').parent('.col-wrap').remove();
	});

	$('#sic-select-field #popup-sic-save').unbind('click');
	$('#sic-select-field #popup-sic-save').live('click', function(event){
		var continuety = true;
		var rules = new Array();
		var matches = new Array();
		var names = new Array();
		var typeX = '';

		event.preventDefault();
		$('#sic-select-field input, #sic-select-field select').css('background', '');

		var type = $('#sic-select-field select#sic-type').val();
		if( (type == '') || (type == 0) )
		{
			continuety = false;
		}
		else
		{
			//dm.js::138
			switch(type)
			{
				case 1:
				case '1':
					typeX = 'info';
				break;

				case 2:
				case '2':
					typeX = 'action';
				break;
			}
		}

		var maxLoop = $('#sic-select-field #sic-list .col-wrap').length;
		if(maxLoop < 1)
		{
			alert('Please enter a filter');
		}
		else
		{
			$('#sic-select-field #sic-list .col-wrap').each(function(set_ind, set_doms){
				var rule = $(set_doms).find('.col select.rule').val();
				rule = ( (rule == '') || (rule == 0) ? null : rule );

				var match = $(set_doms).find('.col select.match').val();
				match = ( (match == '') || (match == 0) ? null : match );	

				var name = $(set_doms).find('.col input.name').val();
				name = ( (name == '') || (name == 0) ? null : name );		

				if(!((rule != null) && (match != null) && (name != null)))
				{
					if(rule == null){ $(set_doms).find('.col select.rule').css('background', 'red'); }
					if(match == null){ $(set_doms).find('.col select.match').css('background', 'red'); }
					if(name == null){ $(set_doms).find('.col input.name').css('background', 'red'); }
					continuety = false;
				}
				else
				{
					rules[rules.length] = rule;					
					matches[matches.length] = match;
					names[names.length] = name;
				}


				//wait for it
				if(maxLoop == (set_ind+1))
				{
					if(continuety)
					{
						//same as above --<
						$('.sic-table .sic-info, .sic-table .sic-action').parent('td').removeClass('highlight');
						
						//starts loop all elements + apply highlights
						$('.sic-table .sic-' + typeX).each(function(dom_ind, dom_dat){
							var tempVals = eval( $(dom_dat).html() );

							if(tempVals.length > 0)
							{
								//loop nested array
								$(tempVals).each(function(tv_ind, tv_set){
									
									//validate rule / match
									$(rules).each(function(rl_ind, rl_val){

										if(
											(tv_set[0] == rl_val)
											&&
											(tv_set[1] == matches[rl_ind])
											&&
											( $(dom_dat).siblings('.sic.rounded').html().indexOf(labels_types[rl_val] + ' ' + labels_methods[matches[rl_ind]]) > 0 )
											&&
											( $(dom_dat).siblings('.sic.rounded').html().toLowerCase().indexOf( names[rl_ind].toLowerCase() ) > 0 )
										)
										{
											if(!$(dom_dat).parent('td').hasClass('highlight'))
											{
												$(dom_dat).parent('td').addClass('highlight');
											}
										}

									});
									
								});
							}
							
						});

						$.colorbox.close();

					}
				}
			});		
		}
	});
});