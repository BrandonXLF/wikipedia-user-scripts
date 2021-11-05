/*** Test Wikitext ***/

// Adds a link to conveniently test wikitext
// Documentation at [[User:BrandonXLF/TestWikitext]]
// By [[User:BrandonXLF]]

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
				title: title.getValue() || 'Test wikitext',
				text: code.getValue() || '',
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
			value: 'API',
			name: 'title',
			placeholder: 'Title'
		});

		title.$element.css({
			width: '100%',
			maxWidth: '100%',
			marginBottom: '1em'
		});

		var code = new OO.ui.MultilineTextInputWidget({
			rows: 10,
			name: 'wpTextbox1',
			value: localStorage.getItem('testwikitext') || '',
			placeholder: 'Wikitext'
		});

		code.$element.css({
			width: '100%',
			maxWidth: '100%',
			fontFamily: 'monospace, monospace',
			marginBottom: '1em'
		});

		code.on('change', function(v) {
			localStorage.setItem('testwikitext', v);
		});

		var parent = $('<div>')
				.append(title.$element)
				.append(code.$element)
				.append($('<div>').append(preview.$element)),
			panel = new OO.ui.PanelLayout({
				expanded: false,
				framed: true,
				padded: true,
				$content: parent
			}),
			output = $('<div>');

		document.title = 'Test wikitext - ' + mw.config.get('wgSiteName');

		$('#mw-content-text').empty().append(
			$('<h1>').attr('id', 'firstHeading').addClass('firstHeading').text('Test wikitext'),
			$('<div>').attr('id', 'bodyContent').addClass('mw-body-content').append(
				panel.$element,
				output
			)
		);
	}
});