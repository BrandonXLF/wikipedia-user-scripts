// <nowiki>
/*** Reference Expander ***/

// Expands references that are a link to a expanded reference using {{cite ..}}
// [[en:w:User:BrandonXLF/ReferenceExpander]]
// By [[en:w:User:BrandonXLF]]

/* global getCitoidRef */

$(mw.util.addPortletLink('p-tb', '#', 'Expand references')).click(function(e) {
	e.preventDefault();

	function syncSize(text1, text2) {
		text1.styleHeight = -1;
		text1.adjustSize(true);

		text2.styleHeight = -1;
		text2.adjustSize(true);

		var height = Math.max(text1.$input.height(), text2.$input.height());

		text1.$input.height(height);
		text2.$input.height(height);
	}

	function MainDialog(config) {
		MainDialog.super.call(this, config);
	}

	OO.inheritClass(MainDialog, OO.ui.ProcessDialog);

	MainDialog.static.name = 'citoidExpandRefs';
	MainDialog.static.title = 'Reference Expander';

	MainDialog.static.actions = [
		{
			label: 'Close',
			flags: ['safe', 'close'],
			modes: ['review', 'finishedLog', 'log']
		},
		{
			action: 'back',
			label: 'View Log',
			modes: 'review'
		},
		{
			action: 'save',
			label: 'Save Changes',
			flags: ['primary', 'progressive'],
			modes: 'review'
		},
		{
			action: 'continue',
			label: 'Continue',
			modes: 'finishedLog'
		}
	];

	MainDialog.static.disclaimer = 'You are re&shy;spon&shy;sible for verify&shy;ing the gene&shy;rated refer&shy;ences.' +
	' Review the content of the new refer&shy;ences and manually preserve comments from the old refer&shy;ences.' +
	' Un&shy;check a check&shy;box to skip updating the corre&shy;spond&shy;ing refer&shy;ence.';

	MainDialog.prototype.setStatus = function(text) {
		this.title.setLabel(MainDialog.static.title + ': ' + text);
	};

	MainDialog.prototype.log = function(msg, color) {
		this.logElement.append(
			$('<div>')
				.append('> ',  msg)
				.css({
					color: color,
					margin: '4px 0'
				})
		);

		this.updateSize();
		this.$body.scrollTop(this.$body.prop('scrollHeight'));
	};

	MainDialog.prototype.initialize = function() {
		MainDialog.super.prototype.initialize.apply(this, arguments);

		var dialog = this;

		this.textarea = document.createElement('textarea');
		this.urlProtocols = mw.config.get('wgUrlProtocols');
		this.urlProtocolsWithoutRel = mw.config.get('wgUrlProtocols').split('|').filter(function(protocol) {
			return protocol !== '\\/\\/';
		}).join('|');
		// From Parser::EXT_LINK_URL_CLASS
		this.urlCharacters = '[^<>"\\x00-\\x20\\x7F\\xA0\\u1680\\u2000-\\u200A\\u202F\\u205F\\u3000\\uFFFD]';
		this.enclosedUrlRegex = new RegExp('\\[((?:' + this.urlProtocols + ')' + this.urlCharacters + '*).?\\]');
		this.unenclosedUrlRegex = new RegExp('((?:' + this.urlProtocolsWithoutRel + ')' + this.urlCharacters + '*)');
		this.refRegex = /<ref(?:[^>]+?[^/]|)>.*?<\/ref>/g;

		this.content = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});

		this.progressBar = new OO.ui.ProgressBarWidget({
			progress: false
		});

		this.logElement = $('<div>').css({
			wordBreak: 'break-all',
			color: 'grey'
		});

		this.reviewElement = $('<div>');

		this.progressBar.$element.css({marginTop: '1em'});
		this.content.$element.append(this.logElement, this.progressBar.$element);
		this.$body.append(this.content.$element);

		this.log('Loading page content and scripts...');

		mw.loader.getScript('https://en.wikipedia.org/w/index.php?title=User:BrandonXLF/Citoid.js&action=raw&ctype=text/javascript').then(function() {
			dialog.apiEdit = new mw.Api().edit(mw.config.get('wgPageName'), function(rev) {
				return dialog.expandReferences(rev.content);
			});
		});
	};

	MainDialog.prototype.getSetupProcess = function(data) {
		return MainDialog.super.prototype.getSetupProcess.call(this, data)
			.next(function() {
				this.actions.setMode('log');
				this.setStatus('Loading...');
			}, this);
	};

	MainDialog.prototype.incrementDone = function(reference) {
		this.progressDone++;
		this.progressBar.setProgress((this.progressDone / this.progressTotal) * 100);

		return $.Deferred().resolve(reference);
	};

	MainDialog.prototype.getExpandedReference = function(wikitext, startTag, url, endTag) {
		var dialog = this,
			link = $('<a>')
				.css({
					color: 'inherit',
					textDecoration: 'underline'
				})
				.attr('target', '_blank')
				.attr('href', url)
				.text(url);

		return getCitoidRef(url).then(
			function(expanded) {
				dialog.log(
					['Expanded reference to ', link, '.'],
					'green'
				);

				return {
					old: wikitext,
					new: startTag + expanded + endTag
				};
			},
			function() {
				dialog.log(
					['Error expanding reference ', link, '.'],
					'red'
				);

				return wikitext;
			}
		).always(this.incrementDone.bind(this));
	};

	MainDialog.prototype.processReference = function(wikitext) {
		if (wikitext.match(/<ref.*?> *{{/)) {
			this.log('Skipping already expanded reference.');

			return this.incrementDone(wikitext);
		}

		var parts = wikitext.match(/(<ref.*?>)(.*?)(<\/ref>)/),
			startTag = parts[1],
			refText = parts[2].trim(),
			endTag = parts[3],
			match;

		// Unescape HTML escape codes
		this.textarea.innerHTML = refText;
		refText = this.textarea.value;

		// Match url in brackets
		match = refText.match(this.enclosedUrlRegex);

		if (match)
			return this.getExpandedReference(wikitext, startTag, match[1], endTag);

		// Match url out of brackets
		match = refText.match(this.unenclosedUrlRegex);

		if (match) {
			// Remove trailing punctuation
			// From Parser::makeFreeExternalLink
			var sep = ',;.:!?';
			if (match[1].indexOf('(') == -1) sep += ')';

			var trailLength = 0;

			for (var i = match[1].length - 1; i >= 0; i--) {
				if (sep.indexOf(match[1][i]) == -1)
					break;
				else
					trailLength++;
			}

			var url = match[1].substring(0, match[1].length - trailLength);

			return this.getExpandedReference(wikitext, startTag, url, endTag);
		}

		this.log('Skipped reference without URL.');

		return this.incrementDone(wikitext);
	};

	MainDialog.prototype.showReference = function(reference) {
		if (!reference.new)
			return reference;

		var useNew = true,
			newText = reference.new,
			checkbox = new OO.ui.CheckboxInputWidget({selected: true}),
			oldTextInput = new OO.ui.MultilineTextInputWidget({
				autosize: true,
				readOnly: true,
				value: reference.old
			}),
			newTextInput = new OO.ui.MultilineTextInputWidget({
				autosize: true,
				value: reference.new
			});

		checkbox.on('change', function(selected) {
			oldTextInput.setDisabled(!selected);
			newTextInput.setDisabled(!selected);

			useNew = selected;
		});

		newTextInput.on('change', function(text) {
			newText = text;
		});

		this.reviewElement.append(
			checkbox.$element.css('margin-right', '0'),
			oldTextInput.$element.css('word-break', 'break-all'),
			newTextInput.$element.css('word-break', 'break-all')
		);

		oldTextInput.on('change', function() {
			syncSize(oldTextInput, newTextInput);
		});

		newTextInput.on('change', function() {
			syncSize(oldTextInput, newTextInput);
		});

		syncSize(oldTextInput, newTextInput);

		return function() {
			return useNew ? newText : reference.old;
		};
	};

	MainDialog.prototype.prepareReviewElement = function() {
		this.reviewElement
			.css({
				display: 'grid',
				gridAutoColumns: 'auto 1fr 1fr',
				gap: '8px'
			})
			.append(
				$('<div>')
					.html(this.constructor.static.disclaimer)
					.css({
						gridColumn: '1 / 4',
						marginBottom: '8px',
						fontSize: '0.9em',
						lineHeight: '1.4em',
						color: '#54595D'
					}),
				$('<div>').text('Old Reference').css({
					gridColumn: '2',
					fontWeight: 'bold',
					textAlign: 'center'
				}),
				$('<div>').text('New Reference').css({
					gridColumn: '3',
					fontWeight: 'bold',
					textAlign: 'center'
				})
			);
	};

	MainDialog.prototype.afterExpanded = function(references, content) {
		var work = false;

		for (var i = 0; i < references.length; i++) {
			if (!references[i].new) continue;

			work = true;
			break;
		}

		if (!work) {
			this.setStatus('Done');
			this.log('No references to expand.');

			return $.Deferred().reject();
		}

		this.setStatus('Review');
		this.log('Showing expanded references for review.');
		this.actions.setMode('review');

		this.logElement.hide();
		this.progressBar.$element.hide();
		this.reviewElement.appendTo(this.content.$element);

		this.prepareReviewElement();

		// Used by save function
		this.references = references.map(this.showReference.bind(this));
		this.saveDeferred = $.Deferred();
		this.pageContent = content;

		return this.saveDeferred.promise();
	};

	MainDialog.prototype.expandReferences = function(content) {
		var dialog = this;

		this.progressBar.setProgress(0);
		this.setStatus('Running...');

		var references = content.match(this.refRegex);

		if (references) {
			this.progressDone = 0;
			this.progressTotal = references.length;

			var promises = references.map(this.processReference.bind(this));

			return $.when.apply($, promises).then(function() {
				return dialog.afterExpanded(Array.prototype.slice.call(arguments), content);
			});
		} else {
			this.setStatus('Done');
			this.log('No references found on the page.');

			return $.Deferred().reject();
		}
	};

	MainDialog.prototype.saveChanges = function() {
		var dialog = this,
			pos = 0,
			newContent = this.pageContent.replace(this.refRegex, function() {
				var ref = dialog.references[pos++];

				if (typeof ref === 'function')
					return ref();

				return ref;
			});

		this.setStatus('Saving...');

		this.saveDeferred.resolve({
			text: newContent,
			summary: 'Expanding bare references using [[en:w:User:BrandonXLF/ReferenceExpander|ReferenceExpander]]'
		});

		return this.apiEdit;
	};

	MainDialog.prototype.getActionProcess = function(action) {
		if (action === 'back') {
			return new OO.ui.Process(function() {
				this.setStatus('Log');
				this.actions.setMode('finishedLog');

				this.reviewElement.hide();
				this.logElement.show();

				this.updateSize();
				this.$body.scrollTop(this.$body.prop('scrollHeight'));
			}, this);
		}

		if (action === 'continue') {
			return new OO.ui.Process(function() {
				this.setStatus('Review');
				this.actions.setMode('review');

				this.logElement.hide();
				this.reviewElement.show();

				this.updateSize();
			}, this);
		}

		if (action === 'save') {
			return new OO.ui.Process(function() {
				var dialog = this;

				return this.saveChanges().then(function() {
					dialog.setStatus('Saved');
					dialog.close();

					window.location.reload();
				});
			}, this);
		}

		return MainDialog.super.prototype.getActionProcess.call(this, action);
	};

	MainDialog.prototype.getBodyHeight = function() {
		return this.content.$element.outerHeight(true);
	};

	var windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);

	var dialog = new MainDialog({size: 'large'});
	windowManager.addWindows([dialog]);
	windowManager.openWindow(dialog);
});
// </nowiki>