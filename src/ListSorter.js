/*** List sorter for USL ***/

// Tool to sort the list at Wikipedia:User scripts/List
// Documentation at [[User:BrandonXLF/ListSorter/USL]]
// By [[User:BrandonXLF]]

(function() {
	function ListSorter() {
		var b = $('#wpTextbox1').textSelection('getContents').split(/\n/),
			c = [],
			i = 0,
			curr = c,
			prev = {
				depth: '',
				name: '',
				text: '',
				sub: c
			},
			par = [prev],
			obj = {},
			out = '';

		function getName(str) {
			if (str.includes('name=')) {
				return str
					.replace(/\s/g, '')
					.match(/name=.*/i)[0]
					.replace('name=', '')
					.toLowerCase()
					.slice(0, 100);
			} else if (str.includes('code=')) {
				return str
					.replace(/\s/g, '')
					.match(/code=.*/i)[0]
					.replace('code=', '')
					.replace(/user:[^|}]+\/(?=[^|}]+)/i, '')
					.toLowerCase()
					.slice(0, 100);
			} else if (str.includes('doc=')) {
				return str
					.replace(/\s/g, '')
					.match(/doc=.*/i)[0]
					.replace('doc=', '')
					.replace(/user:[^|}]+\/(?=[^|}]+)/i, '')
					.toLowerCase()
					.slice(0, 100);
			} else if (str.match(/\[\[.*\|(.*)\]\]/)) {
				return str
					.replace(/\s/g, '')
					.match(/\[\[.*\|(.*)\]\]/, '')[1]
					.toLowerCase()
					.slice(0, 100);
			} else if (str.match(/\[\[.*\]\]/)) {
				return str
					.replace(/\s/g, '')
					.replace(/.*?\[\[.*\/(?=.*?\]\])/i, '')
					.toLowerCase()
					.slice(0, 100);
			} else {
				return '';
			}
		}

		for (i = 0; i < b.length; i++) {
			obj = {
				depth: /^(\**)/.exec(b[i])[1] || '',
				name: getName(b[i]),
				text: b[i]
			};
			obj.sub = [];

			if (obj.depth.length > prev.depth.length) {
				curr = prev.sub;
				curr.push(obj);
			} else if (obj.depth.length < prev.depth.length) {
				curr = par[obj.depth.length].sub;
				curr.push(obj);
			} else {
				curr.push(obj);
			}

			par[obj.depth.length + 1] = obj;
			prev = obj;
		}

		function sort(t) {
			out += t.text + '\n';

			if (t.sub) {
				t.sub = t.sub.sort(function(x, y) {
					x = x.name.toUpperCase();
					y = y.name.toUpperCase();
					if (x < y) {
						return -1;
					}
					if (x > y) {
						return 1;
					}
					return 0;
				});

				t.sub.forEach(function(v) {
					sort(v);
				});
			}
		}

		for (i = 0; i < c.length; i++) {
			sort(c[i]);
		}

		$('#wpTextbox1').textSelection('setContents', out);
		$('#wpDiff').click();
		$('#wpSummary').val('Sorting scripts alphabetically using [[User:BrandonXLF/ListSorter/USL|ListSorter for USL]]');
	}

	if (window.location.search.includes('sortbulletlists=true') && mw.config.get('wgPageName') == 'Wikipedia:User_scripts/List') ListSorter();

	if (mw.config.get('wgPageName') == 'Wikipedia:User_scripts/List') {
		if (!$('#sortbulletlist-usl').length) mw.util.addPortletLink(
			'p-cactions',
			mw.config.get('wgScript') + '?title=' + mw.config.get('wgPageName') + '&action=submit&sortbulletlists=true',
			'Sort user scripts'
		);
	}
})();