/*** Subpages ***/

// Creates a subpages link in the right navigation area
// Documentation at [[en:w:User:BrandonXLF/Subpages]]
// By [[en:w:User:BrandonXLF]]

$(function() {
	mw.util.addPortletLink(
		'p-cactions',
		mw.config.get('wgArticlePath').replace('$1', 'Special:PrefixIndex/' + encodeURIComponent(mw.config.get('wgPageName')) + '/'),
		'Subpages',
		'subpages',
		'Run the Special:PrefixIndex tool',
		's'
	);
});