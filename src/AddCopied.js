// <nowiki>

/*** Add Copied ***/

// Add {{copied}} to the source and target talk page when copying content
// Documentation at [[en:w:User:BrandonXLF/AddCopied]]
// By [[en:w:User:BrandonXLF]]

$.when(mw.loader.using(['oojs-ui', 'mediawiki.widgets']), $.ready).then(function() {
	const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
			'August', 'September', 'October', 'November', 'December'],
		entryParameters = ['from', 'from_oldid', 'to', 'to_diff', 'to_oldid',
			'diff', 'date', 'afd', 'merge'],
		templatePattern = /({{)([^|}]+)\|?|}}|<!--|-->/g,
		// Lowercase
		afterTemplates = ['page views', 'daily pageviews', 'annual pageviews', 'annual views',
			'annual readership', 'section sizes', 'translated page', 'translated'];

	function addCopied(wikitext, params, onlyTop) {
		const seenStack = [],
			previousCopied = [];

		let match,
			depth = 0,
			lastEnd = 0,
			insertPosition = null,
			inComment = false;

		templatePattern.lastIndex = 0;

		while (match = templatePattern.exec(wikitext)) {
			if (inComment) {
				inComment = match[0] !== '-->';
			} else if (match[0] === '<!--') {
				inComment = true;
			} else if (match[1] === '{{') {
				depth++;
				seenStack.push([match[2].trim(), lastEnd, match.index, match.index + match[0].length]);

				if (depth === 1 && wikitext.slice(lastEnd, match.index).trim().length) {
					if (insertPosition === null) {
						insertPosition = lastEnd;
					}

					if (onlyTop) {
						wikitext = wikitext.slice(0, lastEnd);
					}

					break;
				}
			} else {
				let lastSeen = seenStack[seenStack.length - 1];

				if (lastSeen[0].toLowerCase() === 'copied') {
					previousCopied.push([lastSeen[1], lastSeen[3], match.index, match.index + 2]);
				}

				if (
					afterTemplates.includes(lastSeen[0].toLowerCase()) ||
					(lastSeen[0].startsWith('User:') && /bot/i.test(lastSeen[0]))
				) {
					insertPosition = lastEnd;
				}

				if (depth === 1) {
					lastEnd = match.index + 2;
				}

				depth--;
				seenStack.pop();
			}
		}

		if (insertPosition === null) {
			insertPosition = lastEnd;
		}

		let previousParams = [];

		for (let i = previousCopied.length - 1; i >= 0; i--) {
			let copied = previousCopied[i];

			previousParams.push(wikitext.slice(copied[1], copied[2]));
			wikitext = wikitext.slice(0, copied[0]) + wikitext.slice(copied[3]);

			if (copied[0] < insertPosition) {
				insertPosition -= copied[3] - copied[0];
			}
		}

		previousParams = previousParams.reverse();
		let parameters = [];

		for (const element of previousParams) {
			let pairs = element.split('|'),
				byParam = [];

			for (const element of pairs) {
				let split = element.split(/=(.*)/),
					keyMatch = split[0].match(/ *(.*?)(\d*) *$/, ''),
					currentIndex = +keyMatch[2] || 1;

				if (!byParam[currentIndex]) {
					byParam[currentIndex] = {};
				}

				byParam[currentIndex][keyMatch[1]] = split[1].trim();
			}

			parameters = parameters.concat(byParam.filter(function(x) {
				return x;
			}));
		}

		parameters.push(params);

		let single = parameters.length === 1,
			out = '{{Copied';

		if (!single) {
			out += '\n';
		}

		for (let i = 0; i < parameters.length; i++) {
			entryParameters.forEach(function(known) {
				if (parameters[i][known]) {
					out += '|' + known + (single ? '' : i + 1) + '=' + parameters[i][known];
				}
			});

			out += '\n';
		}

		if (single) {
			out = out.replace(/\n$/, '');
		}

		out += '}}';

		let finalWikitext = wikitext.slice(0, insertPosition);

		if (finalWikitext) {
			finalWikitext += '\n';
		}

		finalWikitext += out + wikitext.slice(insertPosition);

		return finalWikitext;
	}

	class DefaultTitleInputWidget extends mw.widgets.TitleInputWidget {
		constructor(config) {
			if (!config) config = {};
			config.allowSuggestionsWhenEmpty = true;
			super(config);
		}

		getRequestQuery() {
			return this.getValue() || mw.config.get('wgRelevantPageName').replace(/_/g, ' ');
		}

		getQueryValue() {
			return this.getRequestQuery();
		}
	}

	class YesParamInputWidget extends OO.ui.CheckboxInputWidget {
		getValue() {
			return this.isSelected() ? 'yes' : '';
		}
	}

	class ParameterSpacingDialog extends OO.ui.ProcessDialog {
		constructor(config) {
			super(config);

			this.api = new mw.Api();

			this.fromWidget = new DefaultTitleInputWidget();
			this.fromOldIdWidget = new OO.ui.ComboBoxInputWidget({labelPosition: 'after'});
			this.toWidget = new DefaultTitleInputWidget();
			this.toDiffWidget = new OO.ui.ComboBoxInputWidget({labelPosition: 'after'});
			this.toOldIdWidget = new OO.ui.ComboBoxInputWidget({labelPosition: 'after'});
			this.dateWidget = new OO.ui.TextInputWidget();
			this.afdWidget = new mw.widgets.TitleInputWidget();
			this.mergeWidget = new YesParamInputWidget();

			this.fromRevs = {};
			this.toRevs = {};

			this.paramSources = [
				['from', this.fromWidget],
				['from_oldid', this.fromOldIdWidget],
				['to', this.toWidget],
				['date', this.dateWidget],
				['to_diff', this.toDiffWidget],
				['to_oldid', this.toOldIdWidget],
				['afd', this.afdWidget],
				['merge', this.mergeWidget],
			];

			this.$output = $('<div>');

			this.fromWidget.connect(this, {change: 'onFromChange'});
			this.toWidget.connect(this, {change: 'onToChange'});
			this.toDiffWidget.connect(this, {change: 'onToDiffChange'});

			let dialog = this;

			[this.fromOldIdWidget, this.toDiffWidget, this.toOldIdWidget].forEach(function(revInput) {
				revInput.on('change', function(val) {
					let revInfo = dialog.fromRevs[val] || dialog.toRevs[val];
					revInput.setLabel(revInfo ? revInfo.short : '');
				});
			});
		}

		initialize() {
			super.initialize();

			this.content = new OO.ui.PanelLayout({
				padded: true,
				expanded: false
			});

			this.content.$element.append(
				new OO.ui.FieldsetLayout({label: 'Source page'}).addItems([
					new OO.ui.FieldLayout(this.fromWidget, {label: 'Source page', align: 'left'}),
					new OO.ui.FieldLayout(this.fromOldIdWidget, {label: 'Source revision ID', align: 'left'})
				]).$element,
				new OO.ui.FieldsetLayout({label: 'Target page'}).addItems([
					new OO.ui.FieldLayout(this.toWidget, {label: 'Target page', align: 'left'}),
					new OO.ui.FieldLayout(this.toDiffWidget, {label: 'Post-copy revision ID', align: 'left'})
				]).$element,
				new OO.ui.FieldsetLayout({label: 'Auto-populated'}).addItems([
					new OO.ui.FieldLayout(this.toOldIdWidget, {label: 'Pre-copy revision ID', align: 'left'}),
					new OO.ui.FieldLayout(this.dateWidget, {label: 'Date', align: 'left'})
				]).$element,
				new OO.ui.FieldsetLayout({label: 'Advanced'}).addItems([
					new OO.ui.FieldLayout(this.mergeWidget, {label: 'From merge?', align: 'left'}),
					new OO.ui.FieldLayout(this.afdWidget, {label: 'AfD Link', align: 'left'})
				]).$element,
				this.$output
			);

			this.$body.append(this.content.$element);
		}

		addToPage(page, preview) {
			if (!page) return $.Deferred().resolve().promise();

			let title = new mw.Title(page).getTalkPage(),
				dialog = this;

			return this.api.get({
				action: 'query',
				prop: 'revisions',
				rvprop: ['content', 'timestamp'],
				titles: title.getPrefixedDb(),
				formatversion: '2',
				curtimestamp: true
			}).then(function(res) {
				const pageWikitext = res.query.pages[0].revisions ? res.query.pages[0].revisions[0].content : '',
					params = {};

				for (const element of dialog.paramSources) {
					const val = element[1].getValue();
					if (!val) continue;
					params[element[0]] = val;
				}

				const wikitext = addCopied(pageWikitext, params, preview),
					link = $('<a>')
						.attr('href', title.getUrl())
						.text(title.getPrefixedText());

				if (preview) {
					return dialog.api.parse(wikitext, {
						title: title.getPrefixedDb()
					}).then(function(html) {
						return $('<div>').append($('<h4>').append(link), html);
					});
				}

				return dialog.api.postWithEditToken({
					action: 'edit',
					title: title.getPrefixedDb(),
					formatversion: '2',
					text: wikitext,
					summary: 'Added [[Template:Copied]] using [[en:w:User:BrandonXLF/AddCopied|AddCopied]]'
				}).then(function() {
					return $('<div>').append('Added to ', link);
				});
			});
		}

		processOutput(out) {
			this.$output.append(out);
			this.updateSize();
		}

		getActionProcess(action) {
			return new OO.ui.Process(() => {
				if (!action) return this.close().closed;

				this.$output.empty();
				let preview = action === 'preview';

				return this.addToPage(this.fromWidget.getValue(), preview)
					.then(this.processOutput.bind(this))
					.then(() => this.addToPage(this.toWidget.getValue(), preview))
					.then(this.processOutput.bind(this));
			});
		}

		getBodyHeight() {
			this.content.resetScroll();
			return Math.max(240, this.content.$element.outerHeight(true));
		}

		getRevOptions(page) {
			return this.api.get({
				action: 'query',
				format: 'json',
				prop: 'revisions',
				titles: page,
				formatversion: '2',
				rvprop: ['ids', 'timestamp', 'comment', 'user'],
				rvlimit: 200
			}).then(function(res) {
				return res.query.pages[0].revisions.map(function(rev) {
					return {
						data: rev.revid,
						label: rev.user + ' - ' + rev.comment + ' - ' + rev.timestamp + ' (' + rev.revid + ')',
						timestamp: rev.timestamp,
						parent: rev.parentid || '',
						short: rev.comment
					};
				});
			});
		}

		onFromChange(val) {
			this.getRevOptions(val).then(opts => {
				this.fromOldIdWidget.setOptions(opts);

				this.fromRevs = {};
				for (const element of opts) {
					this.fromRevs[element.data] = element;
				}
			});
		}

		onToChange(val) {
			this.getRevOptions(val).then(opts => {
				this.toDiffWidget.setOptions(opts);
				this.toOldIdWidget.setOptions(opts);

				this.toRevs = {};
				for (const element of opts) {
					this.toRevs[element.data] = element;
				}
			});
		}

		onToDiffChange(val) {
			let revInfo = this.toRevs[val];

			if (revInfo) {
				let dateObj = new Date(revInfo.timestamp),
					dateStr = '';

				dateStr += dateObj.getUTCHours().toString().padStart(2, '0');
				dateStr += ':' + dateObj.getUTCMinutes().toString().padStart(2, '0');
				dateStr += ', ';
				dateStr += dateObj.getUTCDate().toString().padStart(2, '0');
				dateStr += ' ' + months[dateObj.getUTCMonth()];
				dateStr += ' ' + dateObj.getUTCFullYear().toString();

				this.dateWidget.setValue(dateStr);
			} else {
				this.dateWidget.setValue('');
			}

			this.toOldIdWidget.setValue(revInfo ? revInfo.parent : '');
		}
	}

	ParameterSpacingDialog.static.name = 'paramspacing';
	ParameterSpacingDialog.static.title = 'Add {{copied}}';
	ParameterSpacingDialog.static.actions = [
		{label: 'Close', flags: ['safe', 'close']},
		{label: 'Preview', flags: ['safe'], action: 'preview'},
		{label: 'Tag pages', flags: ['progressive', 'primary'], action: 'run'}
	];

	$(mw.util.addPortletLink('p-cactions', '#', 'Add {{copied}}')).click(function(e) {
		e.preventDefault();

		const dialog = new ParameterSpacingDialog({size: 'large'});

		OO.ui.getWindowManager().addWindows([dialog]);
		OO.ui.getWindowManager().openWindow(dialog);
	});
});

mw.loader.addStyleTag(
	`.oo-ui-comboBoxInputWidget.oo-ui-textInputWidget.oo-ui-textInputWidget-labelPosition-after > .oo-ui-labelElement-label {
		right: 37px;
		max-width: 45%;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}`
);
// </nowiki>
