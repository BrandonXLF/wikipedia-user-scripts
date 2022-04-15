/*** Subpage Mover ***/

// Easily move the subpages of a page with a single click
// Documentation at [[w:User:BrandonXLF/SubpageMover]]
// By [[w:User:BrandonXLF]]

$(function() {
	function Log() {
		$('#moveSubpages-log').remove();

		this.el = $('<div>')
			.appendTo($('#movepage'))
			.append('<br><hr>')
			.attr('id', 'moveSubpages-log');
	}

	Log.prototype.log = function(html, color) {
		this.el.append($('<p>').append(html).css('color', color));
	};

	Log.prototype.createLink = function(page) {
		return $('<a>').attr('href', mw.util.getUrl(page)).text(page);
	};

	Log.prototype.logError = function(html) {
		this.log(html, '#d33');
	};

	Log.prototype.logSuccess = function(html) {
		this.log(html, '#14866d');
	};

	Log.prototype.logMoveError = function(from, to, reasonHtml) {
		this.logError(['Failed to move page ', this.createLink(from), ' to ', this.createLink(to), '. Reason: ', reasonHtml]);
	};

	Log.prototype.logMoveSuccess = function(from, to) {
		this.logSuccess(['Successfully moved page ', this.createLink(from), ' to ', this.createLink(to), '.']);
	};

	function movePage(from, to, params, log, onSuccess) {
		$.post(mw.config.get('wgScriptPath') + '/api.php', $.extend({
			action: 'move',
			from: from,
			to: to,
			token: mw.user.tokens.get('csrfToken'),
			format: 'json',
			formatversion: '2',
			uselang: 'user',
			errorformat: 'html',
			errorlang: 'uselang'
		}, params)).done(function(response) {
			if (response.errors) {
				log.logMoveError(from, to, response.errors[0].html);
				return;
			}

			log.logMoveSuccess(response.move.from, response.move.to);

			if (response.move['talkmove-errors']) {
				var talkFrom = (from.match(':') ? from.replace(':', ' talk:') : 'Talk:') + from,
					talkTo = (to.match(':') ? to.replace(':', ' talk:') : 'Talk:') + to;

				log.logMoveError(talkFrom, talkTo, response.move['talkmove-errors'][0].html);
				return;
			}

			if (response.move.talkfrom) {
				log.logMoveSuccess(response.move.talkfrom, response.move.talkto);
			}

			onSuccess && onSuccess();
		});
	}

	function moveSubpages() {
		$('#moveSubpages-log').remove();

		var log = new Log();

		if (mw.config.get('wgUserGroups').indexOf('extendedconfirmed') === -1) {
			log.log('You must be at least extended confirmed.', 'red');
			return;
		}

		var fromTitle = new mw.Title($('input[name="wpOldTitle"]').val()),
			toTitle = mw.Title.makeTitle($('select[name="wpNewTitleNs"]').val(), $('input[name="wpNewTitleMain"]').val()),
			params = {
				reason: $('input[name="wpReason"]').val(),
				movetalk: $('input[name="wpMovetalk"]').prop('checked') ? true : undefined,
				noredirect: $('[name="wpLeaveRedirect"]').prop('checked') === false ? true : undefined,
				watchlist: $('input[name="wpWatch"]').prop('checked') ? 'watch' : 'nochange',
			};

		if (!toTitle) {
			log.logError('New title is an invalid page!');
			return;
		}

		$.get(mw.config.get('wgScriptPath') + '/api.php', {
			action: 'query',
			list: 'allpages',
			apprefix: fromTitle.getMainText() + '/',
			apnamespace: fromTitle.getNamespaceId(),
			pslimit: '500',
			format: 'json',
			formatversion: '2'
		}).done(function(res) {
			movePage(fromTitle.getPrefixedText(), toTitle.getPrefixedText(), params, log, function() {
				var prefixRegex = new RegExp('^' + mw.util.escapeRegExp(fromTitle.getPrefixedText()));

				res.query.allpages.forEach(function(info) {
					if (info.title === fromTitle) return;

					movePage(info.title, info.title.replace(prefixRegex, toTitle.getPrefixedText()), params, log);
				});
			});
		});
	}

	if (window.location.href.match('Special:MovePage') && !$('p:contains(\'This page has no subpages.\')')[0]) {
		new OO.ui.ButtonWidget({
			label: 'Move page and subpages',
			flags: ['primary', 'progressive']
		}).$element
			.on('click', moveSubpages)
			.appendTo($('button[name=wpMove]').parent().parent());
	}
});
