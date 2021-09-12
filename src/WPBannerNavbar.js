mw.hook('wikipage.content').add(function(content) {
	var headers = content.find('.wpb .wpb-header');

	function addNavbar() {
		headers.each(function() {
			var header, template, title, view, discuss, edit, navbar;

			header = $(this);
			template = header.next().find('.wpb-banner_name').text();

			if (!template) {
				return;
			}

			try {
				title = new mw.Title(template);
			} catch (e) {
				return;
			}

			view = mw.config.get('wgArticlePath').replace('$1', encodeURIComponent(template));
			discuss = mw.config.get('wgArticlePath').replace('$1', encodeURIComponent(title.getTalkPage().getPrefixedDb()));
			edit = mw.config.get('wgScript') + '?action=edit&title=' + encodeURIComponent(template);

			navbar = $('<div class="navbar plainlinks hlist navbar-mini" style="float:right;">').append(
				$('<ul>').append(
					$('<li class="nv-view">').append($('<a>')
						.attr('href', view)
						.append('<abbr title="View this template">v</attr>')
					),
					$('<li class="nv-talk">').append($('<a>')
						.attr('href', discuss)
						.append('<abbr title="Discuss this template">t</attr>')
					),
					$('<li class="nv-edit">').append($('<a class="external text">')
						.attr('href', edit)
						.append('<abbr title="Edit this template">e</attr>')
					)
				)
			);

			if (header.css('display') === 'none') {
				header.next().find('> :first-child .mbox-text').first().prepend(navbar).children().css('clear', 'both');
				navbar.css('margin-right', '1px');
				return;
			}

			header.find('> :nth-child(2)').append(navbar);
			navbar.css('margin', '.15em .5em 0 0');
		});
	}

	if (headers.length !== 0) {
		var link = document.createElement('link');

		link.setAttribute('rel', 'stylesheet');
		link.setAttribute('href', 'https://en.wikipedia.org/wiki/Module:Navbar/styles.css?action=raw&ctype=text/css');
		link.addEventListener('load', addNavbar);

		document.head.appendChild(link);
	}
});