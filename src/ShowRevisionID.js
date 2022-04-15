/*** Show Revision ID ***/

// Shows the revison id on history pages
// Documentation at [[w:User:BrandonXLF/ShowRevisionID]]
// By [[w:User:BrandonXLF]]

$(function() {
	if (location.search.includes('action=history') || location.href.includes('Special:Watchlist') || location.href.includes('Special:Contributions')) {
		var items = document.querySelectorAll('li[data-mw-revid]');
		for (var i = 0; i < items.length; i++) {
			items[i].getElementsByClassName('mw-changeslist-date')[0].appendChild(document.createTextNode(' | ' + items[i].getAttribute('data-mw-revid')));
		}
	}
});