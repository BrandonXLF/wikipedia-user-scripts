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
			modes: ['review', 'finishedLog', 'log', 'done']
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
		},
		{
			label: 'Done',
			flags: ['primary'],
			modes: 'done'
		}
	];

	MainDialog.static.disclaimer = new OO.ui.HtmlSnippet(
		'<strong>Reminder</strong>: You are responsible for all changes made by this script.' +
		' Edit the new references to make sure they include all the information contained in the old references.' +
		' You may uncheck a checkbox to skip expanding the corresponding reference.'
	);

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

		this.logElement = $('<div>').css({
			wordBreak: 'break-all',
			color: 'grey'
		});

		this.reviewElement = $('<div>');

		this.content.$element.append(this.logElement);
		this.$body.append(this.content.$element);
	};

	MainDialog.prototype.getSetupProcess = function(data) {
		return MainDialog.super.prototype.getSetupProcess.call(this, data)
			.next(function() {
				this.executeAction('load');
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
		var notice = new OO.ui.MessageWidget({
			type: 'warning',
			label: this.constructor.static.disclaimer
		});

		notice.$icon.css('background-position', '0 center');
		notice.$label.css('margin-left', '2.25em');

		this.reviewElement
			.css({
				display: 'grid',
				gridAutoColumns: 'auto 1fr 1fr',
				gap: '8px'
			})
			.append(
				notice.$element.css({
					gridColumn: '1 / 4',
					marginBottom: '8px'
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

	MainDialog.prototype.showReview = function(references, content) {
		var work = false;

		for (var i = 0; i < references.length; i++) {
			if (!references[i].new) continue;

			work = true;
			break;
		}

		if (!work) {
			this.setStatus('Done');
			this.actions.setMode('done');
			this.log('No references to expand.');

			return $.Deferred().reject();
		}

		this.setStatus('Review');
		this.actions.setMode('review');
		this.log('Showing expanded references for review.');

		this.logElement.hide();
		this.reviewElement.appendTo(this.content.$element);

		this.prepareReviewElement();

		// Used by save function
		this.references = references.map(this.showReference.bind(this));
		this.saveDeferred = $.Deferred();
		this.pageContent = content;

		this.updateSize();

		return true;
	};

	MainDialog.prototype.expandReferences = function(content) {
		this.setStatus('Expanding...');

		var references = content.match(this.refRegex);

		if (references) {
			this.progressBar = new OO.ui.ProgressBarWidget({
				progress: 0
			});

			this.$foot.append(
				this.progressBar.$element.css('margin', '1em')
			);

			this.progressDone = 0;
			this.progressTotal = references.length;

			var dialog = this,
				promises = references.map(this.processReference.bind(this));

			return $.when.apply($, promises).then(function() {
				dialog.progressBar.$element.remove();
				dialog.progressBar = undefined;

				return dialog.showReview(Array.prototype.slice.call(arguments), content);
			});
		} else {
			this.setStatus('Done');
			this.actions.setMode('done');
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

		this.apiEdit.catch(function(_, data) {
			var msg = new mw.Api().getErrorMessage(data);

			dialog.setStatus('Error');
			dialog.actions.setMode('done');
			dialog.showErrors(new OO.ui.Error(msg, {recoverable: false}));
		});

		return this.apiEdit;
	};

	MainDialog.prototype.getActionProcess = function(action) {
		if (action === 'load') {
			return new OO.ui.Process(function() {
				this.setStatus('Loading...');
				this.actions.setMode('log');
				this.log('Loading script...');

				var dialog = this,
					request = mw.loader.getScript('https://en.wikipedia.org/w/index.php?title=User:BrandonXLF/Citoid.js&action=raw&ctype=text/javascript');

				return request.then(
					function() {
						dialog.executeAction('expand');
					},
					function() {
						dialog.setStatus('Error');
						dialog.actions.setMode('done');
						dialog.log('Failed to load script. Check your internet connection and rerun the script.', 'red');

						return $.Deferred().resolve();
					}
				);
			}, this);
		}

		if (action === 'expand') {
			return new OO.ui.Process(function() {
				var dialog = this,
					deferred = $.Deferred();

				this.log('Loading page content...');

				this.apiEdit = new mw.Api().edit(mw.config.get('wgPageName'), function(rev) {
					var referencesExpanded = dialog.expandReferences(rev.content);

					referencesExpanded.always(function() {
						deferred.resolve();
					});

					return referencesExpanded.then(function() {
						return dialog.saveDeferred;
					});
				});

				return deferred.promise();
			}, this);
		}

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
					dialog.close();
					window.location.reload();
				});
			}, this);
		}

		return MainDialog.super.prototype.getActionProcess.call(this, action);
	};

	OO.ui.Dialog.prototype.onActionClick = function(action) {
		if (this.currentAction === 'save' && this.isPending()) return;

		this.executeAction(action.getAction());
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