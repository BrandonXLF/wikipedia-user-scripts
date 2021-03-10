/*** Watch Doc ***/

// Watch the documentation page of a template when you watch the template
// Documentation at [[User:BrandonXLF/WatchDoc]]
// By [[User:BrandonXLF]]

$(function() {
	if (mw.config.get('wgNamespaceNumber') == 10 || mw.config.get('wgNamespaceNumber') == 11) {
		$('#ca-watch a, #ca-unwatch a').click(function() {
			var unwatch = this.parentNode.id == 'ca-unwatch' ? '1' : undefined,
				title = mw.config.get('wgPageName') + '/doc';

			if (title.includes('/doc/doc')) return;

			$.post(mw.config.get('wgScriptPath') + '/api.php', {
				action: 'watch',
				titles: title,
				unwatch: unwatch,
				format: 'json',
				token: mw.user.tokens.get('watchToken')
			}).done(function(a) {
				mw.notify($(
					'<div>"<a href="' +
					mw.util.getUrl(a.watch[0].title) +
					'">' + a.watch[0].title +
					'</a>" and its ' +
					(mw.config.get('wgNamespaceNumber') == 10 ? 'talk page' : 'associated page') +
					' have been ' +
					(unwatch ? 'removed' : 'added') +
					' to your <a href="' +
					mw.util.getUrl('special:watchlist') +
					'">watchlist</a>.</div>'
				), {tag: 'docpagewatch'});
			});
		});
	}
});