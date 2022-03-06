/*** Subpage Mover ***/

// Easily move the subpages of a page with a single click
// Documentation at [[User:BrandonXLF/SubpageMover]]
// By [[User:BrandonXLF]]

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

	Log.prototype.logFailure = function(from, to, reasonHtml) {
		this.log(['Failed to move page ', this.createLink(from), ' to ', this.createLink(to), '. Reason: ', reasonHtml], '#d33');
	};

	Log.prototype.logSuccess = function(from, to) {
		this.log(['Successfully moved page ', this.createLink(from), ' to ', this.createLink(to), '.'], '#14866d');
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
				log.logFailure(from, to, response.errors[0].html);
				return;
			}

			log.logSuccess(response.move.from, response.move.to);

			if (response.move['talkmove-errors']) {
				var talkFrom = (from.match(':') ? from.replace(':', ' talk:') : 'Talk:') + from,
					talkTo = (to.match(':') ? to.replace(':', ' talk:') : 'Talk:') + to;

				log.logFailure(talkFrom, talkTo, response.move['talkmove-errors'][0].html);
				return;
			}

			if (response.move.talkfrom) {
				log.logSuccess(response.move.talkfrom, response.move.talkto);
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

		var fromTitle = $('input[name="wpOldTitle"]').val(),
			toNamespaceId = $('select[name="wpNewTitleNs"]').val(),
			toNamespace = mw.config.get('wgFormattedNamespaces')[toNamespaceId].replace(' ', '_'),
			toPage = $('input[name=wpNewTitleMain]').val(),
			toTitle = (toNamespace === '' ? '' : toNamespace) + toPage,
			params = {
				reason: $('input[name="wpReason"]').val(),
				movetalk: $('input[name="wpMovetalk"]').prop('checked') ? true : undefined,
				noredirect: $('[name="wpLeaveRedirect"]').prop('checked') === false ? true : undefined,
				watchlist: $('input[name="wpWatch"]').prop('checked') ? 'watch' : 'nochange',
			};

		$.get(mw.config.get('wgScriptPath') + '/api.php', {
			action: 'query',
			list: 'allpages',
			apprefix: fromTitle + '/',
			pslimit: '500',
			format: 'json',
			formatversion: '2'
		}).done(function(res) {
			movePage(fromTitle, toTitle, params, log, function() {
				var prefixRegex = new RegExp('^' + mw.util.escapeRegExp(fromTitle));

				res.query.allpages.forEach(function(info) {
					if (info.title === fromTitle) return;

					movePage(info.title, info.title.replace(prefixRegex, toTitle), params, log);
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