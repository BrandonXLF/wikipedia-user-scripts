/*** AJAX Undo ***/

// Adds a button to undo changes using AJAX to history pages
// Documentation at [[User:BrandonXLF/AJAXUndo]]
// By [[User:BrandonXLF]]

$(function(){
	if (mw.config.get('wgAction') == 'history') {
		$('.mw-history-undo').parent().after($('<span></span>').append($('<a href="#">ajax undo</a>').click(function(){
			var el = $(this);
			var dots = ['.&nbsp;&nbsp;','..&nbsp;','...','.&nbsp;&nbsp;'];
			var dot = '...';
			setInterval(function(){
				dot = dots[dots.indexOf(dot) + 1];
				el.html('undoing' + dot);
			}, 200);
			el.html('undoing...');
			$.post(mw.config.get('wgScriptPath') + '/api.php', {
				action: 'edit',
				undoafter: (/undoafter=([0-9]+)/.exec(el.closest('.mw-changeslist-links').find('.mw-history-undo a').attr('href')))[1],
				undo: (/undo=([0-9]+)/.exec(el.closest('.mw-changeslist-links').find('.mw-history-undo a').attr('href')))[1],
				title: mw.config.get('wgPageName'),
				token: mw.user.tokens.get('csrfToken'),
				format: 'json'
			}).always(function(a,b){
				mw.notify(a == 'error' || b.error ? 'Could not undo edit.' : 'Edit undone sucessfully! Reloading...', {type: a == 'error' || b.error ? 'error' : ''});
				(a != 'error' && !b.error ) && location.reload();
			});
		})));
	}
});