/*** Update Notifications ***/

// Updates the alert and notification counts every few seconds
// Documentation at [[User:BrandonXLF/UpdateNotifications]]
// By [[User:BrandonXLF]]

$(function() {
	var crossWiki = mw.user.options.get('echo-cross-wiki-notifications'),
		apiEntry = window.location.origin + mw.config.get('wgScriptPath') + '/api.php',
		shownTime = new Date();

	function getData() {
		var params = {
				action: 'query',
				format: 'json',
				meta: 'notifications',
				notprop: 'list|count|seenTime',
				notlimit: 1,
				notgroupbysection: true,
				notalertunreadfirst: true,
				notmessageunreadfirst: true,
				notcrosswikisummary: crossWiki
			},
			paramArray = [];

		for (var key in params) paramArray.push(key + '=' + params[key]);

		var url = apiEntry + '?' + paramArray.join('&'),
			req = new XMLHttpRequest();

		req.addEventListener('load', function() {
			var res = JSON.parse(req.responseText),
				info = res.query.notifications,
				status = {
					alert: {
						seen: new Date(info.alert.seenTime).getTime(),
						latest: new Date(info.alert.list[0].timestamp.utciso8601).getTime(),
						count: info.alert.rawcount
					},
					message: {
						seen: new Date(info.message.seenTime).getTime(),
						latest: new Date(info.message.list[0].timestamp.utciso8601).getTime(),
						count: info.message.rawcount
					}
				};

			localStorage.setItem('update-notifications-status', JSON.stringify(status));
			updateCount(status);
		});

		req.open('GET', url);
		req.send();
	}

	function updateIcon(id, data) {
		$('#' + id + ' a')
			.toggleClass('mw-echo-unseen-notifications', data.latest > data.seen)
			.toggleClass('mw-echo-notifications-badge-all-read', !data.count)
			.attr('data-counter-num', data.count)
			.attr('data-counter-text', data.count);
	}

	function updateCount(status) {
		if (!window.noUpdateNotificationNotice && (status.alert.latest > shownTime || status.message.latest > shownTime)) {
			shownTime = new Date();
			mw.notify('New notification received!');
		}

		updateIcon('pt-notifications-alert', status.alert);
		updateIcon('pt-notifications-notice', status.message);
	}

	window.addEventListener('storage', function(e) {
		if (e.key == 'update-notifications-status') updateCount(JSON.parse(e.newValue));
	});

	setInterval(function() {
		var lastRequestTime = +localStorage.getItem('update-notifications-last-request-time'),
			now = new Date().getTime();

		if (now - lastRequestTime >= 4900) {
			localStorage.setItem('update-notifications-last-request-time', now);
			getData();
		}
	}, 5000);
});