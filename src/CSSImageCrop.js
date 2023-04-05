/*** CSS Image Crop ***/

// A utility to use {{CSS image crop}} to crop an image
// Documentation at [[en:w:User:BrandonXLF/CSSImageCrop]]
// By [[en:w:User:BrandonXLF]]

$(function() {
	var sampleImg = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Dew_on_grass_Luc_Viatour.jpg/1920px-Dew_on_grass_Luc_Viatour.jpg';

	mw.util.addPortletLink('p-tb', mw.util.getUrl('Special:BlankPage/CSSImageCrop'), 'CSS image crop');

	function clamp(min, x, max) {
		return Math.min(max, Math.max(min, x));
	}

	function update() {
		var mult = img.width() / size.val(),
			mult2 = size.val() / img.width();
		area.css({
			left: clamp(0, left.val(), (parent.width() * mult2)  - parseInt(area.css('right'))) * mult + 'px',
			top: clamp(0, top.val(), (parent.height() * mult2)  - parseInt(area.css('bottom'))) * mult + 'px',
			right: clamp(0, (parent.width() * mult2) - width.val() - left.val(), (parent.width() * mult2) - parseInt(area.css('left'))) * mult + 'px',
			bottom: clamp(0, (parent.height() * mult2)  - height.val() - top.val(), (parent.height() * mult2) - parseInt(area.css('top'))) * mult + 'px'

		});
		setcode();
	}

	function setcode() {
		var mult = size.val() / img.width();
		width.val(Math.round(area.width() * mult));
		height.val(Math.round(area.height() * mult));
		left.val(Math.round(area.position().left * mult));
		top.val(Math.round(area.position().top * mult));
		makecode();
	}

	function makecode() {
		textarea.val(
			'{{CSS image crop\n' +
			'|Image  = ' + file.val() + '\n' +
			'|bSize = ' + size.val() + '\n' +
			'|cWidth = ' + width.val() + '\n' +
			'|cHeight = ' + height.val() + '\n' +
			'|oLeft = ' + left.val() + '\n' +
			'|oTop = ' + top.val() + '\n' +
			(location.val() ? '|Location = ' + location.val() + '\n' : '') +
			(desc.val() ? '|Description = ' + desc.val() + '\n' : '') +
			'}}'
		);
	}

	function repos(ele, func) {
		ele.on('mousedown', function(e) {
			e.stopPropagation();
			function move(e) {
				func(e);
				setcode();
			}
			function up() {
				$(document.body).off('mousemove', move);
				$(document.body).off('mouseup', up);
			}
			$(document.body).on('mousemove', move);
			$(document.body).on('mouseup', up);
		});
	}

	var parent = $('<div style="position:relative;display:inline-block;">'),
		area = $('<div style="position:absolute;top:0;bottom:0;left:0;right:0;background:rgba(0,0,0,0.3);">'),
		img = $('<img style="width:300px;pointer-events:none;user-select:none;" src="' + sampleImg + '">').on('load', function() {
			if (!$('#img').attr('data-loaded')) {
				$('#img').attr('data-loaded', 'true');
				return;
			}
			$('#img').width($('#img').get(0).naturalWidth);
			size.val($('#img').get(0).naturalWidth);
		}),
		north = $('<div  style="position:absolute;left:0;right:0;top:0;height:2px;background:#000;cursor:n-resize;">'),
		south = $('<div style="position:absolute;left:0;right:0;bottom:0;height:2px;background:#000;cursor:s-resize">'),
		east = $('<div style="position:absolute;top:0;bottom:0;right:0;width:2px;background:#000;cursor:e-resize;">'),
		west = $('<div style="position:absolute;top:0;bottom:0;left:0;width:2px;background:#000;cursor:w-resize;">'),
		file = $('<input style="width:100%;margin:2px 0;padding:1px 2px;" placeholder="File" value="Dew on grass Luc Viatour.jpg">').on('change', function() {
			img.attr('src', 'https://en.wikipedia.org/wiki/Special:Filepath/' + file.val());
		}),
		size = $('<input type="number" style="width:100%;margin:2px 0;padding:1px 2px;" placeholder="Base width" value="300">').on('change', setcode),
		textarea = $('<textarea readonly rows="10" style="width:100%;max-width:100%;margin:2px 0 10px;padding:1px 2px;resize:vertical;">'),
		width = $('<input type="number" style="width:100%;margin:2px 0;padding:1px 2px;">').on('change', update),
		height = $('<input type="number" style="width:100%;margin:2px 0;padding:1px 2px;">').on('change', update),
		left = $('<input type="number" style="width:100%;margin:2px 0;padding:1px 2px;">').on('change', update),
		top = $('<input type="number" style="width:100%;margin:2px 0;padding:1px 2px;">').on('change', update),
		location = $(
			'<select style="width:100%;margin:2px 0;padding:1px 2px;">' +
			'<option value="">(none)</option>' +
			'<option>none</option>' +
			'<option>right</option>' +
			'<option>left</option>' +
			'<option>center</option>' +
			'</select>'
		).on('change', makecode),
		desc = $('<input style="width:100%;margin:2px 0;padding:1px 2px;">').on('change', makecode);

	if (mw.config.get('wgCanonicalSpecialPageName') == 'Blankpage' && window.location.href.includes('CSSImageCrop')) {
		mw.util.$content.find('.mw-body-content')
			.html('<h1>CSS Image Crop</h1>')
			.append($('<table>')
				.append($('<tr>')
					.append('<td>File:&nbsp;</td>')
					.append($('<td style="width:100%;">').append(file))
				)
				.append($('<tr>')
					.append('<td>Size:&nbsp;</td>')
					.append($('<td style="width:100%;">').append(size))
				)
				.append('<tr><td colspan="2"><div style="border-top:2px solid #000;margin-bottom:2px;"></div></td></tr>')
				.append($('<tr>')
					.append('<td></td>')
					.append($('<td style="width:100%;">')
						.append(parent
							.append(img)
							.append(area
								.append(west)
								.append(east)
								.append(north)
								.append(south)
								.append($('<div id="nw" style="position:absolute;top:0;left:0;width:4px;height:4px;cursor:nw-resize;">')
									.on('mousedown', function(e) {
										e.stopPropagation();
										north.trigger('mousedown');
										west.trigger('mousedown');
									})
								)
								.append($('<div id="ne" style="position:absolute;top:0;right:0;width:4px;height:4px;cursor:ne-resize;">')
									.on('mousedown', function(e) {
										e.stopPropagation();
										north.trigger('mousedown');
										east.trigger('mousedown');
									})
								)
								.append($('<div id="sw" style="position:absolute;bottom:0;left:0;width:4px;height:4px;cursor:sw-resize;">')
									.on('mousedown', function(e) {
										e.stopPropagation();
										south.trigger('mousedown');
										west.trigger('mousedown');
									})
								)
								.append($('<div id="se" style="position:absolute;bottom:0;right:0;width:4px;height:4px;cursor:se-resize;">')
									.on('mousedown', function(e) {
										e.stopPropagation();
										south.trigger('mousedown');
										east.trigger('mousedown');
									})
								)
							)
						)
					)
				)
				.append($('<tr>')
					.append('<td>Width:</td>')
					.append($('<td style="width:100%;">').append(width))
				)
				.append($('<tr>')
					.append('<td>Height:&nbsp;</td>')
					.append($('<td style="width:100%;">').append(height))
				)
				.append($('<tr>')
					.append('<td>Left:&nbsp;</td>')
					.append($('<td style="width:100%;">').append(left))
				)
				.append($('<tr>')
					.append('<td>Top:&nbsp;</td>')
					.append($('<td style="width:100%;">').append(top))
				)
				.append('<tr><td colspan="2"><div style="border-top:2px solid #000;"></div></td></tr>')
				.append($('<tr>')
					.append('<td><abbr title="Position">Pos</abbr>:&nbsp;</td>')
					.append($('<td style="width:100%;">').append(location))
				)
				.append($('<tr>')
					.append('<td>Desc:&nbsp;</td>')
					.append($('<td style="width:100%;">').append(desc))
				)
				.append('<tr><td colspan="2"><div style="border-top:2px solid #000;"></div></td></tr>')
				.append($('<tr>')
					.append('<td></td>')
					.append($('<td style="width:100%;">')
						.append($('<div style="margin-top:8px;">')
							.append(textarea)
							.append($(
								'<button id="preview">Preview</button> ' +
								'<a href="https://en.wikipedia.org/wiki/Template:CSS_image_crop">Template:CSS image crop</a>'
							).on('click', function() {
								$.post('https://en.wikipedia.org/w/api.php?origin=*', {
									action: 'parse',
									text: textarea.val(),
									format: 'json',
									prop: 'text'
								}).done(function(res) {
									$('#res').css('marginTop', '8px').html(res.parse.text['*']);
								});
							}))
							.append($('<div id="res">'))
						)
					)
				)
			);

		repos(west, function(e) {
			area.css('left', clamp(0, e.pageX - parent.position().left, parent.width() - parseInt(area.css('right'))));
		});

		repos(east, function(e) {
			area.css('right', clamp(0, parent.width() - e.pageX + parent.position().left, parent.width() - parseInt(area.css('left'))));
		});

		repos(north, function(e) {
			area.css('top', clamp(0, e.pageY - parent.position().top, parent.height() - parseInt(area.css('bottom'))));
		});

		repos(south, function(e) {
			area.css('bottom', clamp(0, parent.height() - e.pageY + parent.position().top, parent.height() - parseInt(area.css('top'))));
		});

		repos(area, function(e) {
			var pos = [
				parseInt(area.css('left')) + e.originalEvent.movementX,
				parseInt(area.css('right')) - e.originalEvent.movementX,
				parseInt(area.css('top')) + e.originalEvent.movementY,
				parseInt(area.css('bottom')) - e.originalEvent.movementY
			];
			if (pos[0] < 0 || pos[1] < 0 || pos[2] < 0 || pos[3] < 0) return;
			area.css('left', pos[0]);
			area.css('right', pos[1]);
			area.css('top', pos[2]);
			area.css('bottom', pos[3]);
		});
	}
});