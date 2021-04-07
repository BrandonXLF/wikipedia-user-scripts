/*** Update Notification Count ***/

// Updates the alert and notification counts every few seconds
// Documentation at [[User:BrandonXLF/UpdateNotifications]]
// By [[User:BrandonXLF]]

$(function() {
	var worker = new SharedWorker('https://en.wikipedia.org/w/index.php?title=User:BrandonXLF/UpdateNotificationsWorker.js&action=raw&ctype=text/javascript'),
		shownTime = new Date();

	function updateIcon(id, data) {
		$('#' + id + ' a')
			.toggleClass('mw-echo-unseen-notifications', data.latest > data.seen)
			.toggleClass('mw-echo-notifications-badge-all-read', !data.count)
			.attr('data-counter-num', data.count)
			.attr('data-counter-text', data.count);
	}

	worker.port.onmessage = function(e) {
		if (e.data.alert.latest > shownTime || e.data.message.latest > shownTime) {
			shownTime = new Date();
			mw.notify('New notification received!');
		}

		updateIcon('pt-notifications-alert', e.data.alert);
		updateIcon('pt-notifications-notice', e.data.message);

		worker.port.postMessage(true);
	};

	worker.port.postMessage({
		scriptPath: mw.config.get('wgScriptPath'),
		crossWiki: mw.user.options.get('echo-cross-wiki-notifications')
	});
});