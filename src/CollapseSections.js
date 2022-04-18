/*** Collapse sections ***/

// Adds an arrow to sections to make them collasible
// Documentation at [[en:w:User:BrandonXLF/CollaspeSections]]
// By [[en:w:User:BrandonXLF]]

// window.collapseSections - Set to true to collapse all sections by default

mw.hook('wikipage.content').add(function(content) {
	if (mw.config.get('skin') === 'minerva') return;

	mw.util.addCSS('[class*="hide-sec"]{display:none!important}');

	content.find('.mw-parser-output :header:has(*)').each(function() {
		var level = +this.nodeName[1],
			heading = $(this),
			icon = $('<i class="mw-ui-icon-before mw-ui-icon-small mw-ui-icon mw-ui-icon-collapse" style="margin-left:-0.8em;"></i>');

		icon.click(function() {
			var levelMatch = 'h1';
			for (var i = 2; i <= level; i++) levelMatch += ',h' + i + ':has(*)';

			icon.toggleClass('mw-ui-icon-collapse');
			icon.toggleClass('mw-ui-icon-expand');
			heading.nextUntil(levelMatch).toggleClass('hide-sect-h' + level);
		});

		if (window.collapseSections) icon.click();
		heading.prepend(icon);
	});
});

mw.loader.load(['mediawiki.ui.icon', 'oojs-ui.styles.icons-movement']);
mw.util.addCSS('[class*="hide-sec"]{display:none!important}');