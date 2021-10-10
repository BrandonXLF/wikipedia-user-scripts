/*** Compare Revisions ***/

// Adds a button to the diff page to compare two revisions side-by-side
// Documentation at [[User:BrandonXLF/CompareRevisions]]
// By [[User:BrandonXLF]]

$.when(mw.loader.using('oojs-ui'), $.ready).then(function() {
	var cache = {};

	mw.hook('wikipage.diff').add(function() {
		var oldId = mw.config.get('wgDiffOldId'),
			newId = mw.config.get('wgDiffNewId'),
			bar = new OO.ui.ButtonSelectWidget({items: [
				new OO.ui.ButtonOptionWidget({
					label: 'Diff',
					data: 'diff'
				}),
				new OO.ui.ButtonOptionWidget({
					label: 'Compare',
					data: 'compare'
				}),
				new OO.ui.ButtonOptionWidget({
					label: 'Compare Wikitext',
					data: 'wikitext'
				})
			]}),
			compareArea = $('<div>').attr('id', 'comparerevisions-area');

		if (!oldId || !newId) return;

		function showComparison(cachePrefix, displayFunc, getFunc) {
			var compareOld = $('<div>').addClass('comparerevisions-side'),
				compareNew = $('<div>').addClass('comparerevisions-side');

			function showRevision(revId, el) {
				var cacheKey = cachePrefix + '-' + revId;

				compareArea.append(
					el.append(
						$('<div>').css('text-align', 'center').text('Loading...')
					)
				);

				if (cache[cacheKey]) {
					displayFunc(el.empty(), cache[cacheKey], revId);
				} else {
					getFunc(revId).done(function(data) {
						cache[cacheKey] = data;
						displayFunc(el.empty(), cache[cacheKey], revId);
					});
				}
			}

			showRevision(oldId, compareOld);
			showRevision(newId, compareNew);
		}

		$('.diff-title').after(
			$('<tr>').append(
				$('<td>').attr('colspan', '4').append(compareArea)
			)
		);

		bar.$element.css({
			float: 'left',
			margin: $('.ve-init-mw-diffPage-diffMode').length ? '0 0 0 8px' : '8px 0'
		});

		if ($('.ve-init-mw-diffPage-diffMode').length) {
			$('.ve-init-mw-diffPage-diffMode').append(bar.$element);
		} else if ($('.mw-revslider-container').length) {
			$('.mw-revslider-container').after(bar.$element);
		} else {
			$('#mw-content-text').prepend(bar.$element);
		}

		bar.on('select', function(e) {
			mw.storage.set('comparerevisions-lastview', e.data);

			compareArea.empty();

			if (e.data == 'compare') {
				showComparison(
					'compare',
					function(el, html, revId) {
						el.html(html);
						el.find('[for="toctogglecheckbox"]').attr('for', 'toctogglecheckbox-' + revId);
						el.find('#toctogglecheckbox').attr('id', 'toctogglecheckbox-' + revId);
					},
					function(revId) {
						return $.get(mw.config.get('wgScriptPath') + '/api.php', {
							action: 'parse',
							oldid: revId,
							prop: 'text',
							format: 'json'
						}).then(function(res) {
							return res.parse.text['*'];
						});
					}
				);
			} else if (e.data == 'wikitext') {
				showComparison(
					'wikitext',
					function(el, text) {
						el.append(
							$('<pre></pre>').text(text)
						);
					},
					function(revId) {
						return $.get(mw.config.get('wgScript'), {
							action: 'raw',
							oldid: revId
						});
					}
				);
			}
		});

		bar.selectItemByData(mw.storage.get('comparerevisions-lastview') || 'diff');
	});

	mw.loader.addStyleTag(
		'#comparerevisions-area { border-spacing: 0; }' +
		'.comparerevisions-side { width: 50%; padding: 3px 10px; box-sizing: border-box; float: left; }'
	);
});