/*** List sorter  ***/

// Tool to sort bullet-point lists on a page
// Documentation at [[User:BrandonXLF/ListSorter]]
// By [[User:BrandonXLF]]

$(function() {
	var lang = mw.config.get('wgPageContentLanguage'),
		title = mw.config.get('wgPageName'),
		titlee = encodeURIComponent(title),
		summary = 'Sorted bullet lists using [[User:BrandonXLF/ListSorter|ListSorter]]';

	function lineageMatch(node, test) {
		while (node) {
			if (node.nodeName == 'HTML') return false;
			if (test(node)) return node;
			node = node.parentNode;
		}
	}

	function sortList(list) {
		var children = Array.prototype.slice.call(list.children);

		while (list.firstChild) list.removeChild(list.firstChild);

		children.sort(function(a, b) {
			return a.innerText.trim().localeCompare(b.innerText.trim(), lang, {
				sensitivity: 'accent'
			});
		});

		for (var i = 0; i < children.length; i++) list.appendChild(children[i]);
	}

	function recursiveShow(sortables) {
		var options = [],
			values = [],
			widget = new OO.ui.CheckboxMultiselectInputWidget();

		for (var i = 0; i < sortables.length; i++) {
			var sortable = sortables[i],
				cnt = $('<div>'),
				preview = $('<div>');

			preview
				.css({
					overflow: 'hidden',
					maxHeight: '2.75em',
					pointerEvents: 'none'
				})
				.appendTo(cnt)
				.append(sortable.list.cloneNode(true));

			if (sortable.children.length) {
				$('<div>')
					.css({
						paddingTop: '12px'
					})
					.appendTo(cnt)
					.append(recursiveShow(sortable.children).$element);
			}

			options.push({
				data: sortable.list.id,
				label: cnt
			});
			values.push(sortable.list.id);
		}

		widget.setOptions(options);
		widget.setValue(values);

		for (i = 0; i < sortables.length; i++) {
			sortables[i].widget = widget.checkboxMultiselectWidget.findItemFromData(sortables[i].list.id);
		}

		return widget;
	}

	function recursiveDo(sortables, action) {
		for (var i = 0; i < sortables.length; i++) {
			action(sortables[i]);
			recursiveDo(sortables[i].children, action);
		}
	}

	function sort() {
		$.get({
			url: 'https://en.wikipedia.org/api/rest_v1/page/html/' + titlee,
			data: {
				stash: true,
				redirect: false
			}
		}).then(function(html, status, xhr) {
			var parser = new DOMParser(),
				etag = xhr.getResponseHeader('ETag'),
				rev = etag.match(/^(?:W\/|)"(.*)\/.*"$/)[1],
				doc = parser.parseFromString(html, 'text/html'),
				lists = doc.querySelectorAll('ul'),
				sortables = [],
				sortableIndex = {};

			for (var i = 0; i < lists.length; i++) {
				var list = lists[i];

				if (list.children.length < 2 || lineageMatch(list, function(node) {
					return node.hasAttribute && node.hasAttribute('about');
				})) continue;

				var parent = lineageMatch(list.parentNode, function(node) {
					return node.nodeName == 'UL';
				});

				if (parent && !sortableIndex[parent.id]) continue;

				var sortable = {
					list: list,
					children: [],
					widget: null
				};

				sortableIndex[list.id] = sortable;
				(parent ? sortableIndex[parent.id].children : sortables).push(sortable);
			}

			var sort = new OO.ui.ButtonInputWidget({
					label: 'Sort selected',
					flags: ['primary', 'progressive']
				}),
				select = new OO.ui.ButtonInputWidget({
					label: 'Select all'
				}),
				deselect = new OO.ui.ButtonInputWidget({
					label: 'Deselect all'
				}),
				cancel = new OO.ui.ButtonInputWidget({
					label: 'Cancel',
					framed: false,
					flags: ['destructive']
				}),
				inputs = recursiveShow(sortables),
				buttons = new OO.ui.HorizontalLayout({
					items: [sort, select, deselect, cancel]
				}),
				fieldset = new OO.ui.FieldsetLayout({
					label: 'Select lists to sort',
					items: [inputs, buttons],
					id: 'listsorterui'
				});

			inputs.$element.css({
				border: '1px solid #888',
				borderBottom: '0',
				padding: '1em'
			});

			buttons.$element.css({
				paddingTop: '12px',
				position: 'sticky',
				bottom: '0',
				background: '#fff',
				borderTop: '1px solid #888',
				marginRight: '8px',
				boxShadow: '0 -4px 4px -4px #888'
			});

			select.on('click', function() {
				recursiveDo(sortables, function(sortable) {
					sortable.widget.setSelected(true);
				});
			});

			deselect.on('click', function() {
				recursiveDo(sortables, function(sortable) {
					sortable.widget.setSelected(false);
				});
			});

			sort.on('click', function() {
				recursiveDo(sortables, function(sortable) {
					if (sortable.widget.isSelected()) sortList(sortable.list);
				});

				$.post({
					url: 'https://en.wikipedia.org/api/rest_v1/transform/html/to/wikitext/' + titlee + '/' + rev,
					data: {
						html: doc.documentElement.outerHTML
					},
					headers: {
						'If-Match': etag
					}
				}).then(function(text) {
					$('<form method="post" action="' + mw.config.get('wgScript') + '" style="display:none;">')
						.append($('<textarea name="wpTextbox1">').val(text))
						.append($('<input name="title">').val(title))
						.append('<input name="wpDiff" value="wpDiff">')
						.append('<input name="wpUltimateParam" value="1">')
						.append('<input name="wpSummary" value="' + summary + '">')
						.append('<input name="action" value="submit">')
						.appendTo(document.body)
						.submit();
				});
			});

			cancel.on('click', function() {
				fieldset.$element.remove();
			});

			$('#listsorterui').remove();
			$('#mw-content-text').prepend(fieldset.$element);
		});
	}

	$(mw.util.addPortletLink('p-cactions', '#', 'Sort lists')).click(function(e) {
		e.preventDefault();
		sort();
	});
});
