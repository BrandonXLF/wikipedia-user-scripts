/*** Show Templates ***/

// Add a link to view what template calls are producing what parts of the page
// Documentation at [[en:w:User:BrandonXLF/ShowTemplates]]
// By [[en:w:User:BrandonXLF]]

$(function() {
	var protletLink = $(mw.util.addPortletLink('p-tb', '#', 'Show templates')).find('a');

	protletLink.click(function(e) {
		e.preventDefault();

		var popup = new OO.ui.PopupWidget({
				padded: true,
				hideWhenOutOfView: false,
				autoClose: false,
				position: 'above',
				classes: ['show-templates-popup-widget'],
				align: 'force-right'
			}),
			popupTimer;

		popup.$element.on('mouseleave', function() {
			if ($('.show-templates-template.current:hover').length) return;

			$('.show-templates-template.current').removeClass('current');
			popup.toggle(false);
			popup.show_templates_element = null;
		});

		$(document.body).append(popup.$element);

		function getTemplate(about, container) {
			var mainElement = $('[about="' + about.replace(/"/g, '\\"') + '"][typeof*="mw:Transclusion"]', container);

			if (!mainElement.length) return;

			var data = mainElement.attr('data-mw');

			if (!data) return;

			return data;
		}

		function createPopupContent(template) {
			var content = $('<p>'),
				prevText;

			for (var i = 0; i < template.parts.length; i++) {
				var part = template.parts[i],
					partElement = $('<div>').addClass('show-templates-part'),
					title;

				if (part.template) {
					if (part.template.target.wt.startsWith('#invoke:')) {
						part.template.target.wt = 'Module:' + part.template.target.wt.substring(8);
						partElement.append('#invoke ');
					}

					try {
						title = new mw.Title(part.template.target.wt.trim(), 10);
					} catch(e) {
						title = part.template.target.wt;
					}

					var link = $(title.getUrl ? '<a>' : '<span>');

					if (title.getUrl) link.attr('href', title.getUrl());
					link.text(title.getPrefixedText ? title.getPrefixedText() : title);

					partElement.append(link);

					for (var name in part.template.params) {
						partElement.append(
							$('<div>').append(
								$('<code>').text(name),
								' = ',
								$('<code>').text(part.template.params[name].wt)
							)
						);
					}

					prevText = null;
				} else {
					if (part.templatearg) {
						var text = part.templatearg.target.wt,
							paramnum = 1;

						while (part.templatearg.params[paramnum]) {
							text += '|' + part.templatearg.params[paramnum].wt;
							paramnum++;
						}

						part = '{{{' + text + '}}}';
					}

					if (prevText) {
						prevText.append(
							document.createTextNode(part)
						);

						continue;
					}

					prevText = $('<code>').text(part).appendTo(partElement);
				}

				content.append(partElement);
			}

			return content;
		}

		function addListeners() {
			$(document.body)
				.on('mouseover', function(e) {
					var element = $(e.target).closest('.show-templates-template');

					if (!element.length || element.hasClass('current')) return;

					var offsetX = 0,
						offsetY = 0;

					function mouseMove(e) {
						offsetX += e.movementX;
						offsetY += e.movementY;
					}

					$('.show-templates-template.current').removeClass('current');
					popup.toggle(false);

					$('.show-templates-template[about="' + element.attr('about').replace(/"/g, '\\"') + '"]').addClass('current');
					popup.show_templates_element = element;
					popup.$body.empty().append(createPopupContent(JSON.parse(element.attr('data-show-templates-template'))));

					window.addEventListener('mousemove', mouseMove);

					if (popupTimer) {
						clearTimeout(popupTimer);
						popupTimer = null;
					}

					popupTimer = setTimeout(function() {
						window.removeEventListener('mousemove', mouseMove);

						if (!element.is('.current')) {
							popup.show_templates_element = null;
							return;
						}

						popup.setFloatableContainer(
							$('<div>').css({
								position: 'absolute',
								left: e.pageX + offsetX + 'px',
								top: e.pageY + offsetY + 'px'
							}).appendTo(document.body)
						);

						popup.toggle(true);
					}, 150);
				})
				.on('mouseout', function() {
					if ($('.show-templates-template.current:hover').length || popup.$element.is(':hover')) return;

					$('.show-templates-template.current').removeClass('current');
					popup.toggle(false);
					popup.show_templates_element = null;
				});
		}

		function addMarker(element, template) {
			var style = getComputedStyle(element[0]);

			element.addClass('show-templates-template');

			if (style.float !== 'none') {
				element.css('z-index', '1');

				if (style.position === 'static') element.css('position', 'relative');
			}

			element.attr('data-show-templates-template', template);
		}

		if ($('.show-templates-container').remove()[0]) {
			$('.mw-parser-output').show();
			protletLink.text('Show templates');
			return;
		} else {
			protletLink.text('Hide templates');
		}

		new mw.Api().get({
			formatversion: 2,
			action: 'parse',
			page: mw.config.get('wgPageName'),
			parsoid: true
		}).then(function(res) {
			var parserOutput = $('.mw-parser-output'),
				container = $('<div class="show-templates-container">');

			parserOutput.css('display', 'none');
			container.insertBefore(parserOutput);

			container.html(res.parse.text);
			mw.hook('wikipage.content').fire(container);

			addListeners();

			$('[about]', container).each(function() {
				var template = getTemplate(this.getAttribute('about'), container);

				if (template) addMarker($(this), template);
			});
		});
	});

	$('<svg><defs>' +
		'<filter id="show-templates-hover-filter" x="0" y="0" width="100%" height="100%">' +
			'<feColorMatrix type="matrix" values="0 0 0 50 0 0 0 0 50 0 0 0 0 0 0 0 0 0 0.7 0" />' +
			'<feBlend in="SourceGraphic" mode="multiply" />' +
			'</filter>' +
		'<filter id="show-templates-filter" x="0" y="0" width="100%" height="100%">' +
			'<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" />' +
			'<feBlend in="SourceGraphic" mode="multiply" />' +
		'</filter>' +
	'</defs></svg>').appendTo(document.body);

	mw.loader.addStyleTag(
		'.show-templates-template:not(section) { filter: url(#show-templates-filter); background: white !important; } ' +
		'.show-templates-template.current:not(section) { filter: url(#show-templates-hover-filter); }' +
		'.show-templates-part { padding: 4px 0; }' +
		'.show-templates-part code { padding: 0 4px; white-space: pre-wrap; }' +
		'.show-templates-part > * { margin: 4px 0; }' +
		'.show-templates-popup-widget { z-index: 1000; }'
	);
});