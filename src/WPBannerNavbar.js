mw.hook('wikipage.content').add(function(content) {
	var headers = content.find('.wpb .wpb-header');
	
	if (!headers.length) return;
	
	var wikitext = '',
		ids = {};
	
	headers.each(function(i) {
		var header = $(this),
			template = header.next().find('.wpb-banner_name').text(),
			id = 'banner-navbar-' + i;
			
		if (!template) return;
			
		wikitext += '<div id="' + id + '">{{Navbar|' + template + '|mini=y}}</div>';
		ids[id] = header;
	});
	
	new mw.Api().parse(wikitext).then(function(html) {
		var container = document.createElement('div');
		container.innerHTML = html;
		document.body.append(container);
		
		$.each(ids, function(id, header) {
			var navbar = $('#' + id).children();
			
			navbar.css('float', 'right');
			
			if (header.css('display') === 'none') {
				header.next().find('> :first-child .mbox-text').first().prepend(navbar);
				return;
			}
	
			header.find('> :nth-child(2)').append(navbar);
			navbar.css('margin', '.15em .5em 0 0');
		});
	});
});