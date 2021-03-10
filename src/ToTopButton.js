/*** To Top Button ***/

// Adds a floating "go to top" button on the bottom-right of the screen
// Documentation at [[User:BrandonXLF/TopButton]]
// By [[User:BrandonXLF]]

$(function() {
	mw.loader.load('https://en.wikipedia.org/wiki/User:BrandonXLF/ToTopButton.css?action=raw&ctype=text/css', 'text/css');

	var circle = $('<div>')
		.appendTo('body')
		.addClass('topButtonCircle')
		.on('click', function() {
			$('html, body').animate({scrollTop: 0}, 'slow');
		})
		.append('<div></div>');

	$(window).scroll(function() {
		if ($(window).scrollTop() > 100) {
			circle.fadeIn();
		} else {
			circle.fadeOut();
		}
	});
});