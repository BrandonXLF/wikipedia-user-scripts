// <nowiki>
/*** Reference Expander ***/

// Expands references that are a link to a expanded reference using {{cite ..}}
// [[User:BrandonXLF/ReferenceExpander]]
// By [[User:BrandonXLF]]

/* global getCitoidRef */

$(mw.util.addPortletLink('p-tb', '#', 'Expand references')).click(function(e) {
	e.preventDefault();
	var progress = new OO.ui.ProgressBarWidget({
			progress: false
		}),
		doing = $('<div style="margin:0.5em 0;font-weight:bold;">Initalizing...</div>'),
		logElement = $('<div style="font-family:monospace monospace;"></div>');

	function log(msg, color) {
		logElement.append($('<div>').text('> ' + msg).css({color: color || 'grey'}));
	}

	function ProcessDialog(config) {
		ProcessDialog.super.call(this, config);
	}

	OO.inheritClass(ProcessDialog, OO.ui.ProcessDialog);

	ProcessDialog.static.name = 'citoidExpandRefs';
	ProcessDialog.static.title = 'Reference Expanders';
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
		processDialog.content.$element.append(progress.$element, doing, logElement);
		this.$body.append(this.content.$element);
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

	var windowManager = new OO.ui.WindowManager();

	$(document.body).append(windowManager.$element);

	var processDialog = new ProcessDialog({
		size: 'large'
	});

	windowManager.addWindows([processDialog]);
	windowManager.openWindow(processDialog);

	log('Loading page content and scripts...');

	mw.loader.getScript('https://en.wikipedia.org/w/index.php?title=User:BrandonXLF/Citoid.js&action=raw&ctype=text/javascript').then(function() {
		new mw.Api().edit(mw.config.get('wgPageName'), function(rev) {
			var def = $.Deferred(),
				refs = rev.content.match(/<ref.*?>.*?<\/ref>/g),
				done = 0;

			progress.setProgress(0);
			doing.text('Expanding references...');

			function afterRef(msg, color) {
				done++;

				log(msg, color);
				progress.setProgress(done/refs.length*100);
				processDialog.updateSize();

				if (done >= refs.length) {
					progress.setProgress(false);
					doing.text('Saving...');
					log('Saving changes to ' + mw.config.get('wgPageName') + '...');
					processDialog.updateSize();

					var pos = 0;

					def.resolve({
						text: rev.content.replace(/<ref.*?>.*?<\/ref>/g, function() {
							return refs[pos++];
						}),
						summary: 'Expanding bare references using [[User:BrandonXLF/ReferenceExpander|ReferenceExpander]]'
					});
				}
			}

			function doRef(i) {
				if (refs[i].match(/<ref.*?> *{{/)) {
					afterRef('Skipping already expanded reference.');
					return;
				}

				var parts = refs[i].match(/(<ref.*?>)(.*?)(<\/ref>)/),
					unexpanded = parts[2].trim().match(/\[?([^ \]]*)*\]?/)[1].trim();

				getCitoidRef(unexpanded).then(function(expanded) {
					refs[i] = parts[1] + expanded + parts[3];
					afterRef('Expanded reference to "' + unexpanded + '".', 'green');
				}, function() {
					afterRef('Error expanding reference to "' + unexpanded + '".', 'red');
				});
			}

			if (refs) {
				for (var i = 0; i < refs.length; i++) doRef(i);
			} else {
				log('No references found on the page.');
				def.resolve({
					text: rev.content
				});
			}

			return def.promise();
		}).then(function() {
			progress.setProgress(100);
			doing.text('Edit saved!');
			log('Edit saved. Reloading...');

			window.location.reload();
		});
	});
});
// </nowiki>