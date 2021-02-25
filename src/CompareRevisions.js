/*** Compare Revisions ***/

// Adds a button to the diff page to compare two revisions side-by-side
// Documentation at [[User:BrandonXLF/CompareRevisions]]
// By [[User:BrandonXLF]]

$.when(mw.loader.using('oojs-ui'),$.ready).then(function(){
	mw.hook('wikipage.diff').add(function(){
		var parent = document.getElementsByClassName('ve-init-mw-diffPage-diffMode')[0];
		var ids = mw.config.get(['wgDiffOldId','wgDiffNewId']);
		var store = {};
		if (!ids.wgDiffOldId || !ids.wgDiffNewId) return;
		$('.diff-title').after('<tr><td colspan="4"><div id="comparerev-area"></div></td></tr>');
		var bar = (new OO.ui.ButtonSelectWidget({items:[
			new OO.ui.ButtonOptionWidget({
				label: 'Diff',
				data: 'diff'
			}),
			new OO.ui.ButtonOptionWidget({
				label: 'Compare'
			}),
			new OO.ui.ButtonOptionWidget({
				label: 'Compare Code'
			})
		]})).selectItemByData('diff').$element.css('float','left').css('margin', $('.ve-init-mw-diffPage-diffMode').length ? '0 0 0 8px' : '8px 0').attr('id','comparerev-bar');
		if ($('.ve-init-mw-diffPage-diffMode').length) {
			$('.ve-init-mw-diffPage-diffMode').append(bar);
		} else if ($('.mw-revslider-container').length) {
			$('.mw-revslider-container').after(bar);
		} else {
			$('#mw-content-text').prepend(after);
		}
		$('#comparerev-bar').find('a').each(function(){
			var e = $(this);
			$(this).click(function(){
				$('#comparerev-area').empty();
				$('#comparerev-area').off('dblclick');
				if (e.text() == 'Compare') {
					$('#comparerev-area').on('dblclick',function(e){
						if (document.getElementById('comparerev-x')) {
							$('#comparerev-x, #comparerev-y').remove();
							return;
						}
						if ($('#comparerev-old .mw-parser-output').get(0)) {
							$('body').append('<div id="comparerev-x" style="top:0;bottom:0;width:1px;height:100%;background:blue;position:fixed;"></div><div id="comparerev-y" style="left:0;right:0;height:1px;width:100%;background:blue;position:fixed;"></div>');
							$('#comparerev-x').css('left',e.clientX + 'px');
							$('#comparerev-y').css('top',e.clientY + 'px');
							addEventListener('mousemove',function(e){
								$('#comparerev-x').css('left',e.clientX + 'px');
								$('#comparerev-y').css('top',e.clientY + 'px');
							});
							$('#comparerev-x, #comparerev-y').one('click',function(){
								$('#comparerev-area').trigger('dblclick');
							});
						}
					});
					$('#comparerev-area').css('display','block').html('<div style="width:50%;padding:3px 10px;box-sizing:border-box;float:left;" id="comparerev-old"><div style="text-align:center;">Loading...</div></div><div style="width:50%;padding:3px 10px;box-sizing:border-box;float:left;" id="comparerev-new"><div style="text-align:center;">Loading...</div></div>');
					mw.notify('Enable crosshair in compare view by double clicking.',{tag:'qccrosshair'});
					$(this).siblings().removeClass('active');
					$(this).addClass('active');
					mw.util.addCSS('#comparerev-area .toctext, #comparerev-area .tocnumber { display: inline; } #comparerev-area li { margin-bottom: 0; }');
					if (store.htmlold) {
						$('#comparerev-old').html(store.htmlold);
						$('#comparerev-old').find('[for="toctogglecheckbox"]').attr('for','toctogglecheckbox-old');
						$('#comparerev-old').find('#toctogglecheckbox').attr('id','toctogglecheckbox-old');
					} else {
						$.get(mw.config.get('wgScriptPath') + '/api.php', {
							action: 'parse',
							oldid: ids.wgDiffOldId,
							prop: 'text',
							format: 'json'
						}).done(function(parsed){
							store.htmlold = parsed.parse.text['*'];
							$('#comparerev-old').html(parsed.parse.text['*']);
							$('#comparerev-old').find('[for="toctogglecheckbox"]').attr('for','toctogglecheckbox-old');
							$('#comparerev-old').find('#toctogglecheckbox').attr('id','toctogglecheckbox-old');
						});
					}
					if (store.htmlnew) {
						$('#comparerev-new').html(store.htmlnew);
						$('#comparerev-new').find('[for="toctogglecheckbox"]').attr('for','toctogglecheckbox-new');
						$('#comparerev-new').find('#toctogglecheckbox').attr('id','toctogglecheckbox-new');
					} else {
						$.get(mw.config.get('wgScriptPath') + '/api.php', {
							action: 'parse',
							oldid: ids.wgDiffNewId,
							prop: 'text',
							format: 'json'
						}).done(function(parsed){
							store.htmlnew = parsed.parse.text['*'];
							$('#comparerev-new').html(parsed.parse.text['*']);
							$('#comparerev-new').find('[for="toctogglecheckbox"]').attr('for','toctogglecheckbox-new');
							$('#comparerev-new').find('#toctogglecheckbox').attr('id','toctogglecheckbox-new');
						});
					}
				} else if (e.text() == 'Compare Code') {
					$('#comparerev-area').css('display','block').html('<div style="width:50%;padding:3px 10px;box-sizing:border-box;float:left;" id="comparerev-old"><div style="text-align:center;">Loading...</div></div><div style="width:50%;padding:3px 10px;box-sizing:border-box;float:left;" id="comparerev-new"><div style="text-align:center;">Loading...</div></div>');
					$(this).siblings().removeClass('active');
					$(this).addClass('active');
					if (store.codeold) {
						$('#comparerev-old').empty().append($('<pre></pre>').text(store.codeold));
					} else {
						$.get(mw.config.get('wgScript'), {
							action: 'raw',
							oldid: ids.wgDiffOldId
						}).done(function(code){
							store.codeold = code;
							$('#comparerev-old').empty().append($('<pre></pre>').text(code));
						});
					}
					if (store.codenew) {
						$('#comparerev-new').empty().append($('<pre></pre>').text(store.codenew));
					} else {
						$.get(mw.config.get('wgScript'), {
							action: 'raw',
							oldid: ids.wgDiffNewId
						}).done(function(code){
							store.codenew = code;
							$('#comparerev-new').empty().append($('<pre></pre>').text(code));
						});
					}
				}
			});
		});
	});
});