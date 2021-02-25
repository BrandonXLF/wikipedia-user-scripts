/*** No Redirect Link ***/

// Adds a link to the redirect page that doesn't get redirected
// Documentation at [[User:BrandonXLF/NoRedirect]]
// By [[User:BrandonXLF]]

$(function(){
	$('#mw-content-text .mw-redirect').after(function(){
		return this.href.indexOf('redirect=no') !== -1 || this.href.indexOf('action=') !== -1  || this.href.indexOf('diff=') !== -1  ? '' : '<a href="' + this.href + (this.href.includes('?') ? '&' : '?') + 'redirect=no" title="' + (this.title || this.href) + ' (no redirect)"><sup>(⇨)</sup></a>';
	});
});