/*** No Redirect Link ***/

// Adds a link beside links to redirects that doesn't get redirected
// Documentation at [[User:BrandonXLF/NoRedirect]]
// By [[User:BrandonXLF]]

mw.hook('wikipage.content').add(function(content) {
	content.find('.mw-redirect')
		.filter(function() {
			return this.href.indexOf('redirect=no') == -1 &&
				this.href.indexOf('oldid=') == -1 &&
				this.href.indexOf('diff=') == -1 &&
				(this.href.indexOf('action=') == -1 || this.href.indexOf('action=view') != -1);
		})
		.after(function() {
			return $('<a>')
				.attr('href', this.href + (this.href.includes('?') ? '&' : '?') + 'redirect=no')
				.attr('title', this.title + ' (no redirect)')
				.css('cssText', 'margin-left: 1px; user-select: none;')
				.append(
					$('<img>')
						.attr('alt', 'no redirect')
						.attr('src', 'data:image/svg+xml,<svg%20xmlns%3D"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg"%20width%3D"16"%20height%3D"14"%20viewBox%3D"0%200%2016%2014"%20version%3D"1.1"><path%20d%3D"m%201%2C0%20v%208.5%20c%200%2C1.04%201.02%2C1.98%202.02%2C1.98%20h%206%20l%203%2C0.02"%20style%3D"fill%3Anone%3Bstroke%3A%23000000%3Bstroke-width%3A2%3B"%2F><path%20d%3D"m%209.5%2C7%200.02%2C7%206.5%2C-3.5%20z"%20id%3D"path4"%2F><%2Fsvg>')
						.css('cssText', 'height: 0.6em !important; vertical-align: text-top;')
				);
		});
});