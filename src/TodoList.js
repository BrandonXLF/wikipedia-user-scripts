/*** Todo List ***/

// Adds a todo list that also has a convient popup
// Documentation at [[en:w:User:BrandonXLF/TodoList]]
// By [[en:w:User:BrandonXLF]]

$.when(mw.loader.using([
	'mediawiki.user',
	'oojs-ui-core',
	'oojs-ui-windows',
	'oojs-ui.styles.icons-movement',
	'oojs-ui.styles.icons-editing-core',
	'oojs-ui.styles.icons-interactions',
	'oojs-ui.styles.icons-moderation',
	'oojs-ui.styles.icons-content'
]), $.ready).then(function() {
	var messages = function() {
		var translations = {
				en: {
					todoPortlet: 'Todo',
					todoHover: 'Click to see your todo list',
					saving: 'Saving changes...',
					drag: 'Drag',
					delete: 'Delete',
					edit: 'Edit',
					pageNameUrl: 'Page name or URL',
					comment: 'Comment',
					save: 'Save',
					cancel: 'Cancel',
					moreinfo: 'More information',
					undo: 'Undo',
					redo: 'Redo',
					clear: 'Clear',
					clearConfirm: 'Are you sure you want to clear your todo list?',
					download: 'Download',
					upload: 'Upload',
					help: 'Help',
					add: 'Add',
					close: 'Close',
					yourList: 'Your todo list',
					noPopup: 'Unable to open todo list popup while on the todo list page.',
					addedTime: 'Added: $dateDate $dateMonth, $dateYear at $dateHours:$dateMinutes'
				},
				nb: {
					todoPortlet: 'Huskeliste',
					todoHover: 'Klikk for å se huskelista di',
					saving: 'Lagrer endringer …',
					drag: 'Dra',
					delete: 'Slett',
					edit: 'Rediger',
					pageNameUrl: 'Sidenavn eller URL',
					comment: 'Merknad',
					save: 'Lagre',
					cancel: 'Avbryt',
					moreinfo: 'Mer informasjon',
					undo: 'Angre',
					redo: 'Angre angring',
					clear: 'Tøm',
					clearConfirm: 'Er du sikker på at du vil tømme huskelista di?',
					download: 'Last ned',
					upload: 'Last opp',
					help: 'Hjelp',
					add: 'Legg til',
					close: 'Lukk',
					yourList: 'Huskelista di',
					noPopup: 'Kan ikke åpne oppsprettsboksen med huskelista mens du er på huskelistesiden.',
					addedTime: 'Lagt til: $dateDate. $dateMonth $dateYear kl. $dateHours.$dateMinutes'
				},
				nn: {
					todoPortlet: 'Hugseliste',
					todoHover: 'Klikk for å sjå hugselista di',
					saving: 'Lagrar endringar …',
					drag: 'Dra',
					delete: 'Slett',
					edit: 'Endre',
					pageNameUrl: 'Sidenamn eller URL',
					comment: 'Merknad',
					save: 'Lagre',
					cancel: 'Avbryt',
					moreinfo: 'Meir informasjon',
					undo: 'Angre',
					redo: 'Angre angring',
					clear: 'Tøm',
					clearConfirm: 'Er du sikker på at du vil tømme hugselista di?',
					download: 'Last ned',
					upload: 'Last opp',
					help: 'Hjelp',
					add: 'Legg til',
					close: 'Lukk',
					yourList: 'Hugselista di',
					noPopup: 'Kan ikkje opna oppsprettsboksen med hugselista mens du er på hugselistesida.',
					addedTime: 'Lagt til: $dateDate. $dateMonth $dateYear kl. $dateHours.$dateMinutes'
				},
				ka: {
					todoPortlet: 'გასაკეთებელი',
					todoHover: 'დააწკაპეთ თქვენი გასაკეთებლების სიის სანახავად',
					saving: 'ინახება…',
					drag: 'გადაადგილება',
					delete: 'წაშლა',
					edit: 'რედაქტირება',
					pageNameUrl: 'გვერდის სახელი ან ბმული',
					comment: 'კომენტარი',
					save: 'შენახვა',
					cancel: 'გაუქმება',
					moreinfo: 'მეტი ინფორმაცია',
					undo: 'უკან დაბრუნება',
					redo: 'წინ დაბრუნება',
					clear: 'გასუფთავება',
					clearConfirm: 'დარწმუნებული ხართ, რომ თქვენი სიის გასუფთავება გსურთ?',
					download: 'ჩამოტვირთვა',
					upload: 'ატვირთვა',
					help: 'დახმარება',
					add: 'დამატება',
					close: 'დახურვა',
					yourList: 'თქვენი გასაკეთებლების სია',
					noPopup: 'გასაკეთებლების სიის გვერდზე ყოფნის დროს შეუძლებელია სიის ფანჯრის გახსნა.',
					addedTime: 'დამატების თარიღი: $dateDate $dateMonth, $dateYear; $dateHours:$dateMinutes'
				}
			},
			chain = mw.language.getFallbackLanguageChain(),
			len = chain.length,
			ret = {},
			i = len - 1;
		while (i >= 0) {
			if (translations.hasOwnProperty(chain[ i ])) {
				$.extend(ret, translations[ chain[ i ] ]);
			}

			i = i - 1;
		}
		return ret;
	}();

	mw.util.addCSS(
		'.userjs-todo-list .item:hover .act { visibility: visible !important; }' +
		'[data-drop="above"]::before { display: block; border-top: 2px solid #066; margin-top: -2px; content: ""; }' +
		'[data-drop="below"]::after { display: block; border-top: 2px solid #066; margin-top: -2px; content: ""; }' +
		'.userjs-todo-list .items:empty { border: none !important; margin: 0 !important; padding: 0 !important;}' +
		'.userjs-todo-moreinfo > a { min-width: unset !important; min-height: unset !important; padding: 0.65em !important; }' +
		'.userjs-todo-moreinfo > a > span { min-width: unset !important; min-height: unset !important; width: 1.3em !important; left: 0 !important; }'
	);

	if (mw.config.get('skin') === 'minerva') {
		mw.util.addCSS(
			'.userjs-todo-list .item .act { visibility: visible !important; }' +
			'#userjs-todo-popup { top: 0 !important; bottom: 0 !important; left: 0 !important; right: 0 !important; width: 100%; height: 100%; }' +
			'#userjs-todo-popup .userjs-todo-list { width: 100%; height: 100%; } '
		);
	}

	var api = new mw.Api(),
		link = $(mw.util.addPortletLink(
			'p-personal',
			mw.util.getUrl('Special:BlankPage/todo'),
			messages.todoPortlet,
			'userjs-todo',
			messages.todoHover,
			'd',
			'#pt-preferences')
		),
		changes = [mw.user.options.get('userjs-todo-script')],
		undo = 0,
		req = 0,
		parent,
		ispopup = false,
		loader = $('<input type="file" accept=".json" style="display:none;">').on('change', function() {
			if (!this.files || !this.files[0]) return;
			var file = this.files[0],
				reader = new FileReader();
			reader.onload = function() {
				save(reader.result, true, true);
			};
			reader.readAsText(file);
		}).appendTo(document.body);

	$(window).on('beforeunload', function() {
		if (req > 0) return true;
	});

	function save(what, record, relist) {
		if (typeof what != 'string') {
			what = JSON.stringify(what);
		}

		mw.user.options.set('userjs-todo-script', what);
		req++;
		parent.find('.status').text(messages.saving);

		api.saveOption('userjs-todo-script', what).done(function() {
			req--;
			if (req === 0) {
				parent.find('.status').text('');
			}
		});

		if (record !== false) {
			while (undo > 0) {
				changes.pop();
				undo--;
			}

			changes.push(mw.user.options.get('userjs-todo-script'));

			if (changes.length > 50) changes.shift();
		}

		if (relist) {
			list();

			if (req > 0) {
				parent.find('.status').text(messages.saving);
			}
		}
	}

	Math.clamp = function(max, x, min) {
		return Math.min(max, Math.max(min, x));
	};

	function item(parent, array) {
		var date = new Date(+array[2]),
			url = array[0] || '',
			txt = array[0] || '';

		if (url.match(/^(https:|http:|:)\/\//) && url.match(/ /)) {
			var reg = /(.*?) (.*)/.exec(url);
			url = reg[1];
			txt = reg[2];
		} else if (!url.match(/^(https:|http:|:)\/\//)) {
			url = mw.util.getUrl(url);
		}

		parent.append($('<div class="item" style="margin:5px 0;white-space:nowrap;"></div>')
			.attr('data-page', array[0] || '')
			.attr('data-info', array[1] || '')
			.attr('data-date', array[2] || '')
			.append((new OO.ui.IconWidget({icon: 'draggable', title: messages.drag})).$element
				.css({cursor: 'move', height: '1.2em', width: '1.2em', minWidth: 'unset', minHeight: 'unset', marginRight: '0.5em'})
				.on('mousedown', function() {
					$(this).parent().attr('draggable', 'true');
				})
				.on('mouseup', function() {
					$(this).parent().attr('draggable', 'false');
				})
			)
			.append($('<a>').addClass('page').attr('href', url).text(txt))
			.append(array[0] && array[1] ? ' . . ' : '')
			.append($('<span>').addClass('info').text(array[1] || ''))
			.append(array[0] || array[1] ? '<span class="act" style="visibility:hidden;"> . . </span>' : '')
			.append((new OO.ui.IconWidget({icon: 'trash', title: messages.delete, flags: ['destructive']})).$element
				.css({cursor: 'pointer', visibility: 'hidden', height: '1.1em', width: '1.1em', minWidth: 'unset', minHeight: 'unset', marginRight: '0.5em'})
				.addClass('act')
				.click(function() {
					var arr = [];
					$(this).parent().siblings().each(function() {
						arr.push([$(this).attr('data-page'), $(this).attr('data-info'), $(this).attr('data-date')]);
					});
					$(this).parent().remove();
					save(arr);
				})
			)
			.append((new OO.ui.IconWidget({icon: 'edit', title: messages.edit, flags: ['progressive']})).$element
				.css({cursor: 'pointer', visibility: 'hidden', height: '1em', width: '1em', minWidth: 'unset', minHeight: 'unset', marginRight: '0.5em'})
				.addClass('act edit')
				.click(function() {
					$(this).css('display', 'none');
					$('<div style="border:1px solid #a2a9b1;padding:0 4px;margin:0.5em 0;border-radius:4px;"></div>')
						.append((new OO.ui.TextInputWidget({
							placeholder: messages.pageNameUrl,
							classes: ['todo-pageNameUrl'],
							value: $(this).parent().attr('data-page')
						})).$element.css({maxWidth: 'unset', margin: '4px 0'}))
						.append((new OO.ui.TextInputWidget({
							placeholder: messages.comment,
							classes: ['todo-comment'],
							value: $(this).parent().attr('data-info')
						})).$element.css({maxWidth: 'unset', margin: '4px 0'}))
						.append($('<table style="width:100%;border-spacing:0;margin-bottom:0.5em;"></table>').append($('<tr></tr>')
							.append($('<td style="width:50%;padding-right:4px;"></td>').append((new OO.ui.ButtonWidget({
								label: messages.save,
								flags: ['progressive']
							}).$element.css('width', '100%').children().css('width', '100%').parent()).click(function() {
								var editbox = $(this).parent().parent().parent().parent(),
									listitem = editbox.parent();
								listitem.find('.page').text(editbox.find('.todo-pageNameUrl input').val());
								listitem.attr('data-page', editbox.find('.todo-pageNameUrl input').val());
								listitem.find('.info').text(editbox.find('.todo-comment input').val());
								if (listitem.find('.info')[0].previousSibling.nodeType != 3 && editbox.find('.todo-comment input').val() !== '') {
									listitem.find('.info').before(' . . ');
								} else if (
									listitem.find('.info')[0].previousSibling.nodeType == 3 &&
									editbox.find('.todo-comment input').val() === ''
								) {
									$(listitem.find('.info')[0].previousSibling).remove();
								}
								listitem.attr('data-info', editbox.find('.todo-comment input').val());
								var arr = [];
								listitem.parent().children().each(function() {
									arr.push([$(this).attr('data-page'), $(this).attr('data-info'), $(this).attr('data-date')]);
								});
								save(arr);
								link.find('.redo').remove();
								listitem.find('.edit').css('display', 'inline-block');
								editbox.remove();
							})
							))
							.append($('<td style="width:50%;padding-left:4px;"></td>').append((new OO.ui.ButtonWidget({
								label: messages.cancel,
								flags: ['destructive']
							}).$element.css('width', '100%').children().css('width', '100%').parent()).click(function() {
								var editbox = $(this).parent().parent().parent().parent(),
									listitem = editbox.parent();
								listitem.find('.edit').css('display', 'inline-block');
								editbox.remove();
							})
							))
						)).appendTo(this.parentNode);
				})
			)
			.append(array[2] ? (new OO.ui.PopupButtonWidget({
				icon: 'info',
				framed: false,
				label: messages.moreinfo,
				invisibleLabel: true,
				title: messages.moreinfo,
				popup: {
					$content: $('<p></p>').text(messages.addedTime
						.replace('$dateDate', date.getDate())
						.replace('$dateMonth', mw.config.get('wgMonthNames')[date.getMonth() + 1])
						.replace('$dateYear', date.getFullYear())
						.replace('$dateHours', date.getHours())
						.replace('$dateMinutes', ('' + date.getMinutes()).padStart(2, '0'))
					),
					padded: true,
					align: 'forwards'
				}
			})).$element
				.addClass('userjs-todo-moreinfo')
				.css({cursor: 'pointer', visibility: 'hidden', height: '1.3em', width: '1.3em', minWidth: 'unset', minHeight: 'unset', marginRight: '0.5em'})
				.addClass('act') : ''
			)
			.on('dragover', function(e) {
				e.preventDefault();
				e.dataTransfer = e.originalEvent.dataTransfer;
				if (e.offsetY < ($(this).height()/2)) {
					this.setAttribute('data-drop', 'above');
				} else {
					this.setAttribute('data-drop', 'below');
				}
			})
			.on('dragleave', function() {
				this.setAttribute('data-drop', '');
			})
			.on('drop', function(e) {
				e.dataTransfer = e.originalEvent.dataTransfer;
				this.setAttribute('data-drop', '');
				var ele = $('[data-dragid="' + e.dataTransfer.getData('text/plain') + '"]')[0];
				if (e.offsetY < ($(this).height()/2)) {
					this.insertAdjacentElement('beforebegin', ele);
				} else {
					this.insertAdjacentElement('afterend', ele);
				}
				var arr = [];
				$(this).parent().children().each(function() {
					arr.push([$(this).attr('data-page'), $(this).attr('data-info'), $(this).attr('data-date') || '']);
				});
				save(arr);
			})
			.on('dragstart', function(e) {
				e.dataTransfer = e.originalEvent.dataTransfer;
				var uid = ('' + Math.random()).replace('.', '');
				$(this).attr('data-dragid', uid);
				e.dataTransfer.setData('text/plain', uid);
			})
		);
	}

	function list() {
		$('.userjs-todo-list').remove();
		var todo = parent.append($('<div class="userjs-todo-list" style="overflow:auto;"></div>')
			.append($('<div style="padding:0.5em;" class="todo-menu"></div>')
				.append(new OO.ui.ButtonWidget({
					framed: false,
					icon: 'undo',
					invisibleLabel: true,
					title: messages.undo
				}).$element.click(function() {
					if (changes[changes.length-undo-2] !== undefined) {
						save(changes[changes.length-undo-2], false, true);
						undo++;
					}
				}))
				.append(new OO.ui.ButtonWidget({
					framed: false,
					icon: 'redo',
					invisibleLabel: true,
					title: messages.redo
				}).$element.click(function() {
					if (changes[changes.length-undo] !== undefined) {
						save(changes[changes.length-undo], false, true);
						undo--;
					}
				}))
				.append(new OO.ui.ButtonWidget({
					framed: false,
					icon: 'trash',
					invisibleLabel: true,
					title: messages.clear
				}).$element.click(function() {
					OO.ui.confirm(messages.clearConfirm).done(function(confirmed) {
						if (confirmed) {
							parent.find('.items').empty();
							save('', true, true);
						}
					});
				}))
				.append(new OO.ui.ButtonWidget({
					framed: false,
					icon: 'download',
					invisibleLabel: true,
					title: messages.download
				}).$element.click(function() {
					$($('<a download="todo.json" style="display:none;"></a>')
						.attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(mw.user.options.get('userjs-todo-script')))
						.appendTo(document.body)[0].click()
					).remove();
				}))
				.append(new OO.ui.ButtonWidget({
					framed: false,
					icon: 'upload',
					invisibleLabel: true,
					title: messages.upload
				}).$element.click(function() {
					loader.click();
				}))
				.append(new OO.ui.ButtonWidget({
					framed: false,
					icon: 'info',
					invisibleLabel: true,
					title: messages.help
				}).$element.click(function() {
					window.open('https://en.wikipedia.org/wiki/User:BrandonXLF/TodoList/Help');
				}))
			)
			.append($('<div style="padding:0 0.5em 0.5em;"></div>')
				.append((new OO.ui.TextInputWidget({
					placeholder: messages.pageNameUrl,
					classes: ['todo-pageNameUrl'],
					value: mw.config.get('wgPageName').replace(/_/g, ' ') != 'Special:BlankPage/todo' ? mw.config.get('wgPageName').replace(/_/g, ' ') : ''
				})).$element.css({maxWidth: 'unset', margin: '4px 0'}))
				.append((new OO.ui.TextInputWidget({
					placeholder: messages.comment,
					classes: ['todo-comment']
				})).$element.css({maxWidth: 'unset', margin: '4px 0'}))
				.append((new OO.ui.ButtonWidget({
					label: messages.add
				}).$element.css('width', '100%').children().css('width', '100%').parent()).click(function() {
					var opts = JSON.parse(mw.user.options.get('userjs-todo-script') || '[]'),
						arr = [];

					arr.push($(this).parent().parent().find('.todo-pageNameUrl input').val());
					arr.push($(this).parent().parent().find('.todo-comment input').val());

					if (!arr.join('')) return;

					arr.push((new Date()).getTime());
					item($('.userjs-todo-list .items'), arr);
					opts.push(arr);
					save(opts);

					$('#userjs-todo-popup').css({top: Math.max(parseInt($('#userjs-todo-popup').css('top')), 0)});
				}))
			)
			.append($('<div class="items" style="margin:0.5em;padding-top:0.5em;border-top:1px solid #a2a9b1;"></div>'))
			.append('<div class="status" style="padding:0 0.5em 0.5em;"></div>')
		);
		if (ispopup) {
			todo.find('.todo-menu')
				.css('cursor', 'grab')
				.append((new OO.ui.ButtonWidget({
					framed: false,
					icon: 'close',
					invisibleLabel: true,
					title: messages.close
				}).$element.css({float: 'right', marginRight: '0'}).click(function() {
					parent.remove();
				})))
				.append(($('<a></a>').attr('href', mw.util.getUrl('Special:BlankPage/todo')).append((new OO.ui.ButtonWidget({
					framed: false,
					icon: 'newWindow',
					invisibleLabel: true,
					title: messages.yourList
				}).$element.css('float', 'right').click(function() {
					location.url = mw.util.getUrl('Special:BlankPage/todo');
				})))))
				.on('mousedown', function(e) {
					if (e.target !== this) return;
					this.style.cursor = 'grabbing';
					var x = parent.position().left - e.pageX,
						y = parent.position().top - e.pageY,
						b = $(document.body);
					function move(e) {
						parent.css({
							left: Math.clamp($(window).width() - parent.width(), e.pageX + x, 0) + 'px',
							top: Math.clamp($(window).height() - parent.height(), e.pageY +	y, 0) + 'px',
							right: '',
							bottom: ''
						});
					}
					function up() {
						e.target.style.cursor = 'grab';
						b.off('mousemove', move);
						b.off('mouseup', up);
					}
					b.on('mousemove', move);
					b.on('mouseup', up);
				});
		}

		$.each(JSON.parse(mw.user.options.get('userjs-todo-script') || '[]'), function(a, b) {
			item(todo.find('.items'), b);
		});

		return todo;
	}

	function repos(pos, css, pvar, cond, pcss, ccss) {
		return $('<div style="pointer-events:all;position:absolute;"></div>')
			.attr('id', pos + 'gfdgfdgfd')
			.css('cursor', pos + '-resize')
			.css(css).on('mousedown', function(e) {
				if (e.target !== this) return;

				var p = parent,
					c = p.find('.userjs-todo-list'),
					q = eval(pvar),
					b = $(document.body);

				b.css('user-select', 'none');

				function move(e) {
					if (eval(cond)) return;
					(new Function('e', 'p', 'q', 'p.css(' + pcss + ')'))(e, p, q);
					(new Function('e', 'c', 'q', 'c.css(' + ccss + ')'))(e, c, q);
				}

				function up() {
					b.css('user-select', '');
					b.off('mousemove', move);
					b.off('mouseup', up);
				}

				b.on('mousemove', move);
				b.on('mouseup', up);
			});
	}

	if ((mw.config.get('wgCanonicalSpecialPageName') === 'Blankpage') && (mw.config.get('wgPageName').split('/').pop() === 'todo')) {
		document.title = messages.yourList + ' – ' + mw.config.get('wgSiteName');
		$('#firstHeading').text(messages.yourList);
		parent = mw.util.$content.empty();
		list();

		link.children().first().click(function(e) {
			e.preventDefault();
			mw.notify(messages.noPopup, {tag: 'rtbyilounmt7udfnod'});
		});
	} else {
		link.children().first().click(function(e) {
			e.preventDefault();
			if ($('#userjs-todo-popup')[0]) {
				$('#userjs-todo-popup').remove();
				return;
			}
			ispopup = true;
			parent = $('<div style="overflow:auto;min-height:3em;z-index:' + (mw.config.get('skin') === 'minerva' ? '3' : '4') + ';box-shadow:0 2px 2px 0 rgba(0,0,0,0.25);color:#222;min-width:20em;position:fixed;right:1em;background-color:white;border-radius:4px;border: 1px solid #a2a9b1;font-size:0.75rem;max-width:100vw;max-height:100vh;" id="userjs-todo-popup"></div>')
				.appendTo(document.body)
				.css('top', link.position().top + link.height() + 8 + 'px')
				.append($('<div style="pointer-events:none;position:absolute;top:0;left:0;bottom:0;right:0;"></div>')
					.append(repos('e', {top: 0, right: 0, width: '7px', height: '100%'}, 'p.position().left', 'e.clientX - q < 40', '{right:"",minWidth:"",left:q	+ "px"}', '{width:e.clientX - q + "px"}'))
					.append(repos('n', {top: 0, height: '7px', width: '100%'}, 'p.position().top + p.height()', 'q <= e.clientY + 40', '{top:Math.max(e.clientY, 0) + "px"}', '{height:q - e.clientY + "px"}'))
					.append(repos('s', {bottom: 0, height: '7px', width: '100%'}, 'p.position().top', 'e.clientY - q < 40', '{top:Math.max(q,0) + "px"}', '{height:e.clientY - q + "px"}'))
					.append(repos('w', {left: 0, width: '7px', height: '100%'}, 'p.position().left + parent.width()', 'q <= e.clientX + 40', '{right:"",minWidth:"",left:e.clientX + "px"}', '{width:q - e.clientX + "px"}'))
					.append($('<div style="pointer-events:all;position:absolute;height:100%;top:0;right:0;width:7px;height:7px;cursor:ne-resize;"></div>').on('mousedown', function(e) {
						e.originalEvent.stopImmediatePropagation();
						$('#egfdgfdgfd').trigger('mousedown');
						$('#ngfdgfdgfd').trigger('mousedown');
					}))
					.append($('<div style="pointer-events:all;position:absolute;height:100%;top:0;left:0;width:7px;height:7px;cursor:nw-resize;"></div>').on('mousedown', function(e) {
						e.originalEvent.stopImmediatePropagation();
						$('#wgfdgfdgfd').trigger('mousedown');
						$('#ngfdgfdgfd').trigger('mousedown');
					}))
					.append($('<div style="pointer-events:all;position:absolute;height:100%;bottom:0;right:0;width:7px;height:7px;cursor:se-resize;"></div>').on('mousedown', function(e) {
						e.originalEvent.stopImmediatePropagation();
						$('#egfdgfdgfd').trigger('mousedown');
						$('#sgfdgfdgfd').trigger('mousedown');
					}))
					.append($('<div style="pointer-events:all;position:absolute;height:100%;bottom:0;left:0;width:7px;height:7px;cursor:sw-resize;"></div>').on('mousedown', function(e) {
						e.originalEvent.stopImmediatePropagation();
						$('#wgfdgfdgfd').trigger('mousedown');
						$('#sgfdgfdgfd').trigger('mousedown');
					}))
				);

			parent.css('top', Math.max(parseInt(parent.css('top')), 0));
			list();
		});
	}
});