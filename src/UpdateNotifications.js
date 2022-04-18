/*** Update Notifications ***/

// Updates the alert and notification counts every few seconds
// Documentation at [[en:w:User:BrandonXLF/UpdateNotifications]]
// By [[en:w:User:BrandonXLF]]

$(function() {
	var crossWiki = mw.user.options.get('echo-cross-wiki-notifications'),
		shownTime = Date.now();

	function updateIcon(id, data) {
		$('#' + id + ' a')
			.toggleClass('mw-echo-unseen-notifications', data.latest > data.seen)
			.toggleClass('mw-echo-notifications-badge-all-read', !data.count)
			.attr('data-counter-num', data.count)
			.attr('data-counter-text', data.count);
	}

	function updateCount(status) {
		if (!window.noUpdateNotificationNotice && (status.alert.latest > shownTime || status.message.latest > shownTime)) {
			shownTime = Date.now();
			mw.notify('New notification received!');
		}

		updateIcon('pt-notifications-alert', status.alert);
		updateIcon('pt-notifications-notice', status.message);
	}

	function getData() {
		new mw.Api().get({
			action: 'query',
			format: 'json',
			meta: 'notifications',
			notprop: 'list|count|seenTime',
			notlimit: 1,
			notgroupbysection: true,
			notalertunreadfirst: true,
			notmessageunreadfirst: true,
			notcrosswikisummary: crossWiki
		}).then(function(res) {
			var info = res.query.notifications,
				status = {
					alert: {
						seen: Date.parse(info.alert.seenTime),
						latest: info.alert.list[0].timestamp.utcunix,
						count: info.alert.rawcount
					},
					message: {
						seen: Date.parse(info.message.seenTime),
						latest: info.message.list[0].timestamp.utcunix,
						count: info.message.rawcount
					}
				};

			localStorage.setItem('update-notifications-status', JSON.stringify(status));
			updateCount(status);
		});
	}

	window.addEventListener('storage', function(e) {
		if (e.key == 'update-notifications-status') updateCount(JSON.parse(e.newValue));
	});

	setInterval(function() {
		var lastRequestTime = +localStorage.getItem('update-notifications-last-request-time'),
			now = Date.now();

		if (now - lastRequestTime >= 4900) {
			localStorage.setItem('update-notifications-last-request-time', now);
			getData();
		}
	}, 5000);
});