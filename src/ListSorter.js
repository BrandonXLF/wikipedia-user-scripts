/*** List Sorter  ***/

// Tool to sort bullet-point lists on a page
// Documentation at [[en:w:User:BrandonXLF/ListSorter]]
// By [[en:w:User:BrandonXLF]]

$(function() {
	var lang = mw.config.get('wgPageContentLanguage'),
		title = mw.config.get('wgPageName'),
		summary = 'Sorted bullet lists using [[en:w:User:BrandonXLF/ListSorter|ListSorter]]',
		skip = '<includeonly.*?>[\\s\\S]*?<\\/includeonly>|<!--[\\s\\S]*?-->',
		regex = new RegExp('((?:' + skip + ')*(?:\\n|^)(?:' + skip + ')*)(\\*+)((?:' + skip + '|.)*)', 'g');

	function sortList(list) {
		var children = Array.prototype.slice.call(list.children);

		while (list.firstChild) list.removeChild(list.firstChild);

		children.sort(function(a, b) {
			return a.innerText.trim().localeCompare(b.innerText.trim(), lang, {sensitivity: 'accent'});
		});

		for (var i = 0; i < children.length; i++) list.appendChild(children[i]);
	}

	function recursiveShow(sortables) {
		var options = [],
			values = [],
			widget = new OO.ui.CheckboxMultiselectInputWidget(),
			data = 0;

		for (var i = 0; i < sortables.length; i++) {
			var sortable = sortables[i],
				cnt = $('<div>'),
				preview = $('<div>');

			preview.css({overflow: 'hidden', maxHeight: '2.75em', pointerEvents: 'none'}).appendTo(cnt).append(sortable.cloneNode(true));

			if (sortable.listSortChildren.length) {
				$('<div>').css({paddingTop: '12px'}).appendTo(cnt).append(recursiveShow(sortable.listSortChildren).$element);
			}

			sortable.listSortInputIndex = '' + data++;
			options.push({
				data: sortable.listSortInputIndex,
				label: cnt
			});
			values.push(sortable.listSortInputIndex);
		}

		widget.setOptions(options);
		widget.setValue(values);

		for (i = 0; i < sortables.length; i++) {
			sortables[i].listSortWidget = widget.checkboxMultiselectWidget.findItemFromData(sortables[i].listSortInputIndex);
		}

		return widget;
	}

	function recursiveDo(sortables, action) {
		for (var i = 0; i < sortables.length; i++) {
			action(sortables[i]);
			recursiveDo(sortables[i].listSortChildren, action);
		}
	}

	function sort() {
		var params = {
			action: 'query',
			format: 'json',
			prop: 'revisions',
			titles: title,
			formatversion: 2,
			rvprop: 'content',
			rvslots: 'main'
		};

		new mw.Api().get(params).then(function(res) {
			var text = res.query.pages[0].revisions[0].slots.main.content,
				afters = [],
				marked = text.replace(regex, function(_, before, bullets, after) {
					return before + bullets +
						'<div class="listsorter-start" data-bullets="' + bullets + '" data-index="' + (afters.push(after) - 1) + '">' +
						after +
						'</div><div class="listsorter-end"></div>';
				});

			new mw.Api().parse(marked).then(function(parsed) {
				var container = document.createElement('div'),
					topLevel = [];

				container.innerHTML = parsed;

				var nodes = container.querySelectorAll('.listsorter-start');

				for (var i = 0; i < nodes.length; i++) {
					var list = nodes[i].parentNode.parentNode;

					if (nodes[i].parentNode.previousElementSibling) continue;

					list.listSortChildren = [];

					if (list.children.length < 2) continue;

					var parent = $(list).parents('ul')[0];

					(parent ? parent.listSortChildren : topLevel).push(list);
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
					inputs = recursiveShow(topLevel),
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
					recursiveDo(topLevel, function(sortable) {
						sortable.listSortWidget.setSelected(true);
					});
				});

				deselect.on('click', function() {
					recursiveDo(topLevel, function(sortable) {
						sortable.listSortWidget.setSelected(false);
					});
				});

				sort.on('click', function() {
					recursiveDo(topLevel, function(sortable) {
						if (sortable.listSortWidget.isSelected()) sortList(sortable);
					});

					var nodes = container.querySelectorAll('.listsorter-start'),
						i = -1;

					text = text.replace(regex, function(_, before) {
						i++;
						return before + nodes[i].getAttribute('data-bullets') + afters[+nodes[i].getAttribute('data-index')];
					});

					$('<form method="post" action="' + mw.config.get('wgScript') + '" style="display:none;">')
						.append($('<textarea name="wpTextbox1">').val(text))
						.append($('<input name="title">').val(title))
						.append('<input name="wpDiff" value="wpDiff">')
						.append('<input name="wpUltimateParam" value="1">')
						.append('<input name="wpIgnoreBlankSummary" value="1">')
						.append('<input name="wpSummary" value="' + summary + '">')
						.append('<input name="action" value="submit">')
						.appendTo(document.body)
						.submit();
				});

				cancel.on('click', function() {
					fieldset.$element.remove();
				});

				$('#listsorterui').remove();
				$('#mw-content-text').prepend(fieldset.$element);
			});
		});
	}

	$(mw.util.addPortletLink('p-cactions', '#', 'Sort lists')).click(function(e) {
		e.preventDefault();
		sort();
	});
});