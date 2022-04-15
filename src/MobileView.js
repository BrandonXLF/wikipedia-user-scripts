/*** Mobile View ***/

// Adds a link to see the mobile version of a page
// Documentation at [[w:User:BrandonXLF/MobileView]]
// By [[w:User:BrandonXLF]]

$(function() {
	mw.util.addPortletLink(
		'p-tb',
		location.href.replace(/[?&]useformat=[A-Za-z]/g, '') + (location.href.includes('?') ? '&' : '?') + 'useformat=mobile',
		'Mobile view',
		'Mobile view',
		'See the page in the mobile version of the page',
		''
	);
});

//[[Category:Wikipedia scripts]]