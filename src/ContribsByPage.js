/*** Group Contributions By Page ***/

// Groups revisions at Special:Contributions by page
// Documentation at [[w:User:BrandonXLF/ContribsByPage]]
// By [[w:User:BrandonXLF]]

$(function() {
	if (mw.config.get('wgCanonicalSpecialPageName') != 'Contributions') return;
	mw.loader.load(['mediawiki.special.changeslist.enhanced', 'jquery.makeCollapsible.styles', 'mediawiki.icon']);
	var pages = {},
		arrowClass = 'mw-collapsible-toggle mw-collapsible-arrow mw-enhancedchanges-arrow mw-enhancedchanges-arrow-space mw-collapsible-toggle-collapsed';

	$('[data-mw-revid]').each(function() {
		var title = $('.mw-contributions-title', this).attr('title');
		if (!pages[title]) {
			pages[title] = [];
		}
		pages[title].push(this);
	});

	function merge(page) {
		if (pages[page].length > 1) {
			var diff = $('<span class="mw-diff-bytes">'),
				toggle = $('<span class="' + arrowClass + '"></span>').click(function() {
					if (toggle.hasClass('mw-collapsible-toggle-collapsed')) {
						toggle.removeClass('mw-collapsible-toggle-collapsed').addClass('mw-collapsible-toggle-expanded');
						sub.show();
					} else {
						toggle.removeClass('mw-collapsible-toggle-expanded').addClass('mw-collapsible-toggle-collapsed');
						sub.hide();
					}
				}),
				head = $('<li class="multi">').append(
					toggle,
					$('.mw-changeslist-date', pages[page][0]).first().text(),
					' ',
					$('<span class="mw-changeslist-links">').append(
						'<span>' + pages[page].length + ' changes</span>',
						$('.mw-changeslist-history', pages[page][0]).parent().clone().children().text('history').parent()
					),
					' <span class="mw-changeslist-separator"></span> ',
					diff,
					' <span class="mw-changeslist-separator"></span> ',
					$('.newpage', pages[page]).clone(),
					$('.newpage', pages[page]).length ? ' ' : '',
					$('.mw-contributions-title', pages[page][0]).clone(),
					$('.mw-uctop', pages[page][0]).length ? ' ' : '',
					$('.mw-uctop', pages[page][0]).clone(),
					$('.mw-rollback-link', pages[page][0]).length ? ' ' : '',
					$('.mw-rollback-link', pages[page][0]).clone()
				).insertBefore(pages[page][0]),
				sub = $('<ul>').appendTo(head).hide(),
				size = 0;

			for (var i = 0; i < pages[page].length; i++) {
				sub.append(pages[page][i]);
				var idiff = $('.mw-changeslist-diff', pages[page][i]);
				$('.mw-changeslist-history', pages[page][i]).parent().remove();
				idiff.parent().parent().append($('<span>').append(idiff.clone().text('prev')));
				idiff.attr('class', 'mw-changeslist-cur').text('cur');
				idiff.attr('href') && idiff.attr('href', idiff.attr('href').replace('diff=prev', 'diff=cur'));
				size += parseInt($('.mw-diff-bytes', pages[page][i]).text().replace(/,/g, '').replace(/−/g, '-'));
			}

			if (Math.abs(size) > 500) {
				diff.css('font-weight', 'bold');
			}
			if (size === 0) {
				diff.text(size);
				diff.addClass('mw-plusminus-null');
			} else if (size > 0) {
				diff.text('+' + size.toLocaleString());
				diff.addClass('mw-plusminus-pos');
			} else {
				diff.text(size.toLocaleString());
				diff.addClass('mw-plusminus-neg');
			}
		}
	}

	for (var page in pages) merge(page);
});