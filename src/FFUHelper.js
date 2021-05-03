/*** FFU Helper ***/

// User script to close and resoond to FFU request
// Documentation at [[User:BrandonXLF/FFUHelper]]
// By [[User:BrandonXLF]]
// <syntaxhighlight lang=javascript>

mw.hook('wikipage.content').add(function(content) {
	if (mw.config.get('wgPageName') !== 'Wikipedia:Files_for_upload') return;

	var i = 0,
		active = '',
		activeSection = -1,
		// Template data (TOP TEMPLATE, BOTTOM TEMPLATE, TEMPLATE, DESCRIPTION, PARAMETER 1, PARAMETER 2, TALK TEMPLATE)
		data = {
			accept: [
				['{{su' + 'bst:ffu a}}', '{{su' + 'bst:ffu b}}', '{{su' + 'bst:ffu|a|file=$1}} $2', 'If the file has been uploaded.', 'File', 'Comment', '{{su' + 'bst:ffu talk|file=$1|section=SECTION}}']
			],
			decline: [
				['{{su' + 'bst:ffu d}}', '{{su' + 'bst:ffu b}}', '{{su' + 'bst:ffu|d}} $1', 'If the request has been declined.', 'Comment', '', '{{su' + 'bst:ffu talk|d|section=SECTION}}'],
				['{{su' + 'bst:ffu d}}', '{{su' + 'bst:ffu b}}', '{{su' + 'bst:ffu|blankreq}}', 'If the requesting editor did not fill in the necessary fields.', '', '', '{{su' + 'bst:ffu talk|d|section=SECTION}}'],
				['{{su' + 'bst:ffu d}}', '{{su' + 'bst:ffu b}}', '{{su' + 'bst:ffu|permission}}', 'If permission has not been granted to use the file.', '{{su' + 'bst:ffu talk|d|section=SECTION}}'],
				['{{su' + 'bst:ffu d}}', '{{su' + 'bst:ffu b}}', '{{su' + 'bst:ffu|copyrighted}}', 'If the file is copyrighted, and not available under the given license.', '', '', '{{su' + 'bst:ffu talk|d|section=SECTION}}'],
				['{{su' + 'bst:ffu d}}', '{{su' + 'bst:ffu b}}', '{{su' + 'bst:ffu|corrupt}}', 'If the file is not loading properly or is malformed.', '', '', '{{su' + 'bst:ffu talk|d|section=SECTION}}'],
				['{{su' + 'bst:ffu d}}', '{{su' + 'bst:ffu b}}', '{{su' + 'bst:ffu|blank}}', 'If the file is blank.', '', '', '{{su' + 'bst:ffu talk|d|section=SECTION}}'],
				['{{su' + 'bst:ffu d}}', '{{su' + 'bst:ffu b}}', '{{su' + 'bst:ffu|quality}}', 'If the file is too low-quality to use in an article.', '', '', '{{su' + 'bst:ffu talk|d|section=SECTION}}'],
				['{{su' + 'bst:ffu d}}', '{{su' + 'bst:ffu b}}', '{{su' + 'bst:ffu|redundant|file=$1}}', 'If a very similar file already exists.', 'File', '', '{{su' + 'bst:ffu talk|d|section=SECTION}}'],
				['{{su' + 'bst:ffu d}}', '{{su' + 'bst:ffu b}}', '{{su' + 'bst:ffu|useless}}', 'If there is no reason to have such an file on Wikipedia.', '', '', '{{su' + 'bst:ffu talk|d|section=SECTION}}'],
				['{{su' + 'bst:ffu d}}', '{{su' + 'bst:ffu b}}', '{{su' + 'bst:ffu|nonsense}}', 'If the file is too strange to be used. This is not the same as corrupt above.', '', '', '{{su' + 'bst:ffu talk|d|section=SECTION}}'],
				['{{su' + 'bst:ffu d}}', '{{su' + 'bst:ffu b}}', '{{su' + 'bst:ffu|blp}}', 'If the file is a BLP violation.', '', '', '{{su' + 'bst:ffu talk|d|section=SECTION}}'],
				['{{su' + 'bst:ffu d}}', '{{su' + 'bst:ffu b}}', '{{su' + 'bst:ffu|advert}}', 'If the file is spam or advertising.', '', '', '{{su' + 'bst:ffu talk|d|section=SECTION}}'],
				['{{su' + 'bst:ffu d}}', '{{su' + 'bst:ffu b}}', '{{su' + 'bst:ffu|van}}', 'Plain, pure vandalism files. This is not the same as nonsense, because vandal requests are usually made in bad faith.', '', '', '{{su' + 'bst:ffu talk|d|section=SECTION}}'],
				['{{su' + 'bst:ffu d}}', '{{su' + 'bst:ffu b}}', '{{su' + 'bst:ffu|afce}}', 'For submissions that were on hold pending a draft\'s review at AfCwhere the draft has not been reviewed due to the backlog. This decline should only be used after a 7-day hold.', '', '', '{{su' + 'bst:ffu talk|d|section=SECTION}}'],
				['{{su' + 'bst:ffu d}}', '{{su' + 'bst:ffu b}}', '{{su' + 'bst:ffu|afcd|page=$1}}', 'For submissions that were on hold pending a draft\'s acceptance at AfC which was declined.', 'Draft', '', '{{su' + 'bst:ffu talk|d|section=SECTION}}'],
				['{{su' + 'bst:ffu d}}', '{{su' + 'bst:ffu b}}', '{{su' + 'bst:ffu|afdd|page=$1|afd location=$2}}', 'For submissions that were on hold pending an AfD outcome, which was delete.', 'Page', '', 'AFD location', '{{su' + 'bst:ffu talk|d|section=SECTION}}'],
				['{{su' + 'bst:ffu d}}', '{{su' + 'bst:ffu b}}', '{{su' + 'bst:ffu|csdd|page=$1}}', '	For submissions where the associated article has been deleted under CSD.', 'Page', '', '{{su' + 'bst:ffu talk|d|section=SECTION}}']
			],
			comment: [
				['{{su' + 'bst:ffu h}}', '', '{{su' + 'bst:ffu|c}} $1', 'Add a comment.', 'Comment', '', '{{su' + 'bst:ffu talk|c|section=SECTION}}'],
				['{{su' + 'bst:ffu h}}', '', '{{su' + 'bst:ffu|l}}', 'If no (link to a) license has been given.', '', '', '{{su' + 'bst:ffu talk|c|section=SECTION}}'],
				['{{su' + 'bst:ffu h}}', '', '{{su' + 'bst:ffu|flickr}}', 'For copyrighted Flickr files, where it could be assumed, that the request was made by the owner of the Flickr account.', '', '', '{{su' + 'bst:ffu talk|c|section=SECTION}}'],
				['{{su' + 'bst:ffu h}}', '', '{{su' + 'bst:ffu|commons}}', 'Asks the user to upload the file to Wikimedia Commons.', '', '', '{{su' + 'bst:ffu talk|c|section=SECTION}}'],
				['{{su' + 'bst:ffu h}}', '', '{{su' + 'bst:ffu|rat}}', 'Asks the user to complete a non-free use rationale for the file, if none has been provided, and the file meets the Non-free content guideline.', '', '', '{{su' + 'bst:ffu talk|c|section=SECTION}}'],
				['{{su' + 'bst:ffu h}}', '', '{{su' + 'bst:ffu|nourl}}', 'If the request lacks an url to the file, but it indicates a presence of an offline source.', '', '', '{{su' + 'bst:ffu talk|h|section=SECTION}}'],
				['{{su' + 'bst:ffu h}}', '', '{{su' + 'bst:ffu|fixurl}}', 'If the request contains a url that does not work.', '', '', '{{su' + 'bst:ffu talk|h|section=SECTION}}'],
				['{{su' + 'bst:ffu h}}', '', '{{su' + 'bst:ffu|h}}', 'Places a request on hold while a reviewer awaits a permission confirmation.', '', '', '{{su' + 'bst:ffu talk|h|section=SECTION}}'],
				['{{su' + 'bst:ffu h}}', '', '{{su' + 'bst:ffu|afd|page=$1|afd location=$2}}', 'Places a request on hold if a non-free image is to be used in an article, which is at AfD.', 'Page', 'AfD Location', '{{su' + 'bst:ffu talk|h|section=SECTION}}'],
				['{{su' + 'bst:ffu h}}', '', '{{su' + 'bst:ffu|afc|page=$1}}', 'Places a request on hold if a non-free image is to be used in an article, which is awaiting review at AFC.', 'Page', '', '{{su' + 'bst:ffu talk|afc|section=SECTION}}']
			],
		};

	// Select comment template
	function select(el, arr, i, name) {
		var label = $('<label style="display:block;">')
			.append($('<input type="radio" data-arraypos="' + i + '" name="' + name + '"></input>').click(function() {
				$('#ffuparameter1' + name +', #ffuparameter2' + name).remove();
				$('#' + name).attr('id', '');
				$(this).attr('id', name);
				if (arr[i][5]) {
					$(el.find('label')[i])
						.after($('<span id="ffuparameter2' + name + '" style="margin-left:2em;display:block;">')
							.append('2: ')
							.append($('<input style="border:none;border-bottom:1px solid #555;padding:2px;" type="text" placeholder="' + arr[i][5] + '"></input>'))
						);
				}
				if (arr[i][4]) {
					$(el.find('label')[i])
						.after($('<span id="ffuparameter1' + name + '" style="margin-left:2em;display:block;">')
							.append('1: ')
							.append($('<input style="border:none;border-bottom:1px solid #555;padding:2px;" type="text" placeholder="' + arr[i][4] + '"></input>'))
						);
				}
			}))
			.append(arr[i][2].replace(/\|section=SECTION/g, '').replace(/\|[a-z0-9A-Z _-]+=\$[0-9]/g, '').replace(/ \$[0-9]/g, '') + ' - <i>' + arr[i][3] + '</i>');
		el.append(label);
		return label;
	}

	// Start user interface
	function clickui(e) {
		var type = $(e.target).text(),
			section = parseInt(e.target.parentNode.getAttribute('data-section')),
			secname = $(e.target).closest('h2').find('.mw-headline').attr('id');

		e.preventDefault();
		$('#ffuhelper').remove();

		if (active == type && activeSection == section) {
			active = '';
			return;
		}

		active = type;
		activeSection = section;

		var user = '',
			element = $(e.target).closest('h2').next();

		while (user === '' && element[0]) {
			user = element.find('a[href*="Special:Contributions"], a[href*="User:"]').attr('href') || '';
			element = element.next();
		}

		user = (user.match(/.*(?:user:|User:|\/)(.*)$/) || ['', ''])[1];
		user = (user.match(/(.*?)&.*/) || ['', ''])[1] || user;

		$(this).closest('h2').after($('<p id="ffuhelper" style="border:1px solid ' + {comment: 'grey', decline: 'red', accept: 'green'}[type] + ';border-radius:4px;padding:4px 0.5em;"></p>')
			.append('<span style="font-size:125%;font-weight:bold;">FFU Helper - ' + type.charAt(0).toUpperCase() + type.slice(1) + '</span><br>')
			.append($('<div style="margin-left:5px;">').append(function() {
				for (i = 0; i < data[type].length; i++) {
					var label = select($(this), data[type], i, type);
					if (i === 0) label.children().first().click();
				}
				return '';
			}))
			.append('<hr style="margin:0.5em;">')
			.append(type == 'comment' ? ('<div style="margin-left:5px;"><label><input type="checkbox" id="ffutoptemplate" checked>Add 7 day hold notice</input></label></div>') : '')
			.append('<div style="margin-left:5px;"><label><input type="checkbox" id="ffunotify" checked>Notify user: </input></label><input style="border:none;border-bottom:1px solid #555;padding:2px;" placeholder="User" value="' + user + '" id="ffuuser"></div>')
			.append($('<div style="margin:4px 0 0 -4px;">')
				// Save changes
				.append($('<button style="margin:4px;">Save</button>').click(function() {
					if (!$('#' + type).attr('data-arraypos')) return;
					$.get(mw.config.get('wgScript'), {
						title: mw.config.get('wgPageName'),
						action: 'raw',
						section: section
					}).done(function(r) {
						r = r + '\n:' + data[type][$('#' + type).attr('data-arraypos')][2].replace(/\$1/, $('#ffuparameter1' + type + ' input').val() || '').replace(/\$2/, $('#ffuparameter2' + type + ' input').val() || '') + '~~' + '~~';

						if ($('#ffutoptemplate').prop('checked') !== false && data[type][$('#' + type).attr('data-arraypos')][0]) {
							if (type == 'comment') {
								r = r.replace(/{{(?:Template:|)[Ff]fu h\|.*?}}/g, '');
								r = r.replace(/-->\n/, '-->');
								r = r.replace(/-->\n+/, '-->');
								r = r.replace(/\n+<!--/, '<!--');
							} else {
								r = r.replace(/(<!-- \[\[User:DoNotArchiveUntil\]\].*[\n\r]*)/, '');
							}
							r = r.replace(/(==.*==)\n*/, '$1\n' + data[type][$('#' + type).attr('data-arraypos')][0] + '\n');
						}

						if (data[type][$('#' + type).attr('data-arraypos')][1]) {
							r = r + '\n' + data[type][$('#' + type).attr('data-arraypos')][1];
						}

						var c = 0,
							s = $('#ffunotify').prop('checked') && $('#ffuuser').val() ? 2 : 1;

						function updatePage() {
							c++;
							if (c === s) {
								mw.notify('Updating page...');
								$.get(mw.config.get('wgScriptPath') + '/api.php', {
									action: 'parse',
									page: mw.config.get('wgPageName'),
									prop: 'text|categorieshtml',
									format: 'json'
								}).done(function(r) {
									$('.mw-parser-output').replaceWith(r.parse.text['*']);
									mw.hook('wikipage.content').fire($('#mw-content-text'));
									$('#catlinks').replaceWith(r.parse.categorieshtml['*']);
									mw.hook('wikipage.categories').fire($('.catlinks'));
									mw.notify('Page updated.');
								});
							}
						}

						mw.notify('Editing FFU request...');

						$.post(mw.config.get('wgScriptPath') + '/api.php', {
							action: 'edit',
							section: section,
							text: r,
							title: mw.config.get('wgPageName'),
							token: mw.user.tokens.get('csrfToken'),
							summary: ((type.charAt(0).toUpperCase() + type.slice(1)) + 'ed').replace('ee', 'e').replace('Commented', 'Commented on') + ' request using [[User:BrandonXLF/FFUHelper|FFU Helper]]'
						}).done(function() {
							mw.notify('Finished editing FFU request.');
							updatePage();
						});

						if ($('#ffunotify').prop('checked') && $('#ffuuser').val()) {
							mw.notify('Posting on user talk page...');
							$.post(mw.config.get('wgScriptPath') + '/api.php', {
								action: 'edit',
								appendtext: '\n\n' + data[type][$('#' + type).attr('data-arraypos')][6].replace(/\$1/, $('#ffuparameter1' + type + ' input').val() || '').replace(/\$2/, $('#ffuparameter2' + type + ' input').val() || '').replace('SECTION', secname.replace(/_/g, ' ') || '') + '~~' + '~~',
								title: 'User talk:' + $('#ffuuser').val(),
								token: mw.user.tokens.get('csrfToken'),
								summary: 'Notifying about [[WP:FFU|FFU]] request using [[User:BrandonXLF/FFUHelper|FFU Helper]]'
							}).done(function() {
								mw.notify('Finished positing on user talk page.');
								updatePage();
							});
						} else if ($('#ffunotify').prop('checked')) {
							mw.notify('No username given to notify.');
						}
					});
				}))
				// Abort changes
				.append($('<button style="margin:4px;">Cancel</button>').click(function() {
					$('#ffuhelper').remove();
					active = 0;
				}))
			)
			.append(
				'<span style="display:block;margin-top:4px;">[' +
				'<a href="https://en.wikipedia.org/wiki/Wikipedia:Files_for_upload/Reviewer_instructions">Reviewer instructions</a>' +
				' &bull; <a href="https://commons.wikimedia.org/wiki/Special:UploadWizard">Commons</a>' +
				' (<a href="https://commons.wikimedia.org/wiki/Special:Upload">plain</a>)' +
				' &bull; <a href="' + mw.config.get('wgScript') + '?title=Wikipedia:File_Upload_Wizard&withJS=MediaWiki:FileUploadWizard.js">Local</a>' +
				' (<a href="' + mw.config.get('wgScript') + '?title=Special:Upload">plain</a>)' +
				' &bull; <a href="https://en.wikipedia.org/wiki/User:BrandonXLF/FFUHelper">FFU Helper</a>' +
				']</span>'
			)
		);
	}

	console.log(content);

	// Add links to sections
	content.find('.mw-parser-output > h2').each(function() {
		var section = /[?&]v?e?section=T?-?(\d*)/.exec($('[href*="title="][href*="section="]', this).attr('href'))[1];

		if ($(this).next().hasClass('navbox')) {
			$(this).find('span.mw-editsection').after('<span class="mw-editsection" style="background:#ADFF2F;">[closed]</span>');
			return;
		}

		$(this).find('span.mw-editsection')
			.after(
				$('<span style="background:yellow;" data-section="' + section + '" class="mw-editsection"></span>')
					.append('[')
					.append($('<a href="#' + $(this).closest('h2').find('.mw-headline').attr('id') + '">comment</a>').click(clickui))
					.append(']')
			)
			.after(
				$('<span style="background:yellow;" data-section="' + section + '" class="mw-editsection"></span>')
					.append('[')
					.append($('<a href="#' + $(this).closest('h2').find('.mw-headline').attr('id') + '">decline</a>').click(clickui))
					.append(']')
			)
			.after(
				$('<span style="background:yellow;" data-section="' + section + '" class="mw-editsection"></span>')
					.append('[')
					.append($('<a href="#' + $(this).closest('h2').find('.mw-headline').attr('id') + '">accept</a>').click(clickui))
					.append(']')
			);
	});
});

// </syntaxhighlight>