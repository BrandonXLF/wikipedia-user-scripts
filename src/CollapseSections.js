/*** Collapse sections ***/

// Adds an arrow to sections to make them collasible
// Documentation at [[User:BrandonXLF/CollaspeSections]]
// By [[User:BrandonXLF]]

// window.collapseSections - Set to true to collapse all sections by default

$.when($.ready, mw.loader.using(['oojs-ui-core', 'oojs-ui-windows', 'oojs-ui.styles.icons-movement'])).then(function() {
	if (mw.config.get('skin') === 'minerva') return;

	mw.util.addCSS('[class*="hide-sec"]{display:none!important}');

	function main(level) {
		$('.mw-parser-output h' + level + ':has(*)').each(function() {
			var heading = $(this),
				icon = $('<i class="mw-ui-icon-before mw-ui-icon-small mw-ui-icon mw-ui-icon-collapse" style="margin-left:-0.8em;"></i>');

			icon.click(function() {
				var levelMatch = 'h1';
				for (var i = 2; i <= level; i++) levelMatch += ',h' + i + ':has(*)';

				var sect = heading.nextUntil(levelMatch);

				if (icon.hasClass('mw-ui-icon-collapse')) {
					icon.removeClass('mw-ui-icon-collapse');
					icon.addClass('mw-ui-icon-expand');
					sect.addClass('hide-sect-h' + i);
				} else {
					icon.removeClass('mw-ui-icon-expand');
					icon.addClass('mw-ui-icon-collapse');
					sect.removeClass('hide-sect-h' + i);
				}
			});

			if (window.collapseSections) icon.click();
			heading.prepend(icon);
		});
	}

	for (var i = 1; i < 7; i++) main(i);
});