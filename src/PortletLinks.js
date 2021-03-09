/*** Portlet Link Manager ***/

// Easily add and manage custom portlet linls
// Documentation at [[User:BrandonXLF/PortletLinks]]
// By [[User:BrandonXLF]]

$(function(){
	var vars = ['area','url','text','title','id','nnode','key'];
	var areas = ['p-cactions','p-personal','p-views','p-tb','left-navigation','p-navigation','p-interaction','footer','footer-places'];
	var i = 0;
	var links = JSON.parse(mw.user.options.get('userjs-portletmanager') || '[]');
	function randColor () {
		return '#' + Math.floor(Math.random() * 256).toString(16).padStart(2,'0') + Math.floor(Math.random() * 256).toString(16).padStart(2,'0') + Math.floor(Math.random() * 256).toString(16).padStart(2,'0');
	}
	function startedit (e) {
		e.stopPropagation();
		$('.plm .focused').removeClass('focused');
		var el = $(this);
		$('#largeeditor').val(el.val()).off('input keypress paste click').attr('placeholder','');
		$('#largeeditor').on('input keypress paste',function(){
			el.addClass('focused');
			el.val(this.value);
		});
		$('#largeeditor').on('click',function(e){
			e.stopPropagation();
			el.addClass('focused');
		});
	}
	function syncedit () {
		if ($(this).is(":focus")) {
			$('#largeeditor').val(this.value);
		}
	}
	function row (link) {
		var i = 0, j = 0;
		var tr = $('<tr>').attr('data-row','')
			.append($('<td style="border:1px solid #888;white-space:nowrap;width:1px;text-align:center;">').append($('<img src="https://upload.wikimedia.org/wikipedia/commons/b/bc/Not_allowed.svg" style="height:1em;cursor:pointer;">').click(function(){
				$(this).closest('tr').remove();
			})).append('<img title="Drag" class="drag" src="https://upload.wikimedia.org/wikipedia/commons/3/30/OOjs_UI_icon_draggable.svg" style="height:1.15em;cursor:move;">'))
		;
		for (i = 0; i < vars.length; i++) {
			var td = $('<td>').appendTo(tr);
			(vars[i] === 'area' ? $('<select>') : $('<input>').val(link ? link[vars[i]] : '').css('width','100%').click(startedit)).on('input keypress paste',syncedit).attr('data-name',vars[i]).appendTo(td);
			if (vars[i] === 'area') {
				for (j = 0; j < areas.length; j++) {
					td.children().append($('<option>' + areas[j] + '</option>').attr('selected',areas[j] == link.area ? '' : null));
				}
			}
			if (vars[i] == 'key') {
				td.children().css('width','3em');
			}
		}
		$('#editor tr:last').before(tr);
		return;
	}
	function addLinks () {
		var link;
		$('.plm-portletitem').remove();

		for (i = 0; i < links.length; i++) {
			link = links[i];
			try {
				mw.util.addPortletLink(link.area,/^(https|http|):?\/\/.*/.exec(link.url) ? link.url.replace(/\$PAGENAME\$/g,encodeURIComponent(mw.config.get('wgPageName'))) : mw.util.getUrl(link.url.replace(/\$PAGENAME\$/g,encodeURIComponent(mw.config.get('wgPageName')))),link.text,link.id,link.title,link.key,link.nnode).className += ' plm-portletitem';
			} catch (e) {
				console.error('PortletLinks.js: Unable to add portlet link to #' + link.area + ' for ' + link.url);
			}
		}
		
		link = mw.util.addPortletLink('p-navigation',mw.util.getUrl('Special:BlankPage/PortletManager'),'(edit portlet links)');
		if (link) link.className += ' plm-portletitem';
	}
	function save () {
		var el = this;
		links = [];
		$('#editor').find('[data-row]').each(function(){
			var item = {};
			$(this).find('[data-name]').each(function(){
				item[this.getAttribute('data-name')] = this.value;
			});
			links.push(item);
		});
		el.src = 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Ajax_loader_metal_512.gif';
		el.title = 'Saving...';
		el.style.cursor = 'initial';
		mw.user.options.set('userjs-portletmanager',JSON.stringify(links));
		(new mw.Api()).saveOption('userjs-portletmanager',JSON.stringify(links)).done(function(r){
			addLinks();
			el.src = 'https://upload.wikimedia.org/wikipedia/commons/9/97/PICOL_icon_Floppy_disk.svg';
			el.title = 'Save';
			el.style.cursor = 'Pointer';
			mw.notify(r.options == 'success' ? 'Saved portlet links sucessfully!' : 'An error occurred while saving.',{tag:'gdsfgfdgfd',type:r.options == 'success' ? 'notice' : 'error'});
		}).fail(function(){
			el.src = 'https://upload.wikimedia.org/wikipedia/commons/9/97/PICOL_icon_Floppy_disk.svg';
			el.title = 'Save';
			el.style.cursor = 'Pointer';
			mw.notify('An error occurred while saving.',{tag:'gdsfgfdgfd',type:'error'});
		});
	}
	
	addLinks();
	
	if (window.location.search.includes('showportlets=true')) {
		var el = $('<div>').prependTo(mw.util.$content);
		for (i = 0; i < areas.length; i ++) {
			var color = randColor();
			$('#' + areas[i]).css({outline:'2px solid ' + color,outlineOffset:Math.round(Math.random() * 2) - 4 + 'px'});
			el.append($('<div>').css({border:'1px solid #000',display:'inline-block',width:'1em',height:'1em',background:color,marginRight:'5px',verticalAlign:'middle',marginBottom:'5px'})).append($('<div>').text(areas[i]).css({marginRight:'5px',verticalAlign:'middle',marginBottom:'5px',display:'inline-block'}));
			mw.util.addPortletLink(areas[i],'#',areas[i].toUpperCase());
		}
	}
	
	if (mw.config.get('wgPageName') === 'Special:BlankPage/PortletManager') {
		document.title = 'Manage custom portlet links - ' + mw.config.get('wgSiteName');
		mw.util.$content.addClass('plm');
		mw.util.addCSS(
			'.plm input:focus,.plm select:focus,.plm textarea:focus, .plm .focused{outline:0;border-color:#36c;box-shadow:inset 0 0 0 1px #36c;}' +
			'.plm button,.plm input,.plm select{border:1px solid #888;padding:4px;box-sizing:border-box;}' +
			'.plm select{padding:3px 4px;}' +
			'#editor th{border:1px solid #888;padding:2px;}'
		);
		$(document).click(function(){
			$('.plm .focused').removeClass('focused');
			$('#largeeditor').off('input keypress paste click').val('').attr('placeholder','Select a cell to edit it.');
			
		});
		mw.loader.getScript('https://code.jquery.com/ui/1.12.1/jquery-ui.min.js').then(function(){
			mw.util.$content.empty()
				.append('<h1>Manage custom portlet links</h1>')
				.append($('<table id="editor" cellspacing="0" cellpadding="0" style="margin-top:1em;border:1px solid #888;"><tr class="nodrag"><td rowspan="2" style="border:1px solid #888;text-align:center;padding:4px;"><img title="Save" style="cursor:pointer;height:1.5em;" id="savecell" src="https://upload.wikimedia.org/wikipedia/commons/9/97/PICOL_icon_Floppy_disk.svg"></td><td colspan="7"><input style="width:100%;border-bottom-width:1px;" id="largeeditor" placeholder="Select a cell to edit it."></td><tr class="nodrag"><th style="width:1%;">Area</th><th>URL</th><th>Text</th><th>Tooltip</th><th>ID</th><th>Next node</th><th style="width:1px;">Key</th></tr></table>').sortable({items:'tr:not(.nodrag)',handle:'.drag'}).wrap('<div style="margin-top:0.5em;border: 1px solid #a2a9b1;border-radius:2px;padding:10px 5px;">'))
				.append('<div style="margin-top:1em;border:2px solid #888;padding:5px;"><p>Remember to save your changes! <a target="_blank" href="' + mw.config.get('wgArticlePath').replace('$1','Special:MyPage/common.js') + '">Your common.js</a>. <a target="_blank" href="' + mw.config.get('wgArticlePath').replace('$1','Special:MyPage/common.css') + '">Your common.css</a>. <a target="_blank" href="' + mw.config.get('wgScript') + '?showportlets=true">Show portlets</a>.</p><table><tr><th style="text-align:left;">Area</th><td>The portlet link region to add the link.</td></tr><tr><th style="text-align:left;">URL</th><td>The target URL of the link. Use <code>$PAGENAME$</code> for the current full page name. Use <code>//</code> to link to a full URL.</tr><tr><th style="text-align:left;">Text</th><td>The text to show as the link. There is no default.</td></tr><tr><th style="text-align:left;">ID</th><td>The ID of the link HTML element.</td></tr><tr><th style="text-align:left;">Tooltip</th><td>Tooltip (title) to show for the link.</td></tr><tr><th style="text-align:left;">Next&nbsp;node&nbsp;&nbsp;</th><td>CSS selector for the node that comes after the link. Use <code><i>selector</i> + *</code> to have the selector be the previous node.</td></tr><tr><th style="text-align:left;">Key</th><td>The access key for the link. See <a href="https://en.wikipedia.org/wiki/Access_key">the article on access keys</a> for more information.</td></tr></table></div>')
			;
			$('#savecell').click(save);
			$('#editor').append($('<tr class="nodrag"><td style="border:1px solid #a2a9b1;text-align:center;" colspan="8"></td></tr>').find('td').append($('<span style="display:inline-block;font-size:1.2em;border-radius:100%;background:#888;color:white;width:1em;line-height:1em;height:1em;margin:4px;cursor:pointer;" title="Add">+</span>').click(row)).parent());
			for (i = 0; i < links.length; i++) row(links[i]);
		});
	}
});