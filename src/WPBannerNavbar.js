mw.hook('wikipage.content').add(function($content) {
	var headers = $content.find('.wpb .wpb-header');

	headers.each(function() {
		var header = $(this),
			template = header.next().find('.wpb-banner_name').text(),
			talkpage = new mw.Title(template).getTalkPage().toString(),
			view = mw.config.get('wgArticlePath').replace('$1', encodeURIComponent(template)),
			discuss = mw.config.get('wgArticlePath').replace('$1', encodeURIComponent(talkpage)),
			edit = mw.config.get('wgScript') + '?action=edit&title=' + encodeURIComponent(template),
			navbox = $('<div class="navbar plainlinks hlist navbar-mini" style="float:right;">').append(
				$('<ul>').append(
					$('<li class="nv-view">').append($('<a>').attr('href', view).append($('<abbr>').attr('title', 'View this template').text('v'))),
					$('<li class="nv-view">').append($('<a>').attr('href', discuss).append($('<abbr>').attr('title', 'Discuss this template').text('t'))),
					$('<li class="nv-edit">').append($('<a>').attr('href', edit).append($('<abbr>').attr('title', 'Edit this templatee').text('e')))
				)
			);

		if (header.css('display') === 'none') {
			header.next().find('> :first-child .mbox-text').first().prepend(navbox).children().css('clear', 'both');
			navbox.css('margin-right', '1px');
		} else {
			header.find('> :nth-child(2)').append(navbox);
			navbox.css('margin', '.15em .5em 0 0');
		}
	});
});