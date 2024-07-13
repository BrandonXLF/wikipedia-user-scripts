/*** Hot Default Sort ***/

// Adds an default sort key editor at the bottom of the page near the categories
// Documentation at [[en:w:User:BrandonXLF/HotDefaultSort]]
// By [[en:w:User:BrandonXLF]]

// <nowiki>
mw.hook('wikipage.categories').add(function($cats) {
	var sort = document.createElement('div'),
		dsort = document.createElement('span'),
		edit = document.createElement('input'),
		dflt = document.createElement('span'),
		status = document.createElement('span'),
		actions = document.createElement('span'),
		save = document.createElement('a'),
		cancel = document.createElement('a'),
		remove = document.createElement('a'),
		modify = document.createElement('a'),
		api = new mw.Api();

	function resize() {
		this.style.width = '0px';
		this.style.width = this.scrollWidth + 2 + 'px';
	}

	function transformPage(transform) {
		status.style.display = 'inline';
		edit.disabled = true;

		return api.edit(mw.config.get('wgPageName'), transform).fail(function(_, data) {
			mw.notify(api.getErrorMessage(data), {
				type: 'error',
				tag: 'hotdefaultsort'
			});
		}).always(function() {
			status.style.display = 'none';
			edit.disabled = false;
		});
	}

	function closeEditor() {
		sort.replaceChild(dsort, edit);
		actions.replaceChild(remove, save);
		actions.replaceChild(modify, cancel);
	}

	function saveEditor() {
		if (!edit.value) {
			return removeSortKey().done(function() {
				closeEditor();
			});
		}

		return transformPage(function(rev) {
			var catNS = mw.config.get('wgFormattedNamespaces')[14],
				catRegex = new RegExp(
					'(\\[\\[[' +
					catNS.charAt(0).toLowerCase() +
					catNS.charAt(0).toUpperCase() +
					']' +
					mw.util.escapeRegExp(catNS.substr(1)) +
					'\\:.*)'
				),
				textParts = rev.content.replace(/\n*{{DEFAULTSORT:.*?}}\n*/g, '').split(catRegex),
				main = textParts.shift() || '',
				cats = textParts.join('');

			return {
				text: main + (main.endsWith('\n') ? '' : '\n\n') + '{{DEFAULTSORT:' + edit.value.trim() + '}}\n' + cats,
				summary: 'Set {{DEFAULTSORT}} to ' + edit.value + ' using [[en:w:User:BrandonXLF/HotDefaultSort|HotDefaultSort]]'
			};
		}).done(function() {
			dsort.innerText = edit.value;
			modify.innerText = '(±)';
			modify.title = 'Modify';
			remove.style.display = 'inline';
			dflt.style.display = 'none';
			closeEditor();
		});
	}

	function removeSortKey() {
		return transformPage(function(rev) {
			return {
				text: rev.content.replace(/\n*{{DEFAULTSORT:.*?}}\n*/g, '\n\n'),
				summary: 'Removed {{DEFAULTSORT}} using [[en:w:User:BrandonXLF/HotDefaultSort|HotDefaultSort]]'
			};
		}).done(function() {
			dsort.innerText = mw.config.get('wgTitle');
			modify.innerText = '(+)';
			modify.title = 'Add';
			remove.style.display = 'none';
			dflt.style.display = 'inline';
		});
	}

	api.get({
		action: 'query',
		pageids: mw.config.get('wgArticleId'),
		prop: 'pageprops'
	}).then(function(res) {
		var unset = false,
			pp = res.query.pages[mw.config.get('wgArticleId')].pageprops,
			key = pp && pp.defaultsort ? pp.defaultsort : (unset = true) && mw.config.get('wgTitle');

		sort.innerText = 'Default sort: ';

		dsort.innerText = key;
		sort.appendChild(dsort);

		edit.style.minWidth = '100px';
		['paste', 'keydown', 'keyup', 'keypress', 'input', 'change'].forEach(function(eventName) {
			edit.addEventListener(eventName, resize);
		});
		edit.addEventListener('keydown', function(e) {
			if (e.key == 'Enter') saveEditor();
		});

		dflt.innerText = '(no key)';
		dflt.style.marginLeft = '0.25em';
		dflt.style.display = unset ? 'inline' : 'none';
		dflt.style.fontStyle = 'italic';

		status.style.marginLeft = '0.25em';
		status.style.display = 'none';
		status.innerText = 'Saving...';

		save.innerText = '(✓)';
		save.style.marginLeft = '0.25em';
		save.title = 'Save changes';
		save.addEventListener('click', function() {
			saveEditor();
		});

		cancel.innerText = '(x)';
		cancel.style.marginLeft = '0.25em';
		cancel.title = 'Cancel';
		cancel.addEventListener('click', function() {
			closeEditor();
		});

		remove.innerText = '(−)';
		remove.title = 'Remove (replace with default)';
		remove.style.marginLeft = '0.25em';
		remove.style.display = unset ? 'none' : 'inline';
		remove.addEventListener('click', function() {
			removeSortKey();
		});

		modify.innerText = unset ? '(+)' : '(±)';
		modify.title = unset ? 'Add' : 'Modify';
		modify.style.marginLeft = '0.25em';
		modify.addEventListener('click', function() {
			sort.replaceChild(edit, dsort);
			edit.value = window.hotDefaultSortInitKey ? window.hotDefaultSortInitKey(dsort.innerText, dflt.style.display === 'inline') : dsort.innerText;
			resize.apply(edit);
			actions.replaceChild(save, remove);
			actions.replaceChild(cancel, modify);
		});

		actions.appendChild(remove);
		actions.appendChild(modify);

		sort.appendChild(dflt);
		sort.appendChild(status);
		sort.appendChild(actions);

		$cats.append(sort);
	});
});
// </nowiki>