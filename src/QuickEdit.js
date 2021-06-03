/** Quick Edit **/

// Edit sections of a page without leaving the article
// [[User:BrandonXLF/QuickEdit]]
// By [[User:BrandonXLF]]

(function() {
	var mobile = mw.config.get('skin') === 'minerva',
		apiSingleton,
		titleRegexp = new RegExp(
			mw.config.get('wgArticlePath').replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\$1/, '([^?]+)') +
			'|[?&]title=([^&#]*)'
		);

	function api(func, params) {
		if (!apiSingleton) apiSingleton = new mw.Api();

		$.extend(params, {
			errorformat: 'html',
			errorlang: mw.config.get('wgUserLanguage'),
			errorsuselocal: true
		});

		return apiSingleton[func](params).fail(function(_, data) {
			mw.notify(apiSingleton.getErrorMessage(data), {
				type: 'error',
				tag: 'quickedit'
			});
		});
	}

	function getPageInfo(title, sectionID) {
		return api('get', {
			action: 'query',
			curtimestamp: 1,
			prop: 'revisions',
			indexpageids: 1,
			titles: title,
			rvprop: ['timestamp', 'content'],
			rvslots: 'main',
			rvsection: sectionID
		}).then(function(res) {
			var rev = res.query.pages[res.query.pageids[0]].revisions[0];

			return {
				start: res.curtimestamp,
				base: rev.timestamp,
				full: rev.slots.main['*']
			};
		});
	}

	function showPreview() {
		$('#quickedit-editor .preview').remove();

		new OO.ui.ProgressBarWidget().$element.css({
			maxWidth: '100%',
			borderRadius: 0,
			boxShadow: 'none',
			margin: '8px 0'
		}).addClass('preview').appendTo('#quickedit-editor');

		return function(html) {
			$('#quickedit-editor .preview').remove();

			$('<div>').html(html).css({
				margin: '8px 0',
				border: '1px solid #a2a9b1',
				padding: '8px',
				overflowX: 'hidden'
			}).addClass('preview').appendTo('#quickedit-editor');
		};
	}

	function showCompare(title, from, to) {
		mw.loader.load('mediawiki.diff.styles');
		api('post', {
			action: 'compare',
			fromslots: 'main',
			'fromtext-main': from,
			fromtitle: title,
			frompst: 'true',
			toslots: 'main',
			'totext-main': to,
			totitle: title,
			topst: 'true'
		}).then(function(r) {
			return r.compare['*'] ? $('<table>').addClass('diff').append(
				$('<colgroup>').append(
					$('<col>').addClass('diff-marker'),
					$('<col>').addClass('diff-content'),
					$('<col>').addClass('diff-marker'),
					$('<col>').addClass('diff-content')
				)
			).append(r.compare['*']) : 'No differences.';
		}).then(showPreview());
	}

	// Parts taken from EditPage::extractSectionTitle and Parser::stripSectionName
	function getSectionSummary(text) {
		var match = text.match(/^(=+)(.+)\1\s*(\n|$)/);

		return !match ? '' : '/* ' + match[2].trim()
			// Strip internal link markup
			.replace(/\[\[:?([^[|]+)\|([^[]+)\]\]/g, '$2')
			.replace(/\[\[:?([^[]+)\|?\]\]/g, '$1')
			// Strip external link markup
			.replace(new RegExp('\\[(?:' + mw.config.get('wgUrlProtocols') + ')([^ ]+?) ([^\\[]+)\\]', 'ig'), '$2')
			// Remove wikitext quotes
			.replace(/(''|'''|''''')(?!')/g, '')
			// Strip HTML tags
			.replace(/<[^>]+?>/g, '') + ' */ ';
	}

	function showEditor(title, sectionID, el, heading, progress) {
		getPageInfo(title, sectionID).then(function(r) {
			var start = r.start,
				base = r.base,
				full = r.full,
				saving = false,
				expanded = false,
				part = full.split(/(?:^|\n)(=+.+=+)/, 3).join(''),
				post = full.replace(part, ''),
				level = 0;

			full.replace(/^(=+).+?(=+)(?:\n|$)/, function(m, a, b) {
				level = Math.min(a.length, b.length);
				return m;
			});

			var levelMatch = 'h1';
			for (var i = 2; i <= level; i++) levelMatch += ',h' + i + ':has(*)';

			var partSection = heading.nextUntil('#toc,h2:has(*),h3,h4,h5,h6'),
				fullSection = heading.nextUntil(levelMatch),
				textarea = new OO.ui.MultilineTextInputWidget({
					rows: 1,
					maxRows: 20,
					autosize: true,
					value: part,
				}),
				summary = new OO.ui.TextInputWidget({
					value: getSectionSummary(part)
				}),
				minor = new OO.ui.CheckboxInputWidget(),
				save = new OO.ui.ButtonInputWidget({
					label: 'Save',
					title: 'Save your changes',
					flags: ['primary', 'progressive']
				}),
				preview = new OO.ui.ButtonInputWidget({
					label: 'Preview',
					title: 'Preview the new wikitext'
				}),
				compare = new OO.ui.ButtonInputWidget({
					label: 'Compare',
					title: 'View the difference between the current revision and your revision'
				}),
				cancel = new OO.ui.ButtonInputWidget({
					useInputTag: true,
					label: 'Cancel',
					title: 'Close the edit form and discard changes',
					flags: ['secondary', 'destructive']
				}),
				more = new OO.ui.ButtonInputWidget({
					label: '+',
					title: 'Edit the entire section (including subsections)'
				}),
				buttons = new OO.ui.HorizontalLayout({
					items: [save, preview, compare, cancel]
				});

			if (part != full) {
				buttons.addItems([more], 3);
			}

			partSection.addClass('quickedit-hide');
			heading.addClass(heading.is('h1,h2,h3,h4,h5,h6') ? 'quickedit-heading' : 'quickedit-hide');
			el.removeClass('quickedit-loading');
			progress.$element.remove();
			textarea.$input.css({
				borderRadius: 0
			});

			save.on('click', function() {
				if (saving) return;

				var fullText = textarea.getValue() + (expanded ? '' : post);
				saving = true;
				save.setLabel('Saving...');
				compare.setDisabled(true);
				preview.setDisabled(true);
				cancel.setDisabled(true);
				more.setDisabled(true);

				api('postWithEditToken', {
					action: 'edit',
					title: title,
					section: sectionID,
					summary: summary.getValue(),
					text: fullText,
					minor: minor.isSelected() ? true : undefined,
					notminor: minor.isSelected() ? undefined : true,
					starttimestamp: start,
					basetimestamp: base
				}).then(function() {
					api('get', {
						action: 'parse',
						page: mw.config.get('wgPageName'),
						prop: ['text', 'categorieshtml']
					}).then(function(r) {
						var contentText = $('#mw-content-text'),
							catLinks = $('#catlinks');

						contentText.find('.mw-parser-output').replaceWith(r.parse.text['*']);
						mw.hook('wikipage.content').fire(contentText);

						catLinks.replaceWith(r.parse.categorieshtml['*']);
						mw.hook('wikipage.categories').fire(catLinks);

						saving = false;
					});
				}, function(code) {
					if (code == 'editconflict') {
						showEditConflict(title, sectionID, fullText).then(function(r) {
							start = r.start;
							base = r.base;
							textarea = r.textarea;
							expanded = true;
						});
					}

					compare.setDisabled(false);
					preview.setDisabled(false);
					cancel.setDisabled(false);
					more.setDisabled(expanded);
					saving = false;
					save.setLabel('Save');
				});
			});

			preview.on('click', function() {
				api('post', {
					action: 'parse',
					title: title,
					prop: 'text',
					pst: 'true',
					disablelimitreport: 'true',
					disableeditsection: 'true',
					sectionpreview: 'true',
					disabletoc: 'true',
					text: textarea.getValue()
				}).then(function(r) {
					return r.parse.text['*'] + '<div style="clear:both;"></div>';
				}).then(showPreview());
			});

			compare.on('click', function() {
				showCompare(title, part + (expanded ? post : ''), textarea.getValue());
			});

			cancel.on('click', function() {
				$('#quickedit-editor').remove();
				fullSection.removeClass('quickedit-hide');
				$('.quickedit-heading').removeClass('quickedit-heading');
			});

			more.on('click', function() {
				expanded = true;
				textarea.setValue(textarea.getValue() + post);
				fullSection.addClass('quickedit-hide');
				more.setDisabled(true);
			});

			heading.after(
				$('<div id="quickedit-editor">').css({
					overflowX: 'hidden'
				}).append(
					$('<div>').css({
						backgroundColor: '#eaecf0',
						borderBottom: '1px solid #a2a9b1',
						marginBottom: '8px'
					}).append(
						textarea.$element.css({
							width: '100%',
							maxWidth: '100%',
							fontFamily: 'monospace, monospace'
						}).addClass('quickedit-textarea'),
						$('<div>').css({
							border: '1px solid #a2a9b1',
							borderWidth: '0 1px'
						}).append(
							$('<div>').css({
								padding: '8px 4px 8px 8px',
								display: 'table-cell',
								verticalAlign: 'middle'
							}).html('Edit&nbsp;summary:'),
							summary.$element.css({
								width: '100%',
								maxWidth: '100%',
								padding: '8px 0px',
								display: 'table-cell',
								verticalAlign: 'middle'
							}),
							new OO.ui.FieldLayout(minor, {
								label: new OO.ui.HtmlSnippet('Minor&nbsp;edit?'),
								align: 'inline'
							}).$element.css({
								padding: '8px 8px 8px 4px',
								display: 'table-cell',
								verticalAlign: 'middle'
							})
						),
						buttons.$element.css({
							border: '1px solid #a2a9b1',
							borderWidth: '0 1px',
							padding: '0px 8px 0'
						}),
						title !== mw.config.get('wgPageName') ? $('<div>').css({
							border: '1px solid #a2a9b1',
							borderWidth: '0 1px',
							padding: '0px 8px 8px'
						}).append(
							'Editing page: ',
							$('<a>').attr('href', mw.config.get('wgArticlePath').replace('$1', title)).css({
								fontWeight: 'bold'
							}).text(title.replace(/_/g, ' '))
						) : undefined
					)
				)
			);
		}, function() {
			el.removeClass('quickedit-loading');
			progress.$element.remove();
		});
	}

	function showEditConflict(title, sectionID, text) {
		return getPageInfo(title, sectionID).then(function(r) {
			var textarea = new OO.ui.MultilineTextInputWidget({
					rows: 1,
					maxRows: 20,
					autosize: true,
					value: r.full
				}),
				textarea2 = new OO.ui.MultilineTextInputWidget({
					rows: 1,
					maxRows: 20,
					autosize: true,
					value: text,
				});

			function syncSize() {
				textarea.styleHeight = -1;
				textarea.adjustSize(true);

				textarea2.styleHeight = -1;
				textarea2.adjustSize(true);

				var height = Math.max(textarea.$input.height(), textarea2.$input.height());
				textarea.$input.height(height);
				textarea2.$input.height(height);
			}

			textarea.$input.css({
				borderRadius: 0
			});
			$('#quickedit-editor > :first-child > :first-child').remove();

			$('<table>').css({
				width: '100%',
				border: '1px solid #a2a9b1',
				borderBottom: 'none',
				borderSpacing: 0,
				margin: '0 !important'
			}).append(
				$('<tr>').append(
					$('<th>').css({
						width: '50%',
						paddingTop: '4px'
					}).text('Their version (to be saved)'),
					$('<th>').css({
						width: '50%',
						paddingTop: '4px'
					}).text('Your version')
				),
				$('<tr>').append(
					$('<td>').css({
						width: '50%',
						padding: '4px 4px 0 8px'
					}).append(
						textarea.$element.css({
							width: '100%',
							maxWidth: '100%',
							fontFamily: 'monospace, monospace'
						})
					),
					$('<td>').css({
						width: '50%',
						padding: '4px 8px 0 4px'
					}).append(
						textarea2.$element.css({
							width: '100%',
							maxWidth: '100%',
							fontFamily: 'monospace, monospace'
						})
					)
				)
			).prependTo('#quickedit-editor > :first-child');

			textarea.on('change', syncSize);
			textarea2.on('change', syncSize);
			syncSize();
			showCompare(title, text, r.full);

			r.textarea = textarea;
			return r;
		});
	}

	function clickHandler(e) {
		var el = $(e.target),
			heading = el.closest('h1,h2,h3,h4,h5,h6');

		if (!el.hasClass('quickedit-editlink') || el.hasClass('quickedit-loading')) return;

		e.preventDefault();

		if (!$.contains(document.getElementsByClassName('mw-parser-output')[0], heading[0])) {
			heading = $('.mw-parser-output').children().first();
		}

		var progress = new OO.ui.ProgressBarWidget();
		heading.after(progress.$element.css({
			maxWidth: '100%',
			borderRadius: 0,
			boxShadow: 'none'
		}));

		el.addClass('quickedit-loading');
		$('.quickedit-hide').removeClass('quickedit-hide');
		$('.quickedit-heading').removeClass('quickedit-heading');
		$('#quickedit-editor').remove();

		var targetEl = el.siblings('.quickedit-target').last(),
			titleMatch = targetEl.attr('href').match(titleRegexp),
			title = decodeURIComponent(titleMatch[1] || titleMatch[2]),
			sectionID = /[?&]v?e?section=T?-?(\d*)/.exec(targetEl.attr('href'))[1];

		showEditor(title, sectionID, el, heading, progress);
	}

	function addLinksToChildren(element) {
		element.find('#quickedit-editor, .quickedit-section').remove();
		element.find('.mw-editsection').each(function() {
			$('[href*="section="]', this).last().after(
				mobile ? '' : '<span class="quickedit-section"> | </span>',
				$('<a>').html(mobile ? '&nbsp;Q' : 'quick edit').addClass('quickedit-section quickedit-editlink')
			).addClass('quickedit-target');
		});
	}

	$.when(mw.loader.using('oojs-ui-core'), $.ready).done(function() {
		var body = $(document.body);

		body.on('click', clickHandler);
		addLinksToChildren(body);
		mw.hook('wikipage.content').add(addLinksToChildren);
	});

	mw.loader.addStyleTag(
		'.skin-minerva .mw-editsection { white-space: nowrap; }' +
		'.skin-minerva .content .collapsible-heading .quickedit-section { visibility: hidden; }' +
		'.skin-minerva .content .collapsible-heading.open-block .quickedit-section { visibility: visible; }' +
		'.quickedit-hide { display: none !important; }' +
		'.quickedit-loading, .quickedit-heading { color: #777; }'
	);
})();