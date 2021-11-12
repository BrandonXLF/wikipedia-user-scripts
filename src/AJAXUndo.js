/*** AJAX Undo ***/

// Adds a button to undo changes using AJAX to history pages
// Documentation at [[User:BrandonXLF/AJAXUndo]]
// By [[User:BrandonXLF]]

$(function() {
	if (mw.config.get('wgAction') == 'history') {
		$('.mw-history-undo').parent().after(
			$('<span>').append(
				$('<a>')
					.text('ajax undo')
					.click(function() {
						var el = $(this),
							undoLink = el.closest('.mw-changeslist-links').find('.mw-history-undo a').attr('href');

						el.addClass('ajax-undo-loading');

						new mw.Api().postWithEditToken({
							action: 'edit',
							undoafter: undoLink.match(/undoafter=([0-9]+)/)[1],
							undo: undoLink.match(/undo=([0-9]+)/)[1],
							title: mw.config.get('wgPageName'),
						}).then(
							function() {
								mw.notify('Edit undone successfully! Reloading...');
								location.reload();
							},
							function(_, data) {
								mw.notify(new mw.Api().getErrorMessage(data), {
									type: 'error'
								});
								el.removeClass('ajax-undo-loading');
							}
						);
					})
			)
		);
	}

	mw.loader.addStyleTag(
		'@keyframes ajax-undo-loading {' +
		'0%, 100% {content: " ⡁"} 16% {content: " ⡈"} 33% {content: " ⠔"} 50% {content: " ⠒"} 66% {content: " ⠢"} 83% {content: " ⢁"}}' +
		'.ajax-undo-loading::after {white-space: pre; content: ""; animation: ajax-undo-loading 0.5s infinite}'
	);
});