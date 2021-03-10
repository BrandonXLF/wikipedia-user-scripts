/*** To Bottom ***/

// Adds a link in the right navagation menu to got to the bottom of the page
// Documentation at [[User:BrandonXLF/ToBottom]]
// By [[User:BrandonXLF]]

// window.arrow = 'never'   ; To always see Bottom
// window.arrow = 'always'  ; To always see ↓ (down arrow)
// window.arrow = 'hybrid'  ; To see ↓ (down arrow) normally and Bottom when in menu (default)

$(function() {
	$(mw.util.addPortletLink(
		'p-views',
		'#',
		window.arrow == 'never' ? 'Bottom' : window.arrow == 'always' ? '↓' : '',
		'ca-bottom',
		null,
		null,
		'.mw-watchlink'
	)).addClass('collapsible').click(function(e) {
		e.preventDefault();
		$('html, body').animate({scrollTop: $(document).height()});
	});

	if (window.arrow != 'never' && window.arrow != 'always') {
		mw.util.addCSS('#ca-bottom a:before{content:\'↓\';}#p-cactions #ca-bottom a:before{content:\'Bottom\';}');
	}
});