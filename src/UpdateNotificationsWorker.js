// Do not install this!
// Shared worker for [[User:BrandonXLF/UpdateNotifications]]
// By [[User:BrandonXLF]]

self.ports = [];
self.config = {};

setInterval(function() {
	var params = {
			action: 'query',
			format: 'json',
			meta: 'notifications',
			notprop: 'list|count|seenTime',
			notlimit: 1,
			notgroupbysection: true,
			notalertunreadfirst: true,
			notmessageunreadfirst: true,
			notcrosswikisummary: self.config.crossWiki
		},
		paramArray = [];

	for (var key in params) paramArray.push(key + '=' + params[key]);

	var url = self.config.scriptPath + '/api.php?' + paramArray.join('&'),
		req = new XMLHttpRequest();

	req.addEventListener('load', function() {
		var res = JSON.parse(req.responseText),
			info = res.query.notifications,
			data = {
				alert: {
					seen: new Date(info.alert.seenTime),
					latest: new Date(info.alert.list[0].timestamp.utciso8601),
					count: info.alert.rawcount
				},
				message: {
					seen: new Date(info.message.seenTime),
					latest: new Date(info.message.list[0].timestamp.utciso8601),
					count: info.message.rawcount
				}
			};

		self.ports.forEach(function(port) {
			port.postMessage(data);
		});

		self.ports = [];
	});

	req.open('GET', url);
	req.send();
}, 5000);

self.onconnect = function(e) {
	var port = e.ports[0];

	port.addEventListener('message', function(e) {
		if (typeof e.data == 'object') self.config = e.data;
		self.ports.push(port);
	});

	port.start();
};