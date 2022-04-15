// <nowiki>
/*** Reference Expander ***/

// Expands references that are a link to a expanded reference using {{cite ..}}
// [[w:User:BrandonXLF/ReferenceExpander]]
// By [[w:User:BrandonXLF]]

/* global getCitoidRef */

$(mw.util.addPortletLink('p-tb', '#', 'Expand references')).click(function(e) {
	e.preventDefault();

	function ProcessDialog(config) {
		ProcessDialog.super.call(this, config);
	}

	OO.inheritClass(ProcessDialog, OO.ui.ProcessDialog);

	ProcessDialog.static.name = 'citoidExpandRefs';
	ProcessDialog.static.title = 'Reference Expander';
	ProcessDialog.static.actions = [{
		action: 'close',
		label: 'Close',
		flags: ['safe', 'close']
	}];

	ProcessDialog.prototype.initialize = function() {
		ProcessDialog.super.prototype.initialize.apply(this, arguments);

		this.content = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
		this.progressBar = new OO.ui.ProgressBarWidget({
			progress: false
		});
		this.logElement = $('<div>').css('font-family', 'monospace monospace');

		this.progressBar.$element.css({marginTop: '1em'});
		this.content.$element.append(this.logElement, this.progressBar.$element);
		this.$body.append(this.content.$element);

		this.setStatus('Initalizing...');
	};

	ProcessDialog.prototype.getActionProcess = function() {
		var dialog = this;
		return new OO.ui.Process(function() {
			dialog.close();
		});
	};

	ProcessDialog.prototype.getBodyHeight = function() {
		return this.content.$element.outerHeight(true);
	};

	ProcessDialog.prototype.log = function(msg, color) {
		this.logElement.append($('<div>').text('> ' + msg).css({color: color || 'grey'}));
		this.updateSize();
		this.$body.scrollTop(this.$body.prop('scrollHeight'));
	};

	ProcessDialog.prototype.setStatus = function(text) {
		this.title.setLabel(ProcessDialog.static.title + ': ' + text);
	};

	ProcessDialog.prototype.setProgress = function(progress) {
		this.progressBar.setProgress(progress);
	};

	var windowManager = new OO.ui.WindowManager();

	$(document.body).append(windowManager.$element);

	var processDialog = new ProcessDialog({
		size: 'large'
	});

	windowManager.addWindows([processDialog]);
	windowManager.openWindow(processDialog);

	processDialog.log('Loading page content and scripts...');

	mw.loader.getScript('https://en.wikipedia.org/w/index.php?title=User:BrandonXLF/Citoid.js&action=raw&ctype=text/javascript').then(function() {
		new mw.Api().edit(mw.config.get('wgPageName'), function(rev) {
			var urlProtocols = mw.config.get('wgUrlProtocols'),
				urlProtocolsWithoutRel = mw.config.get('wgUrlProtocols').split('|').filter(function(protocol) {
					return protocol !== '\\/\\/';
				}).join('|'),
				urlCharacters = '[^<>"\\x00-\\x20\\x7F\\xA0\\u1680\\u2000-\\u200A\\u202F\\u205F\\u3000\\uFFFD]', // From Parser::EXT_LINK_URL_CLASS
				enclosedUrlRegex = new RegExp('\\[((?:' + urlProtocols + ')' + urlCharacters + '*).?\\]'),
				unenclosedUrlRegex = new RegExp('((?:' + urlProtocolsWithoutRel + ')' + urlCharacters + '*)'),
				refRegex = /<ref(?:[^>]+?[^/]|)>.*?<\/ref>/g,
				textarea = document.createElement('textarea'),
				def = $.Deferred(),
				refs = rev.content.match(refRegex),
				done = 0;

			processDialog.setProgress(0);
			processDialog.setStatus('Expanding references...');

			function afterRef(msg, color) {
				done++;

				processDialog.log(msg, color);
				processDialog.setProgress(done / refs.length * 100);

				if (done >= refs.length) {
					processDialog.setProgress(false);
					processDialog.setStatus('Saving...');
					processDialog.log('Saving changes to ' + mw.config.get('wgPageName') + '...');

					var pos = 0;

					def.resolve({
						text: rev.content.replace(refRegex, function() {
							return refs[pos++];
						}),
						summary: 'Expanding bare references using [[w:User:BrandonXLF/ReferenceExpander|ReferenceExpander]]'
					});
				}
			}

			function expandRef(startTag, url, endTag, refIndex) {
				getCitoidRef(url).then(function(expanded) {
					refs[refIndex] = startTag + expanded + endTag;
					afterRef('Expanded reference to "' + url + '".', 'green');
				}, function() {
					afterRef('Error expanding reference to "' + url + '".', 'red');
				});
			}

			function doRef(refIndex) {
				if (refs[refIndex].match(/<ref.*?> *{{/)) {
					afterRef('Skipping already expanded reference.');
					return;
				}

				var parts = refs[refIndex].match(/(<ref.*?>)(.*?)(<\/ref>)/),
					startTag = parts[1],
					refText = parts[2].trim(),
					endTag = parts[3],
					match;

				// Unescape HTML escape codes
				textarea.innerHTML = refText;
				refText = textarea.value;

				// Match url in brackets
				match = refText.match(enclosedUrlRegex);

				if (match) {
					expandRef(startTag, match[1], endTag, refIndex);
					return;
				}

				// Match url out of brackets
				match = refText.match(unenclosedUrlRegex);

				if (match) {
					// Remove trailing punctuation
					// From Parser::makeFreeExternalLink
					var sep = ',;.:!?';
					if (match[1].indexOf('(') == -1) sep += ')';

					var trailLength = 0;

					for (var i = match[1].length - 1; i >= 0; i--) {
						if (sep.indexOf(match[1][i]) == -1) break;
						else trailLength++;
					}

					expandRef(startTag, match[1].substring(0, match[1].length - trailLength), endTag, refIndex);
					return;
				}

				afterRef('Skipped reference without URL.');
				return;
			}

			if (refs) {
				for (var i = 0; i < refs.length; i++) doRef(i);
			} else {
				processDialog.log('No references found on the page.');
				def.resolve({text: rev.content});
			}

			return def.promise();
		}).then(function() {
			processDialog.setProgress(100);
			processDialog.setStatus('Edit saved!');
			processDialog.log('Edit saved. Reloading...');
			window.location.reload();
		});
	});
});
// </nowiki>