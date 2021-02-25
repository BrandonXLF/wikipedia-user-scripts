/*** Todo List ***/

// Adds a todo list that also has a convient popup
// Documentation at [[User:BrandonXLF/TodoList]]
// By [[User:BrandonXLF]]

$.when(mw.loader.using([
	'mediawiki.user',
	'oojs-ui-core',
	'oojs-ui-windows',
	'oojs-ui.styles.icons-movement',
	'oojs-ui.styles.icons-editing-core',
	'oojs-ui.styles.icons-interactions',
	'oojs-ui.styles.icons-moderation',
	'oojs-ui.styles.icons-content'
]),$.ready).then(function(){
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
	var api = new mw.Api();
	var link = $(mw.util.addPortletLink('p-personal', mw.util.getUrl('Special:BlankPage/todo'), 'Todo', 'userjs-todo', 'Click to see your todo list', 'd', '#pt-preferences'));
	var changes = [mw.user.options.get('userjs-todo-script')];
	var undo = 0;
	var req = 0;
	var parent;
	var ispopup = false;
	var loader = $('<input type="file" accept=".json" style="display:none;">').on('change',function(e){
		if (!this.files || !this.files[0]) return;
		var file = this.files[0];
		var reader = new FileReader();
		reader.onload = function (e) {
			save(reader.result, true, true);
		};
		reader.readAsText(file);
	}).appendTo(document.body);
	
	$(window).on('beforeunload',function () { if (req > 0) return true; });
	
	function save (what, record, relist) {
		if (typeof what != 'string') { what = JSON.stringify(what); }
		mw.user.options.set('userjs-todo-script', what);
		req++;
		parent.find('.status').text('Saving changes...');
		api.saveOption('userjs-todo-script', what).done(function(){
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
				parent.find('.status').text('Saving changes...');
			}
		}
	}
	
	Math.clamp = function (max, x, min) {
		return Math.min(max, Math.max(min, x));
	};
	
	function item (parent, array) {
		var date = new Date(+array[2]);
		var url = array[0] || '';
		var txt = array[0] || '';
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
			.append((new OO.ui.IconWidget({icon:'draggable',title:'Drag'})).$element
				.css({cursor:'move',height:'1.2em',width:'1.2em',minWidth:'unset',minHeight:'unset',marginRight:'0.5em'})
				.on('mousedown',function(){
					$(this).parent().attr('draggable','true');
				})
				.on('mouseup',function(){
					$(this).parent().attr('draggable','false');
				})
			)
			.append('<span><a class="page" href="' + url + '">' + txt + '</a></span>')
			.append(array[0] && array[1] ? ' . . ' : '')
			.append('<span class="info">' + (array[1] || '') + '</span>')
			.append(array[0] || array[1] ? '<span class="act" style="visibility:hidden;"> . . </span>' : '')
			.append((new OO.ui.IconWidget({icon:'trash',title:'Delete',flags:['destructive']})).$element
				.css({cursor:'pointer',visibility:'hidden',height:'1.1em',width:'1.1em',minWidth:'unset',minHeight:'unset',marginRight:'0.5em'})
				.addClass('act')
				.click(function(){
					var arr = [];
					$(this).parent().siblings().each(function(i){
						arr.push([$(this).attr('data-page'),$(this).attr('data-info'),$(this).attr('data-date')]);
					});
					$(this).parent().remove();
					save(arr);
				})
			)
			.append((new OO.ui.IconWidget({icon:'edit',title:'Edit',flags:['progressive']})).$element
				.css({cursor:'pointer',visibility:'hidden',height:'1em',width:'1em',minWidth:'unset',minHeight:'unset',marginRight:'0.5em'})
				.addClass('act edit')
				.click(function(){
					$(this).css('display','none');
					$('<div style="border:1px solid #a2a9b1;padding:0 4px;margin:0.5em 0;border-radius:4px;"></div>')
						.append((new OO.ui.TextInputWidget({ 
							placeholder: 'Page name or URL',
							value: $(this).parent().attr('data-page')
						})).$element.css({maxWidth:'unset',margin:'4px 0'}))
						.append((new OO.ui.TextInputWidget({ 
							placeholder: 'Comment',
							value: $(this).parent().attr('data-info')
						})).$element.css({maxWidth:'unset',margin:'4px 0'}))
						.append($('<table style="width:100%;border-spacing:0;margin-bottom:0.5em;"></table>').append($('<tr></tr>')
							.append($('<td style="width:50%;padding-right:4px;"></td>').append((new OO.ui.ButtonWidget({ 
									label: 'Save',
									flags: ['progressive']
								}).$element.css('width','100%').children().css('width','100%').parent()).click(function(){
									var editbox = $(this).parent().parent().parent().parent();
									var listitem = editbox.parent();
									listitem.find('.page').text(editbox.find('input[placeholder="Page name or URL"]').val());
									listitem.attr('data-page',editbox.find('input[placeholder="Page name or URL"]').val());
									listitem.find('.info').text(editbox.find('input[placeholder="Comment"]').val());
									if (listitem.find('.info')[0].previousSibling.nodeType != 3 && editbox.find('input[placeholder="Comment"]').val() !== '') {
										listitem.find('.info').before(' . . ');
									} else if (listitem.find('.info')[0].previousSibling.nodeType == 3 && editbox.find('input[placeholder="Comment"]').val() === '') {
										$(listitem.find('.info')[0].previousSibling).remove();
									}
									listitem.attr('data-info',editbox.find('input[placeholder="Comment"]').val());
									var arr = [];
									listitem.parent().children().each(function(i){
										arr.push([$(this).attr('data-page'),$(this).attr('data-info'),$(this).attr('data-date')]);
									});
									save(arr);
									link.find('.redo').remove();
									listitem.find('.edit').css('display','inline-block');
									editbox.remove();
								})
							))
							.append($('<td style="width:50%;padding-left:4px;"></td>').append((new OO.ui.ButtonWidget({ 
									label: 'Cancel',
									flags: ['destructive']
								}).$element.css('width','100%').children().css('width','100%').parent()).click(function(){
									var editbox = $(this).parent().parent().parent().parent();
									var listitem = editbox.parent();
									listitem.find('.edit').css('display','inline-block');
									editbox.remove();
								})
							))
						)).appendTo(this.parentNode);
				})
			)
			.append(array[2] ? (new OO.ui.PopupButtonWidget( {
				icon: 'info',
				framed: false,
				label: 'More information',
				invisibleLabel: true,
				title: 'More information',
				popup: {
					$content: $('<p></p>').text('Added: ' + date.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][date.getMonth()] + ', ' + date.getFullYear() + ' at ' + date.getHours() + ':' + ('' + date.getMinutes()).padStart(2,'0')),
					padded: true,
					align: 'forwards'
				}
			})).$element
				.addClass('userjs-todo-moreinfo')
				.css({cursor:'pointer',visibility:'hidden',height:'1.3em',width:'1.3em',minWidth:'unset',minHeight:'unset',marginRight:'0.5em'})
				.addClass('act') : ''
			)
			.on('dragover',function(e){
				e.preventDefault();
				e.dataTransfer = e.originalEvent.dataTransfer;
				if (e.offsetY < ($(this).height()/2)) {
					this.setAttribute('data-drop','above');
				} else {
					this.setAttribute('data-drop','below');
				}
			})
			.on('dragleave',function(){
				this.setAttribute('data-drop','');
			})
			.on('drop',function(e){
				e.dataTransfer = e.originalEvent.dataTransfer;
				this.setAttribute('data-drop','');
				var ele = $('[data-dragid="' + e.dataTransfer.getData('text/plain') + '"]')[0];
				if (e.offsetY < ($(this).height()/2)) {
					this.insertAdjacentElement('beforebegin', ele);
				} else {
					this.insertAdjacentElement('afterend', ele);
				}
				var arr = [];
				$(this).parent().children().each(function(i){
					arr.push([$(this).attr('data-page'),$(this).attr('data-info'),$(this).attr('data-date') || '']);
				});
				save(arr);
			})
			.on('dragstart',function(e){
				e.dataTransfer = e.originalEvent.dataTransfer;
				var uid = ('' + Math.random()).replace('.','');
				$(this).attr('data-dragid',uid);
				e.dataTransfer.setData('text/plain',uid);
			})
		);
	}
	function list () {
		$('.userjs-todo-list').remove();
		var todo = parent.append($('<div class="userjs-todo-list" style="overflow:auto;"></div>')
			.append($('<div style="padding:0.5em;" class="todo-menu"></div>')
				.append(new OO.ui.ButtonWidget({
					framed: false,
					icon: 'undo',
					invisibleLabel: true,
					title: 'Undo'
				}).$element.click(function(){
					if (changes[changes.length-undo-2] !== undefined) {
						save(changes[changes.length-undo-2],false,true);
						undo++;
					}
				}))
				.append(new OO.ui.ButtonWidget({
					framed: false,
					icon: 'redo',
					invisibleLabel: true,
					title: 'Redo'
				}).$element.click(function(){
					if (changes[changes.length-undo] !== undefined) {
						save(changes[changes.length-undo],false,true);
						undo--;
					}
				}))
				.append(new OO.ui.ButtonWidget({
					framed: false,
					icon: 'trash',
					invisibleLabel: true,
					title: 'Clear'
				}).$element.click(function(){
					OO.ui.confirm('Are you sure you want to clear your todo list?').done(function(confirmed){
							if (confirmed) {
									parent.find('.items').empty();
							save('',true,true);
							}
					});
				}))
				.append(new OO.ui.ButtonWidget({
					framed: false,
					icon: 'download',
					invisibleLabel: true,
					title: 'Download'
				}).$element.click(function(){
					$($('<a download="todo.json" style="display:none;"></a>').attr('href','data:text/plain;charset=utf-8,' + encodeURIComponent(mw.user.options.get('userjs-todo-script'))).appendTo(document.body)[0].click()).remove();
				}))
				.append(new OO.ui.ButtonWidget({
					framed: false,
					icon: 'upload',
					invisibleLabel: true,
					title: 'Upload'
				}).$element.click(function(){
					loader.click();
				}))
				.append(new OO.ui.ButtonWidget({
					framed: false,
					icon: 'info',
					invisibleLabel: true,
					title: 'Help'
				}).$element.click(function(){
					$('.userjs-todo-list').css('width','40em').children().css('display','none');
					var helppage = $('<div style="padding:0.5em;overflow-x:hidden;"></div>')
						.append((new OO.ui.ButtonWidget({ 
							label: 'Return',
						}).$element.css('width','100%').children().css('width','100%').parent()).click(function(){
							helppage.remove();
							$('.userjs-todo-list').children().css('display','');
						}))
						.append('<h3>Todo List Help</h3>')
						.append('<h4>Adding and editing items</h4>')
						.append($('<ul></ul>')
							.append('<li><b>Page name or URL</b>: A page name or any valid URL.<br><ul><li>Ex: <code>Main Page</code></li><li>Ex: <code>://www.example.com</code></li><li>Ex: <code>https://example.com&nbsp;Example</code></li></ul>')
							.append('<li><b>Comment</b>: An additional comment.</li>')
						)
						.append('<h5>Notes</h5>')
						.append($('<ol style="margin-left:2em!important;"></ol>')
							.append('<li>A valid URL must start with <code>https://</code>, <code>http://</code> or <code>://</code> or else it will be treated as a page name. Page names will by automatically converted to a link to the wiki article with that title.</li>')
							.append('<li>If the URL contains a space, the text after the space will be used as the display text. For example, <code>https://example.com&nbsp;Example</code> will show up as <code>Example</code> since URLs cannot contain spaces. Spaces can be repersented as <code>%20</code>, <code>_</code> or <code>+</code>.</li>')
							.append('<li>Page names cannot be be displayed differently than the page name. If you desire to diplay the name differently, use the URL of the page followed by your desired display text instead.</li>')
							.append('<li>Page name and Comment are optional, but at least one is required.</li>')
						)
						.append('<h4>Managing and deleting items</h4>')
						.append('<h5>Global</h5>')
						.append($('<ul></ul>')
							.append('<li><b>Redo</b> and <b>Undo</b>: Redo and undo changes. You should not expect to be able to undo all changes. Changes including uploading a todo list, deleting an item, reordering items, deleting the todo list, editing an item, redoing a change, and adding an item. Redo will redo the last undone change. Once you reload the editor, all change history is lost.</li>')
							.append('<li><b>Clear</b>: Delete your entire todo list, this should be able to be undone, but don\'t rely on it. Once you reload the editor, this action cannot be undone.</li>')
							.append('<li><b>Download</b>: Download all itmes currently in the todo list as a JSON file. The file can later to uploaded again the replace the current todo list. Do not edit the JSON file unless you understand the risks associated with doing so and you understand the structure of the file.</li>')
							.append('<li><b>Upload</b>: Upload a todo list JSON file. The new list will replace the current list. The operation should be able to be undone. Only upload a file created by the download fiel button, or else you may cause issues with the script, causing it to become non functional.</li>')
						)
						.append('<h5>Item specfic</h5>')
						.append($('<ul></ul>')
							.append($('<li></li>')
								.append((new OO.ui.IconWidget({icon:'draggable'}).$element.css({height:'1.2em',width:'1.2em',minWidth:'unset',minHeight:'unset',marginRight:'0.5em'})))
								.append('<b>Drag</b>: <span>Drag to change the position of the item.</span><br>')
							)
							.append($('<li></li>')
								.append((new OO.ui.IconWidget({icon:'trash',flags:['destructive']})).$element.css({height:'1.1em',width:'1.1em',minWidth:'unset',minHeight:'unset',marginRight:'0.5em'}))
								.append('<b>Delete</b>: <span>Delete an item.</span><br>')
							)
							.append($('<li></li>')
								.append((new OO.ui.IconWidget({icon:'edit',flags:['progressive']})).$element.css({height:'1em',width:'1em',minWidth:'unset',minHeight:'unset',marginRight:'0.5em'}))
								.append('<b>Edit</b>: <span>Edit an item (page name & comment)</span><br>')
							)
							.append($('<li></li>')
								.append((new OO.ui.IconWidget({icon:'info'})).$element.css({height:'1.3em',width:'1.3em',minWidth:'unset',minHeight:'unset',marginRight:'0.2em'}))
								.append('<b>More information</b>: <span>View more information about an item.</span>')
							)
						)
						.append('<h4>Saving changes</h4>')
						.append('<ul><li>All changes are synced with the API after an action is performed (saving, deleting, dragging etc.).</li><li>When a change is being saved the text "Saving changes..." should appear at the end of the list. Do not leave the page or close the popup until the text dissapears as this may cause changes to not be saved.</li></ul>')
						.append('<h4>About</h4>')
						.append('<div><a href="' + mw.util.getUrl('User:BrandonXLF/TodoList') + '">Todo List</a> (<a href="' + mw.util.getUrl('User:BrandonXLF/TodoList.js') + '">code</a>) by <a href="' + mw.util.getUrl('User:BrandonXLF') + '">User:BrandonXLF</a> (<a href="' + mw.util.getUrl('User talk:BrandonXLF') + '">talk</a>)</div>')
						.appendTo($('.userjs-todo-list'))
					;
				}))
			)
			.append($('<div style="padding:0 0.5em 0.5em;"></div>')
				.append((new OO.ui.TextInputWidget({ 
					placeholder: 'Page name or URL',
					value: mw.config.get('wgPageName').replace(/_/g,' ') != 'Special:BlankPage/todo' ? mw.config.get('wgPageName').replace(/_/g,' ') : ''
				})).$element.css({maxWidth:'unset',margin:'4px 0'}))
				.append((new OO.ui.TextInputWidget({ 
					placeholder: 'Comment'
				})).$element.css({maxWidth:'unset',margin:'4px 0'}))
				.append((new OO.ui.ButtonWidget({ 
					label: 'Add'
				}).$element.css('width','100%').children().css('width','100%').parent()).click(function(){
					var opts = JSON.parse(mw.user.options.get('userjs-todo-script') || '[]');
					var arr = [];
					arr.push($(this).parent().parent().find('input[placeholder="Page name or URL"]').val());
					arr.push($(this).parent().parent().find('input[placeholder="Comment"]').val());
					if (!arr.join('')) return;
					arr.push((new Date()).getTime());
					item($('.userjs-todo-list .items'), arr);
					opts.push(arr);
					save(opts);
					$('#userjs-todo-popup').css({top:Math.max(parseInt($('#userjs-todo-popup').css('top')),0)});
				}))
			)
			.append($('<div class="items" style="margin:0.5em;padding-top:0.5em;border-top:1px solid #a2a9b1;"></div>'))
			.append('<div class="status" style="padding:0 0.5em 0.5em;"></div>')
		);
		if (ispopup) {
			todo.find('.todo-menu')
				.css('cursor','grab')
				.append((new OO.ui.ButtonWidget({
					framed: false,
					icon: 'close',
					invisibleLabel: true,
					title: 'Close'
				}).$element.css({float:'right',marginRight:'0'}).click(function(){
					parent.remove();
				})))
				.append(($('<a></a>').attr('href',mw.util.getUrl('Special:BlankPage/todo')).append((new OO.ui.ButtonWidget({
					framed: false,
					icon: 'newWindow',
					invisibleLabel: true,
					title: 'Your Todo List'
				}).$element.css('float','right').click(function(){
					location.url = mw.util.getUrl('Special:BlankPage/todo');
				})))))
				.on('mousedown',function(e){
					if (e.target !== this) return;
					this.style.cursor = 'grabbing';
					var x = parent.position().left - e.pageX;
					var y = parent.position().top - e.pageY;
					var b = $(document.body);
					function move (e) {
						parent.css({
							left: Math.clamp($(window).width() - parent.width(), e.pageX + x, 0) + 'px',
							top: Math.clamp($(window).height() - parent.height(), e.pageY +	y, 0) + 'px',
							right: '',
							bottom: ''
						});
					}
					function up () {
						e.target.style.cursor = 'grab';
						b.off('mousemove', move);
						b.off('mouseup', up);
					}
					b.on('mousemove',move);
					b.on('mouseup',up);
				});
		}
		$.each(JSON.parse(mw.user.options.get('userjs-todo-script') || '[]'), function (a,b) { item(todo.find('.items'), b); });
		return todo;
	}
	function repos (pos,css,pvar,cond,pcss,ccss) {
		return $('<div style="pointer-events:all;position:absolute;"></div>').attr('id',pos + 'gfdgfdgfd').css('cursor',pos + '-resize').css(css).on('mousedown',function(e){
			if (e.target !== this) return;
			var p = parent;
			var c = p.find('.userjs-todo-list');
			var q = eval(pvar);
			var b = $(document.body);
			b.css('user-select','none');
			function move (e) {
				if (eval(cond)) return;
				(new Function('e', 'p', 'q', 'p.css(' + pcss + ')'))(e, p, q);
				(new Function('e', 'c', 'q', 'c.css(' + ccss + ')'))(e, c, q);
			}
			function up () {
				b.css('user-select','');
				b.off('mousemove', move);
				b.off('mouseup', up);
			}
			b.on('mousemove', move);
			b.on('mouseup', up);
		});
	}
	if (mw.config.get('wgPageName') === 'Special:BlankPage/todo') {
		document.title = 'Your Todo List - ' + mw.config.get('wgSiteName');
		$('#firstHeading').text('Your Todo List');
		parent = mw.util.$content.empty();
		list();
		link.children().first().click(function(e){
			e.preventDefault();
			mw.notify('Unable to open todo list popup while on the todo list page.',{tag:'rtbyilounmt7udfnod'});
		});
	} else {
		link.children().first().click(function(e){
			e.preventDefault();
			if ($('#userjs-todo-popup')[0]) {
				$('#userjs-todo-popup').remove();
				return;
			}
			ispopup = true;
			parent = $('<div style="overflow:auto;min-height:3em;z-index:' + (mw.config.get('skin') === 'minerva' ? '3' : '4') + ';box-shadow:0 2px 2px 0 rgba(0,0,0,0.25);color:#222;min-width:20em;position:fixed;right:1em;background-color:white;border-radius:4px;border: 1px solid #a2a9b1;font-size:0.75rem;max-width:100vw;max-height:100vh;" id="userjs-todo-popup"></div>')
				.appendTo(document.body)
				.css('top',link.position().top + link.height() + 8 + 'px')
				.append($('<div style="pointer-events:none;position:absolute;top:0;left:0;bottom:0;right:0;"></div>')
					.append(repos('e',{top:0,right:0,width:'7px',height:'100%'},'p.position().left','e.clientX - q < 40','{right:"",minWidth:"",left:q	+ "px"}','{width:e.clientX - q + "px"}'))
					.append(repos('n',{top:0,height:'7px',width:'100%'},'p.position().top + p.height()','q <= e.clientY + 40','{top:Math.max(e.clientY, 0) + "px"}','{height:q - e.clientY + "px"}'))
					.append(repos('s',{bottom:0,height:'7px',width:'100%'},'p.position().top','e.clientY - q < 40','{top:Math.max(q,0) + "px"}','{height:e.clientY - q + "px"}'))
					.append(repos('w',{left:0,width:'7px',height:'100%'},'p.position().left + parent.width()','q <= e.clientX + 40','{right:"",minWidth:"",left:e.clientX + "px"}','{width:q - e.clientX + "px"}'))
					.append($('<div style="pointer-events:all;position:absolute;height:100%;top:0;right:0;width:7px;height:7px;cursor:ne-resize;"></div>').on('mousedown',function(e){
						e.originalEvent.stopImmediatePropagation();
						$('#egfdgfdgfd').trigger('mousedown');
						$('#ngfdgfdgfd').trigger('mousedown');
					}))
					.append($('<div style="pointer-events:all;position:absolute;height:100%;top:0;left:0;width:7px;height:7px;cursor:nw-resize;"></div>').on('mousedown',function(e){
						e.originalEvent.stopImmediatePropagation();
						$('#wgfdgfdgfd').trigger('mousedown');
						$('#ngfdgfdgfd').trigger('mousedown');
					}))
					.append($('<div style="pointer-events:all;position:absolute;height:100%;bottom:0;right:0;width:7px;height:7px;cursor:se-resize;"></div>').on('mousedown',function(e){
						e.originalEvent.stopImmediatePropagation();
						$('#egfdgfdgfd').trigger('mousedown');
						$('#sgfdgfdgfd').trigger('mousedown');
					}))
					.append($('<div style="pointer-events:all;position:absolute;height:100%;bottom:0;left:0;width:7px;height:7px;cursor:sw-resize;"></div>').on('mousedown',function(e){
						e.originalEvent.stopImmediatePropagation();
						$('#wgfdgfdgfd').trigger('mousedown');
						$('#sgfdgfdgfd').trigger('mousedown');
					}))
				)
			;
			parent.css('top',Math.max(parseInt(parent.css('top')),0));
			list();
		});
	}
});