/*** Test Wikitext ***/

// Adds a link to conveniently test wikitext
// Documentation at [[en:w:User:BrandonXLF/TestWikitext]]
// By [[en:w:User:BrandonXLF]]

$.when(mw.loader.using('oojs-ui'), $.ready).then(function() {
	mw.util.addPortletLink('p-cactions', mw.util.getUrl('Special:BlankPage/TestWikitext'), 'Test wikitext');

	if (mw.config.get('wgPageName') === 'Special:BlankPage/TestWikitext') {
		var preview = new OO.ui.ButtonInputWidget({
			label: 'Test',
			flags: [
				'primary',
				'progressive'
			]
		});

		preview.on('click', function() {
			output.empty().append(
				new OO.ui.ProgressBarWidget({
					progress: false
				}).$element.css('min-width', '100%')
			);

			$.post(mw.config.get('wgScriptPath') + '/api.php', {
				action: 'parse',
				pst: 'true',
				title: title.getValue() || 'Test Wikitext',
				text: code.getValue(),
				format: 'json',
				prop: 'text|displaytitle|categorieshtml|limitreporthtml'
			}).done(function(r) {
				output.html('<h1>' + r.parse.displaytitle + '</h1>' + r.parse.text['*'] + r.parse.categorieshtml['*']).append(
					new OO.ui.PanelLayout({
						expanded: false,
						framed: true,
						padded: true,
						$content: $(r.parse.limitreporthtml['*'])
					}).$element.css({
						marginTop: '2em',
						clear: 'both'
					})
				);
			});
		});

		var title = new OO.ui.TextInputWidget({
			value: localStorage.getItem('testwikitext-title'),
			name: 'title',
			placeholder: 'Title'
		});

		title.$element.css({
			width: '100%',
			maxWidth: '100%',
			marginBottom: '1em'
		});

		title.on('change', function(value) {
			localStorage.setItem('testwikitext-title', value);
		});

		var code = new OO.ui.MultilineTextInputWidget({
			rows: 10,
			maxRows: 20,
			autosize: true,
			name: 'wpTextbox1',
			value: localStorage.getItem('testwikitext'),
			placeholder: 'Wikitext'
		});

		code.$element.css({
			width: '100%',
			maxWidth: '100%',
			marginBottom: '1em'
		});

		code.on('change', function(value) {
			localStorage.setItem('testwikitext', value);
		});

		mw.loader.using('ext.wikiEditor', function() {
			mw.addWikiEditor(code.$input);
			mw.loader.load(['ext.TemplateWizard', 'ext.CodeMirror']);
		});

		var parent = $('<div>')
				.attr('id', 'testwikitext')
				.append(title.$element)
				.append(code.$element)
				.append(
					$('<div>').append(preview.$element)
				),
			panel = new OO.ui.PanelLayout({
				expanded: false,
				framed: true,
				padded: true,
				$content: parent
			}),
			output = $('<div>');

		document.title = 'Test Wikitext - ' + mw.config.get('wgSiteName');

		$('#firstHeading').text('Test Wikitext');
		$('#mw-content-text').empty().append(panel.$element, output);
	}

	mw.loader.addStyleTag(
		'#testwikitext .wikiEditor-ui-view { border: none; }' +
		'#testwikitext .wikiEditor-ui-top { border: 1px solid #a2a9b1; border-bottom: none; }' +
		'#testwikitext .wikiEditor-ui .oo-ui-textInputWidget .oo-ui-inputWidget-input { font-family: monospace; border-radius: 0; }' +
		'#testwikitext .CodeMirror { border: 1px solid #a2a9b1; }'
	);
});