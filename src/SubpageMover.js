/*** Subpage Mover ***/

// Easily move the subpages of a page with a single click
// Documention at [[User:BrandonXLF/SubpageMover]]
// By [[User:BrandonXLF]]

$(function() {
	function moveSubpages() {
		var allowed = false;
		$.each(mw.config.get('wgUserGroups'), function(i,v) {
			if (v == 'extendedconfirmed') {
				allowed = true;
				var from = $('input[name=wpOldTitle]').val();
		    	var to_ns = mw.config.get('wgFormattedNamespaces')[$('select[name=wpNewTitleNs]').val()].replace(' ','_');
		    	var to_page = $('input[name=wpNewTitleMain]').val();
		    	var to = (to_ns === '' ? to_page : to_ns + ':' + to_page); 
				var reason = $('input[name=wpReason]').val();
				var talk = $('input[name=wpMovetalk]').prop('checked') ? 'yes' : void 0;
				var watch = $('input[name=wpWatch]').prop('checked') ? 'watch' : void 0;
				$.get( mw.config.get('wgScriptPath') + '/api.php', {
					action: 'query',
					list: 'prefixsearch',
					pssearch: from + '/',
					pslimit: '500',
					format: 'json'
				})
				.done(function(apiQuery){
					$('#moveSubpages-log').remove();
					var log = $('<span>')
						.appendTo($('#movepage'))
						.append('<br /><hr />')
						.attr('id','moveSubpages-log')
					;
					function movePage (from, to, noerror) {
						$.post( mw.config.get('wgScriptPath') + '/api.php', {
							action: 'move',
							from: from,
							to: to,
							reason: reason,
							movetalk: talk,
							watchlist: watch,
							token: mw.user.tokens.get('csrfToken'),
							format: 'json'
						})
						.done(function(response){
							if (response.move) {
								if (response.move['talkmove-errors']) {
									var talkpage = text.match(':') ? from.replace(':',' talk:') : 'Talk:' + from;
									log.append($('<p>').text(talkpage + ' could not be moved.').css('color','red'));
								} else if (response.move.talkfrom) {
									log.append('<p>Successfully moved ' + response.move.talkfrom + ' to ' + response.move.talkto + '.</p>').css('color','green');
								}
							}
							if (response.error) {
								log.append($('<p>').text(from + ' could not be moved.').css('color','red'));
								log.append($('<p>').append('&bull; Reason: ' + response.error.info + '</li>').css('color','red'));
							} else {
								log.append('<p>Successfully moved ' + response.move.from + ' to ' + response.move.to + '.</p>').css('color','green');
								noerror();
							}
						});
					}
					movePage(from, to, function(){
						apiQuery.query.prefixsearch.forEach(function(info){
							if (info.title === from) return;
							movePage(info.title, info.title.replace(from,to));
						});
					});
				});
		    }
		});
		if (!allowed) {
		    mw.notify('You must be at least extended confimed.', {title: 'Cannot move page and subpages', type: 'error'});
		}
	}
	if (window.location.href.match('Special:MovePage') && ! $("p:contains('This page has no subpages.')")[0] ) {
		var $subpagesButton = new OO.ui.ButtonWidget({
			label:'Move page and subpages',
			flags: ['primary','progressive']
		}).$element
			.on('click',moveSubpages)
			.appendTo($('button[name=wpMove]').parent().parent())
		;
	}
});