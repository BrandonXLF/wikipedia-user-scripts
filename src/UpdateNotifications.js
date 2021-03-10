/*** Update Notification Count ***/

// Updates the alert and notification counts every few seconds
// Documentation at [[User:BrandonXLF/UpdateNotifications]]
// By [[User:BrandonXLF]]

$(function updateNotificationCount() {
	$.get(mw.config.get('wgScriptPath') + '/api.php', {
		action: 'query',
		meta: 'notifications',
		notgroupbysection: 1,
		notprop: 'list|count|seenTime',
		format: 'json',
		notcrosswikisummary: mw.user.options.get('echo-cross-wiki-notifications')
	}).done(function(r) {
		r = r.query.notifications;

		var newcount = +r.alert.count,
			oldcount = +$('#pt-notifications-alert a').attr('data-counter-num'),
			unread = false,
			i = 0;

		for (i = 0; i < r.alert.list.length; i++) {
			if ((new Date(r.alert.seenTime)).getTime() < (new Date(r.alert.list[i].timestamp.utciso8601)).getTime()) {
				unread = true;
				break;
			}
		}

		if (unread && newcount > oldcount) mw.notify('New alert recieved!');

		$('#pt-notifications-alert a')
			.toggleClass('mw-echo-unseen-notifications', unread)
			.toggleClass('mw-echo-notifications-badge-all-read', newcount === 0)
			.attr('data-counter-num', newcount)
			.attr('data-counter-text', newcount)
			.text('Alerts (' + newcount + ')');

		newcount = +r.message.count;
		oldcount = +$('#pt-notifications-notice a').attr('data-counter-num');
		unread = false;

		for (i = 0; i < r.message.list.length; i++) {
			if ((new Date(r.message.seenTime)).getTime() < (new Date(r.message.list[i].timestamp.utciso8601)).getTime()) {
				unread = true;
				break;
			}
		}

		if (unread && newcount > oldcount) mw.notify('New notice recieved!');

		$('#pt-notifications-notice a')
			.toggleClass('mw-echo-unseen-notifications', unread)
			.toggleClass('mw-echo-notifications-badge-all-read', newcount === 0)
			.attr('data-counter-num', newcount)
			.attr('data-counter-text', newcount)
			.text('Alerts (' + newcount + ')');
	});
	setTimeout(updateNotificationCount, 5000);
});