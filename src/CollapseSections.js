/*** Collaspe sections ***/

// Adds an arrow to sections to make them collasible
// Documentation at [[User:BrandonXLF/CollaspeSections]]
// By [[User:BrandonXLF]]

// window.collaspeSections - Set to true to collaspe all sections by default

$.when($.ready,mw.loader.using(['oojs-ui-core','oojs-ui-windows','oojs-ui.styles.icons-movement'])).then(function(){
	if (mw.config.get('skin') === 'minerva') return;
	mw.util.addCSS('[class*="hide-sec"]{display:none!important}');
	function main (i) {
		$('.mw-parser-output h' + i + ':has(*)').each(function(){
			var heading = $(this);
			var icon = $('<i class="mw-ui-icon-before mw-ui-icon-small mw-ui-icon mw-ui-icon-collapse" style="margin-left:-0.8em;"></i>').click(function(){
				var sect = heading.nextUntil(i == 6 ? 'h1,h2:has(*),h3,h4,h5,h6' : i == 5 ? 'h1,h2:has(*),h3,h4,h5' : i == 4 ? 'h1,h2:has(*),h3,h4' : i == 3 ? 'h1,h2:has(*),h3' : i == 2 ? 'h1,h2:has(*),#toc' : 'h1');
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
			if (window.collaspeSections) icon.click();
			heading.prepend(icon);
		});
	}
	for (var i = 1; i < 7; i++) main(i);
});