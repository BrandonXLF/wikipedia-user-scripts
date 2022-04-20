/*** SVG Editor ***/

// Adds a button to SVG file pages to view and edit their source code
// Documentation at [[en:w:User:BrandonXLF/SVGEditor]]
// By [[en:w:User:BrandonXLF]]

mw.loader.using(['oojs-ui', 'jquery.textSelection']).then(function() {
	function showEditor(text) {
		var isCommons = !!$('#ca-view-foreign').length,
			lineWrap = new OO.ui.ButtonInputWidget({
				label: 'Toggle line wrap',
				icon: 'newline',
				id: 'svgeditor-linewrap-btn',
				framed: false
			}),
			code = new OO.ui.MultilineTextInputWidget({
				rows: 25,
				name: 'wpTextbox1',
				id: 'svgeditoror'
			}),
			comment = new OO.ui.TextInputWidget({
				id: 'svgeditoror-comment',
				label: 'Comment',
				labelPosition: 'before'
			}),
			save = new OO.ui.ButtonInputWidget({
				label: 'Save',
				flags: ['primary', 'progressive'],
				icon: isCommons ? 'logoWikimediaCommons' : void 0,
				title: isCommons ? 'Save To Wikimedia Commons' : void 0
			}),
			preview  = new OO.ui.ButtonInputWidget({
				label: 'Preview',
				flags: ['progressive']
			}),
			cancel  = new OO.ui.ButtonInputWidget({
				label: 'Cancel',
				flags: ['destructive']
			}),
			buttons = new OO.ui.HorizontalLayout({
				items: [save, preview, cancel]
			}),
			img,
			container = $('<div>');

		mw.loader.load('oojs-ui.styles.icons-editing-advanced');

		lineWrap.on('click', function() {
			code.$input.toggleClass('line-wrap');
		});

		mw.config.set('wgCodeEditorCurrentLanguage', 'svg');

		code.$input.attr('id', 'wpTextbox1');
		code.$input.textSelection('setContents', text);

		if (isCommons) mw.loader.load('oojs-ui.styles.icons-wikimedia');

		save.on('click', function() {
			var api = isCommons ? new mw.ForeignApi('https://commons.wikimedia.org/w/api.php') : new mw.Api(),
				req = api.upload(new Blob([code.$input.textSelection('getContents')], {type: 'image/svg+xml'}), {
					filename: mw.config.get('wgTitle'),
					comment: comment.getValue(),
					ignorewarnings: 1
				});

			req.always(function(errOrRes, resWhenErr) {
				var res = resWhenErr || errOrRes;

				if (res.error) {
					mw.notify(api.getErrorMessage(res), {type: 'error'});

					return;
				}

				mw.notify('File saved! Loading updated page...', {type: 'success'});

				$.get().then(function(html) {
					var doc = new DOMParser().parseFromString(html, 'text/html');

					$('#content').replaceWith($('#content', doc).prepend(container));
				});
			});
		});

		preview.on('click', function() {
			if (!img) {
				img = $('<img>');
				img.css('max-height', '15em');
				container.append(img);
			}

			img.attr('src', 'data:image/svg+xml,' + encodeURIComponent(code.$input.textSelection('getContents')));
		});

		cancel.on('click', function() {
			$('#editsvg-container').remove();
		});

		container.attr('id', 'svgeditoror-container').append(
			lineWrap.$element,
			code.$element,
			comment.$element,
			buttons.$element
		);

		mw.util.$content.prepend(container);

		mw.loader.using(['ext.wikiEditor'], function() {
			mw.addWikiEditor(code.$input);

			if (mw.loader.getState('ext.codeEditor') === 'ready') {
				mw.loader.state({'ext.codeEditor': 'loaded'});
			}

			mw.loader.load(['ext.codeEditor']);

			$.wikiEditor.modules.editSVGTools = {
				req: ['editSVGTools']
			};

			$.wikiEditor.extensions.editSVGTools = function(ctx) {
				lineWrap.$element.remove();

				ctx.api.addToToolbar(ctx, {
					section: 'main',
					groups: {
						'editsvg-tools': {
							tools: {
								lineWrap: {
									label: 'Toggle line wrap',
									type: 'toggle',
									oouiIcon: 'newline',
									action: {
										type: 'callback',
										execute: function() {
											code.$input.toggleClass('line-wrap');
										}
									}
								}
							}
						},
					}
				});
			};

			code.$input.wikiEditor('addModule', 'editSVGTools');
		});
	}

	$(function() {
		if (mw.config.get('wgNamespaceNumber') !== 6) return;

		var url = $('#file > a').attr('href');

		if (!/.+svg$/.test(url)) return;

		var link;

		if (mw.config.get('skin') === 'minerva') {
			mw.loader.load('oojs-ui.styles.icons-editing-advanced');

			link = $(mw.util.addPortletLink('page-actions', '#', 'Edit SVG', 'page-actions-svgeditor', '', '', '#page-actions-edit'));
			var iconUrl ='/w/load.php?modules=oojs-ui.styles.icons-editing-advanced&image=markup&format=rasterized';

			mw.loader.addStyleTag('#page-actions-svgeditor .mw-ui-icon:before { background: url(' + iconUrl + '); }');
		} else {
			link = $(mw.util.addPortletLink('p-views', '#', 'Edit SVG', 'ca-editsvg', '', '', '#ca-edit'));
		}

		link.on('click', function(e) {
			e.preventDefault();

			$('#svgeditoror-container').remove();

			$.get(url, null, null, 'text').then(showEditor);
		});

		mw.loader.addStyleTag(
			'#svgeditoror, #svgeditoror-comment { width: unset !important; max-width: unset !important; marin: none !important; }' +
			'#svgeditoror textarea { font-family: monospace; resize: vertical; white-space: nowrap; }' +
			'#svgeditoror textarea.line-wrap { white-space: normal; }' +
			'#svgeditoror .wikiEditor-ui textarea { border: none !important; }' +
			'.skin-minerva #svgeditoror-container, #svgeditoror-container > * { margin: 1em 0; }' +
			'.skin-minerva #svgeditoror-container { margin: 1em; }' +
			'.skin-minerva #svgeditor-linewrap-btn { margin-bottom: -0.5em; }' +
			'#svgeditoror .group-insert, #svgeditoror .group-format, #svgeditoror .sections { display: none; }' +
			'#svgeditoror .tabs span.tab-advanced, #svgeditoror .tabs span.tab-characters, #svgeditoror .tabs span.tab-help { display: none; }' +
			'.codeEditor-ui-toolbar .group-editsvg-tools { display: none; }'
		);
	});
});