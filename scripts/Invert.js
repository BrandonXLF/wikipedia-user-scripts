/*** Invert ***/

// Invert the colour of the page
// Documentation at [[User:BrandonXLF/Invert]]
// By [[User:BrandonXLF]]

$.when(mw.loader.using('oojs-ui.styles.icons-movement'),$.ready).then(function(){
	var invert = JSON.parse(mw.user.options.get('userjs-invert') || '[]')[0] || false;
	var images = JSON.parse(mw.user.options.get('userjs-invert') || '[]')[1] || false;
	var whiteb = JSON.parse(mw.user.options.get('userjs-invert') || '[]')[2] || false;
	
	function applycss () {
		var tempCSS = '';
		tempCSS += 'html{height:auto;background:' + (invert ? '#090909' : 'transparent') + '!important;-webkit-filter:invert(' + (invert ? '100' : '0') + '%)!important;filter:invert(' + (invert ? '100' : '0') + '%)!important}';
		tempCSS += 'img,video{-webkit-filter:invert(' + (invert && !images ? '100' : '0') + '%)!important;filter:invert(' + (invert && !images ? '100' : '0') + '%)!important}';
		tempCSS += 'img,video{background:' + (invert && whiteb ? (images ? '#000000' : '#ffffff') : 'initial') + '}';
		$('#inpgdcs').remove();
		$('<style></style>').html(tempCSS).attr('id','inpgdcs').appendTo(document.head);
	}
	
	function update (e) {
		if (e && e.target == active2[0] && active2.prop('checked')) {
			active3.prop('checked', false);
		} else if (e && e.target == active3[0] && active3.prop('checked')) {
			active2.prop('checked', false);
		}
		invert = active1.prop('checked');
		images = active2.prop('checked');
		whiteb = active3.prop('checked');
		active2.prop('disabled', !invert);
		active3.prop('disabled', !invert);
		applycss();
	}
	
	function sync (e) {
		if (e && e.target == saved2 && saved2.prop('checked')) {
			saved3.prop('checked', false);
		} else if (e && e.target == saved3 && saved3.prop('checked')) {
			saved2.prop('checked', false);
		}
		invert = saved1.prop('checked');
		images = saved2.prop('checked');
		whiteb = saved3.prop('checked');
		active1.prop('checked', invert);
		active2.prop('checked', images);
		active3.prop('checked', whiteb);
		saved2.prop('disabled', !invert);
		saved3.prop('disabled', !invert);
		active2.prop('disabled', !invert);
		active3.prop('disabled', !invert);
		applycss();
		(new mw.Api()).saveOption('userjs-invert',JSON.stringify([invert,images,whiteb])).done(save);
		mw.user.options.set('userjs-invert',JSON.stringify([invert,images,whiteb]));
	}
	
	function save () {
		var fileCSS = '/* INVERT CSS */ ' + (images ? '' : 'img,video,') + 'html{-webkit-filter:invert(100%);filter:invert(100%)' + (images ? ';' : '}html{') + 'height:auto;background:#090909}' + (whiteb ? 'img,video{background:' + (images ? '#000000' : '#ffffff') + '}' : '');
		$.get(mw.config.get('wgScript'),{
			action: 'raw',
			title: 'User:' + mw.config.get('wgUserName') + '/common.css'
		}).done(function(text){
			var newtext = text.replace(/[\n\r]*\/\* INVERT CSS \*\/ ?.*/,'');
			if (invert) {
				newtext += '\n\n' + fileCSS;
			}
			if (text != newtext) {
				$.post(mw.config.get('wgScriptPath') + '/api.php', {
					action: 'edit',
					title: 'User:' + mw.config.get('wgUserName') + '/common.css',
					text: newtext,
					summary: 'Modifying [[User:BrandonXLF/Invert|invert page]] CSS style',
					token: mw.user.tokens.get('csrfToken'),
					format: 'json'
				}).always(function(a,b,c){
					if (b == 'error' || a.error) {
						mw.notify('Unable to update invert colour CSS.' + (b == 'error' ? ' AJAX request failed.' : ''), {tag: 'invertpage', type: 'error'});
					} else {
						mw.notify('Invert colour CSS saved sucessfully!', {tag: 'invertpage'});
					}
				});
			}
		});
	}
	
	var PRE = '<label style="vertical-align:middle;display:block;"><input style="vertical-align:middle;margin:3px;" type="checkbox"><span style="vertical-align:middle;margin:3px;display:inline-block;"> ';
	var POST = '</span></label> ';
	
	var saved1 = $(PRE + 'Invert' + POST).children().prop('checked', invert).change(sync);
	var saved2 = $(PRE + 'Invert imgs' + POST).children().prop('checked', images).prop('disabled', !invert).change(sync);
	var saved3 = $(PRE + 'White img bg' + POST).children().prop('checked', whiteb).prop('disabled', !invert).change(sync);
	
	var active1 = $(PRE + 'Invert' + POST).children().prop('checked', invert).change(update);
	var active2 = $(PRE + 'Invert imgs' + POST).children().prop('checked', images).prop('disabled', !invert).change(update);
	var active3 = $(PRE + 'White img bg' + POST).children().prop('checked', whiteb).prop('disabled', !invert).change(update);
	
	var opts = $('<div>');
	var link = $(mw.util.addPortletLink('p-personal','#','Invert','invert-colour','Invert colour','i','#pt-mytalk'))
		.on('mouseenter',function(){
			opts.css('display','block');
		})
		.on('mouseleave',function(){
			if (mw.config.get('skin') != 'minerva') {
				opts.css('display','none');
			}
		})
		.on('click',function(e){
			if (e.target == $(this).find('a').get(0)) e.preventDefault();
		})
	;
	opts.css({display:'none',padding:'4px',border:'1px solid #999',borderRadius:'2px',position:'absolute',background:'#fff'})
		.appendTo(link)
		.append('<div style="margin-bottom:6px;font-weight:bold;text-align:center;">Saved config</div>')
		.append(saved1.parent())
		.append(saved2.parent())
		.append(saved3.parent())
		.append('<hr style="margin-top:6px;">')
		.append($('<div style="text-align:center;margin-bottom:4px;"></div>')
			.append((new OO.ui.IconWidget({
				icon: 'expand',
				label: '▼',
				title: 'Reset temporary configuration'
			})).$element.css({height:'1em',minHeight:'1em',cursor:'pointer',marginRight:'0.5em'}).click(update()))
			.append((new OO.ui.IconWidget({
				icon: 'collapse',
				label: '▲',
				title: 'Save temporary configuration'
			})).$element.css({height:'1em',minHeight:'1em',cursor:'pointer'}).click(function(){
				saved1.prop('checked', active1.prop('checked'));
				saved2.prop('checked', active2.prop('checked'));
				saved3.prop('checked', active3.prop('checked'));
				sync();
			}))
		)
		.append('<hr style="margin-bottom:6px;">')
		.append('<div style="margin-bottom:6px;font-weight:bold;text-align:center;">Temp. config</div>')
		.append(active1.parent())
		.append(active2.parent())
		.append(active3.parent())
	;
	if (mw.config.get('skin') === 'minerva') {
		link.click(function(e){
			e.stopImmediatePropagation();
			opts.css('display','block');
			OO.ui.alert(opts.css('position','').css('border',''),{size:'large'}).done(function(){});
		});
	}
	save();
});