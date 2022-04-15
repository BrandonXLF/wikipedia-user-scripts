/*** To Bottom ***/

// Adds a link in the right navigation menu to got to the bottom of the page
// Documentation at [[w:User:BrandonXLF/ToBottom]]
// By [[w:User:BrandonXLF]]

// window.arrow = 'never';   // To always see Bottom
// window.arrow = 'always;   // To always see ↓ (down arrow)
// window.arrow = 'hybrid';  // To see ↓ (down arrow) normally and Bottom when in menu (default)

$(function() {
	function scroll(e) {
		e.preventDefault();
		$('html').animate({scrollTop: $(document).height()});
	}

	var mode = 'hybrid';

	if (window.arrow == 'never' || window.arrow == 'always') {
		mode = window.arrow;
	}

	$(mw.util.addPortletLink('p-views', '#', mode == 'never' ? 'Bottom' : '↓', 'ca-to-bottom', null, null, '.mw-watchlink'))
		.addClass('collapsible')
		.click(scroll);

	if (mode == 'hybrid') {
		$(mw.util.addPortletLink('p-views', '#', 'Bottom', 'ca-to-bottom-text', null, null, '.mw-watchlink'))
			.addClass('collapsible')
			.click(scroll);
	}

	if (window.arrow != 'never' && window.arrow != 'always') {
		mw.util.addCSS(
			'#ca-to-bottom { display: initial !important; }' +
			'#ca-to-bottom-text { display: none !important; }' +
			'#p-cactions #ca-to-bottom { display: none !important; }' +
			'#p-cactions #ca-to-bottom-text { display: initial !important; }'
		);
	}
});
