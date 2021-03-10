/*** Watch Doc ***/

// Watch the documentation page of a template when you watch the template
// Documentation at [[User:BrandonXLF/WatchDoc]]
// By [[User:BrandonXLF]]

$(function() {
	var namespace = mw.config.get('wgNamespaceNumber'),
		title = mw.config.get('wgPageName'),
		watchlink = $('#ca-watch a, #ca-unwatch a');

	if (namespace !== 10 && namespace !== 11 || title.includes('/doc')) return;

	watchlink.click(function() {
		mw.loader.using('mediawiki.page.watch.ajax').then(function(require) {
			var clone = watchlink.clone().removeClass('loading'),
				oldNotify = mw.notify;

			mw.notify = function(msg, opts) {
				opts.tag += '-doc';
				oldNotify(msg, opts);
			};

			require('mediawiki.page.watch.ajax').watchstar(clone, title + '/doc', function() {
				mw.notify = oldNotify;
			});

			clone.click();
		});
	});
});