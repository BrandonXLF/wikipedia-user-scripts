/*** Watch Doc ***/

// Watch the documentation page of a template when you watch the template
// Documentation at [[User:BrandonXLF/WatchDoc]]
// By [[User:BrandonXLF]]

$(function() {
	if (mw.config.get('wgNamespaceNumber') !== 10 && mw.config.get('wgNamespaceNumber') !== 11) return;

	var clone = $('#ca-watch a, #ca-unwatch a').clone();

	mw.loader.using('mediawiki.page.watch.ajax').then(function(require) {
		require('mediawiki.page.watch.ajax').watchstar(clone, mw.config.get('wgPageName') + '/doc', function() {});
		clone.click();
	});
});