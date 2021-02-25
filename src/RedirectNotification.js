/*** Redirect Notification ***/

// Get notified when you are redirected
// Documentation at [[User:BrandonXLF/RedirectNotification]]
// By [[User:BrandonXLF]]

$(function(){
	var p = mw.config.get('wgRedirectedFrom');
	if (p) mw.notify($('<div style="word-break:break-word;">Redirected from "<a href="' + mw.config.get('wgScript') + '?title=' + p + '&redirect=no' + '">' + p.replace(/_/g,' ') + '</a>".</div>'));
});