/*** Redirect Notification ***/

// Get notified when you are redirected
// Documentation at [[User:BrandonXLF/RedirectNotification]]
// By [[User:BrandonXLF]]

$(function() {
	var redirectedFrom = mw.config.get('wgRedirectedFrom');

	if (redirectedFrom) mw.notify($(
		'<div style="word-break:break-word;">Redirected from "<a href="' +
		mw.config.get('wgScript') +
		'?title=' + redirectedFrom + '&redirect=no' +
		'">' +
		redirectedFrom.replace(/_/g, ' ') +
		'</a>".</div>'
	));
});