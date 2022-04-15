/** Show User Gender **/

// Show the gender of users
// [[w:User:BrandonXLF/ShowUserGender]]
// By [[w:User:BrandonXLF]]

window.SHOW_USER_GENDER = $.extend({
	male: ' [he]',
	female: ' [she]',
	unknown: ' [?]',
}, window.SHOW_USER_GENDER);

(function() {
	var USER_NS = mw.config.get('wgFormattedNamespaces')[2] + ':';

	function getUser(el) {
		return decodeURIComponent(el.href).match(/^.*\/(.*?)$/)[1].replace(/_/g, ' ').match(/(index\.php\?title=|)([^&]*).*?/)[2];
	}

	var elements = $('.userlink').filter(function() {
			return getUser(this).startsWith(USER_NS);
		}),

		users = elements.map(function() {
			return getUser(this).substr(USER_NS.length);
		}).toArray().filter(function(val, i, a) {
			return i === a.indexOf(val);
		}),

		genders = {},
		requests = 0,
		done = 0;

	for (var i = 0; i < users.length; i += 50) {
		var reqUsers = users.slice(i, i + 50);
		requests++;
		new mw.Api().get({
			action: 'query',
			list: 'users',
			usprop: 'gender',
			ususers: reqUsers.join('|')
		}).then(function(res) {
			done++;
			res = res.query.users;
			console.log(res);

			for (var i = 0; i < res.length; i++) {
				genders[res[i].name] = res[i].gender;
			}

			if (requests == done) {
				elements.each(function() {
					var user = getUser(this).substr(USER_NS.length);
					$(this).after(window.SHOW_USER_GENDER[genders[user] || 'unknown']);
				});
			}
		});
	}
})();