/*** FFU Helper ***/

// User script to close and respond to FFU request
// Documentation at [[en:w:User:BrandonXLF/FFUHelper]]
// By [[en:w:User:BrandonXLF]]
// <syntaxhighlight lang=javascript>

mw.hook('wikipage.content').add(function(content) {
	if (mw.config.get('wgPageName') !== 'Wikipedia:Files_for_upload') return;

	var currentInterface,
		// Template data (TEMPLATE, DESCRIPTION, USER TALK MESSAGE TYPE, PARAMETER 1, PARAMETER 2)
		templates = {
			accept: [
				['{{su' + 'bst:ffu|a|file=$1}} $2', 'If the file has been uploaded.', '{{su' + 'bst:ffu talk|file=$1|section=SECTION}}', 'File', 'Comment']
			],
			decline: [
				['{{su' + 'bst:ffu|d}} $1', 'If the request has been declined.', 'd', 'Comment'],
				['{{su' + 'bst:ffu|blankreq}}', 'If the requesting editor did not fill in the necessary fields.', 'd'],
				['{{su' + 'bst:ffu|permission}}', 'If permission has not been granted to use the file.', 'd'],
				['{{su' + 'bst:ffu|copyrighted}}', 'If the file is copyrighted, and not available under the given license.', 'd'],
				['{{su' + 'bst:ffu|corrupt}}', 'If the file is not loading properly or is malformed.', 'd'],
				['{{su' + 'bst:ffu|blank}}', 'If the file is blank.', 'd'],
				['{{su' + 'bst:ffu|quality}}', 'If the file is too low-quality to use in an article.', 'd'],
				['{{su' + 'bst:ffu|redundant|file=$1}}', 'If a very similar file already exists.', 'd', 'File'],
				['{{su' + 'bst:ffu|useless}}', 'If there is no reason to have such an file on Wikipedia.', 'd'],
				['{{su' + 'bst:ffu|nonsense}}', 'If the file is too strange to be used. This is not the same as corrupt above.', 'd'],
				['{{su' + 'bst:ffu|blp}}', 'If the file is a BLP violation.', 'd'],
				['{{su' + 'bst:ffu|advert}}', 'If the file is spam or advertising.', 'd'],
				['{{su' + 'bst:ffu|van}}', 'Plain, pure vandalism files. This is not the same as nonsense, because vandal requests are usually made in bad faith.', 'd'],
				['{{su' + 'bst:ffu|afce}}', 'For submissions that were on hold pending a draft\'s review at AfCwhere the draft has not been reviewed due to the backlog. This decline should only be used after a 7-day hold.', 'd'],
				['{{su' + 'bst:ffu|afcd|page=$1}}', 'For submissions that were on hold pending a draft\'s acceptance at AfC which was declined.', 'd', 'Draft'],
				['{{su' + 'bst:ffu|afdd|page=$1|afd location=$2}}', 'For submissions that were on hold pending an AfD outcome, which was delete.', 'd', 'Page', 'AFD location'],
				['{{su' + 'bst:ffu|csdd|page=$1}}', 'For submissions where the associated article has been deleted under CSD.', 'd', 'Page']
			],
			comment: [
				['{{su' + 'bst:ffu|c}} $1', 'Add a comment.', 'c', 'Comment'],
				['{{su' + 'bst:ffu|l}}', 'If no (link to a) license has been given.', 'c'],
				['{{su' + 'bst:ffu|flickr}}', 'For copyrighted Flickr files, where it could be assumed, that the request was made by the owner of the Flickr account.', 'c'],
				['{{su' + 'bst:ffu|commons}}', 'Asks the user to upload the file to Wikimedia Commons.', 'c'],
				['{{su' + 'bst:ffu|rat}}', 'Asks the user to complete a non-free use rationale for the file, if none has been provided, and the file meets the Non-free content guideline.', 'c'],
				['{{su' + 'bst:ffu|nourl}}', 'If the request lacks an url to the file, but it indicates a presence of an offline source.', 'h'],
				['{{su' + 'bst:ffu|fixurl}}', 'If the request contains a url that does not work.', 'h'],
				['{{su' + 'bst:ffu|h}}', 'Places a request on hold while a reviewer awaits a permission confirmation.', 'h'],
				['{{su' + 'bst:ffu|afd|page=$1|afd location=$2}}', 'Places a request on hold if a non-free image is to be used in an article, which is at AfD.', 'h', 'Page', 'AfD Location'],
				['{{su' + 'bst:ffu|afc|page=$1}}', 'Places a request on hold if a non-free image is to be used in an article, which is awaiting review at AFC.', 'afc', 'Page']
			],
		};

	function createParameter(key, desc) {
		return $('<span>')
			.attr('id', 'ffu-parameter-' + key)
			.css({
				marginLeft: '1em',
				display: 'block'
			})
			.append(key + ': ')
			.append($('<input>')
				.attr('placeholder', desc)
				.css({
					border: 'none',
					borderBottom: '1px solid #555',
					padding: '2px'
				})
			);

	}

	function createOption(data, select) {
		var label = $('<label>'),
			code = data[0].replace(/\|[a-z0-9A-Z _-]+=\$\d/g, '').replace(/ \$\d/g, '');

		function selectClicked() {
			$('#ffu-parameter-1, #ffu-parameter-2').remove();

			$('#ffu-selected')
				.removeAttr('id')
				.find('input')
				.prop('checked', false);

			label.attr('id', 'ffu-selected');

			if (data[4])
				label.after(createParameter('2', data[4]));

			if (data[3])
				label.after(createParameter('1', data[3]));
		}

		setTimeout(function() {
			if (select)
				selectClicked();
		});

		label
			.data('ffu', data)
			.css('display', 'block')
			.append($('<input>')
				.css({
					verticalAlign: 'middle',
					marginRight: '4px'
				})
				.attr('type', 'radio')
				.prop('checked', select)
				.click(selectClicked)
			)
			.append($('<span>')
				.css('vertical-align', 'middle')
				.text(code + ' - ')
				.append($('<i>').text(data[1]))
			);

		return label;
	}

	function getUser(sectionElement) {
		var user = '',
			element = sectionElement.next();

		while (user === '' && element[0]) {
			if (!element.is(currentInterface)) {
				user = element.find('.userlink').attr('href') || '';
			}

			element = element.next();
		}

		user = decodeURIComponent(user).match(/.*(?:[Uu]ser:|\/)([^?&]+)/);
		user = user ? user[1] : '';

		return user;
	}

	function openInterface(type, section, sectionElement) {
		var sectionName = sectionElement.find('.mw-headline').attr('id').replace(/_/g, ' '),
			user = getUser(sectionElement),
			addHoldInput = $('<input>'),
			notifyUserInput = $('<input>'),
			userInput = $('<input>'),
			options = [];

		for (var i = 0; i < templates[type].length; i++) {
			options.push(createOption(templates[type][i], i === 0));
		}

		function onSave() {
			var selectedOption = $('#ffu-selected'),
				shouldNotifyUser = notifyUserInput.prop('checked');

			if (!selectedOption.length) return;

			if (shouldNotifyUser && !userInput.val()) {
				mw.notify('No username given to notify.', {
					type: 'error'
				});

				return;
			}

			$.get(mw.config.get('wgScript'), {
				title: mw.config.get('wgPageName'),
				action: 'raw',
				section: section
			}).done(function(text) {
				var data = selectedOption.data('ffu'),
					// Substitute parameters
					code = data[0]
						.replace(/\$1/, $('#ffu-parameter-1 input').val() || '')
						.replace(/\$2/, $('#ffu-parameter-2 input').val() || '');

				text += '\n:' + code + ' ~~' + '~~';

				// Add hold notice for comments
				if (type === 'comment' && addHoldInput.prop('checked')) {
					text = text.replace(/{{(?:Template:|)[Ff]fu h\|.*?}}/g, '');
					text = text.replace(/-->\n/, '-->');
					text = text.replace(/-->\n+/, '-->');
					text = text.replace(/\n+<!--/, '<!--');

					text = text.replace(/(==.*==)\n*/, '$1\n{{su' + 'bst:ffu h}}\n');
				}

				// Add top and bottom for accept/decline
				if (type !== 'comment') {
					text = text.replace(/(==.*==)\n*/, '$1\n{{su' + 'bst:ffu ' + type[0] + '}}\n');
					text = text.replace(/(<!-- \[\[User:DoNotArchiveUntil\]\].*[\n\r]*)/, '');
					text += '\n{{su' + 'bst:ffu b}}';
				}

				var requestsDone = 0,
					totalRequests = 1;

				// Reload the page if all request are done
				function maybeUpdatePage() {
					requestsDone++;

					if (requestsDone === totalRequests) {
						mw.notify('Reloading page...');

						$.get(mw.config.get('wgScriptPath') + '/api.php', {
							action: 'parse',
							page: mw.config.get('wgPageName'),
							prop: 'text|categorieshtml',
							format: 'json'
						}).done(function(res) {
							var contentText = $('#mw-content-text'),
								catLinks = $('#catlinks');

							contentText.find('.mw-parser-output').replaceWith(res.parse.text['*']);
							mw.hook('wikipage.content').fire(contentText);

							catLinks.replaceWith(res.parse.categorieshtml['*']);
							mw.hook('wikipage.categories').fire(catLinks);

							mw.notify('Page reloaded.');
						});
					}
				}

				mw.notify('Editing FFU request...');

				var editSummary = {
					'accept': 'Accepted',
					'decline': 'Declined',
					'comment': 'Commented on'
				}[type] + ' request using [[en:w:User:BrandonXLF/FFUHelper|FFU Helper]]';

				$.post(mw.config.get('wgScriptPath') + '/api.php', {
					action: 'edit',
					section: section,
					text: text,
					title: mw.config.get('wgPageName'),
					token: mw.user.tokens.get('csrfToken'),
					summary: editSummary
				}).done(function() {
					mw.notify('Finished editing FFU request.');
					maybeUpdatePage();
				});

				if (shouldNotifyUser) {
					totalRequests++;

					mw.notify('Posting on user talk page...');

					$.post(mw.config.get('wgScriptPath') + '/api.php', {
						action: 'edit',
						appendtext: '\n\n{{su' + 'bst:ffu talk|' + data[2] + '|section=' + sectionName + '}} ~~' + '~~',
						title: 'User talk:' + userInput.val(),
						token: mw.user.tokens.get('csrfToken'),
						summary: 'Notifying about [[WP:FFU|FFU]] request using [[en:w:User:BrandonXLF/FFUHelper|FFU Helper]]'
					}).done(function() {
						mw.notify('Finished positing on user talk page.');
						maybeUpdatePage();
					});
				}
			});
		}

		if (currentInterface)
			currentInterface.remove();

		currentInterface = $('<p>')
			.css({
				border: '1px solid ' + {
					comment: 'grey',
					decline: 'red',
					accept: 'green'
				}[type],
				borderRadius: '4px',
				padding: '4px 0.5em'
			})
			.append($('<span>')
				.css({
					fontStyle: '125%',
					fontWeight: 'bold',
					marginBottom: '1em'
				})
				.text('FFU Helper - ' + type.charAt(0).toUpperCase() + type.slice(1))
			)
			.append($('<div>')
				.css('margin-left', '5px')
				.append(options)
			)
			.append($('<div>')
				.css({
					margin: '0.5em 0',
					borderBottom: '1px solid #555'
				})
			)
			.append(type !== 'comment' ? '' : $('<div>')
				.css('margin-left', '5px')
				.append($('<label>')
					.append(addHoldInput
						.css({
							verticalAlign: 'middle',
							marginRight: '4px'
						})
						.attr('type', 'checkbox')
						.prop('checked', true)
					)
					.append($('<span>')
						.css('vertical-align', 'middle')
						.text('Add 7 day hold notice')
					)
				)
			)
			.append($('<div>')
				.css('margin-left', '5px')
				.append($('<label>')
					.append(notifyUserInput
						.css({
							verticalAlign: 'middle',
							marginRight: '4px'
						})
						.attr('type', 'checkbox')
						.prop('checked', true)
					)
					.append($('<span>')
						.css('vertical-align', 'middle')
						.text('Notify user:')
					)
				)
				.append(userInput
					.css({
						border: 'none',
						borderBottom: '1px solid #555',
						padding: '2px'
					})
					.attr('placeholder', 'User')
					.val(user)
				)
			)
			.append($('<div>')
				.css('margin', '4px 0 0 -4px')
				.append($('<button>')
					.css('margin', '4px')
					.text('Save')
					.click(onSave)
				)
				.append($('<button>')
					.css('margin', '4px')
					.text('Cancel')
					.click(function() {
						currentInterface.remove();
					})
				)
			)
			.append(
				'<div style="margin-top:4px;">[' +
				'<a href="https://en.wikipedia.org/wiki/Wikipedia:Files_for_upload/Reviewer_instructions">Reviewer instructions</a>' +
				' &bull; <a href="https://commons.wikimedia.org/wiki/Special:UploadWizard">Commons</a>' +
				' (<a href="https://commons.wikimedia.org/wiki/Special:Upload">plain</a>)' +
				' &bull; <a href="' + mw.config.get('wgScript') + '?title=Wikipedia:File_Upload_Wizard&withJS=MediaWiki:FileUploadWizard.js">Local</a>' +
				' (<a href="' + mw.config.get('wgScript') + '?title=Special:Upload">plain</a>)' +
				' &bull; <a href="https://en.wikipedia.org/wiki/User:BrandonXLF/FFUHelper">FFU Helper</a>' +
				']</span>'
			);

		sectionElement.after(currentInterface);
	}

	// Add links to sections
	content.find('.mw-parser-output h2').each(function() {
		var heading = $(this);

		if (heading.closest('.mw-heading').length)
			heading = heading.closest('.mw-heading');

		var editLink = heading.find('.mw-editsection a[href*="title="][href*="section="]').first();

		if (!editLink.length) return;

		var section = /[?&]v?e?section=(T?-?\d*)/.exec(editLink.attr('href'))[1];

		if (heading.next().hasClass('mw-collapsible')) {
			editLink.siblings().last().after('<span class="mw-editsection" style="background:#dfdfdf;">[closed]</span>');
			return;
		}

		$.each({
			accept: '#a0ffa0',
			decline: '#ffcece',
			comment: '#ededed'
		}, function(type, color) {
			editLink.siblings().last().after($('<span>')
				.css('background', color)
				.addClass('mw-editsection')
				.append('[')
				.append($('<a>')
					.text(type)
					.attr('href', '#')
					.click(function(e) {
						e.preventDefault();
						openInterface(type, section, heading);
					})
				)
				.append(']')
			);
		});
	});
});

// </syntaxhighlight>