/*** Restorer ***/

// Easily restore an older version of a page
// Documentation at [[en:w:User:BrandonXLF/Restorer]]
// By [[en:w:User:BrandonXLF]]

$(function() {
	if (mw.config.get('wgAction') != 'history') return;

	window.restorerSummary = window.restorerSummary ||
		'Restored revision $ID by [[Special:Contributions/$USER|$USER]] ([[en:w:User:BrandonXLF/Restorer|Restorer]])';

	function restore(revid) {
		var api = new mw.Api();

		return api.get({
			action: 'query',
			revids: revid,
			prop: 'revisions',
			rvprop: 'user',
			format: 'json',
			formatversion: '2'
		}).then(function(res) {
			var user = res.query.pages[0].revisions[0].user;

			return api.postWithEditToken({
				action: 'edit',
				pageid: mw.config.get('wgArticleId'),
				undo: mw.config.get('wgCurRevisionId'),
				undoafter: revid,
				summary: window.restorerSummary.replace(/\$ID/g, revid).replace(/\$USER/g, user)
			});
		}).then(
			function() {
				mw.notify('Restored revision successfully.');
				location.reload();
			},
			function(_, data) {
				mw.notify(api.getErrorMessage(data), {type: 'error'});
			}
		);
	}

	function addLink(item) {
		var revid = item.getAttribute('data-mw-revid');
		if (revid == mw.config.get('wgCurRevisionId')) return;

		var links = item.querySelector('.comment + .mw-changeslist-links');
		if (!links) return;

		var parent = document.createElement('span'),
			el = document.createElement('a');

		el.addEventListener('click', function() {
			el.className = 'restorer-loading';

			restore(revid).always(function() {
				el.className = '';
			});
		});

		el.textContent = 'restore';
		parent.appendChild(el);
		links.appendChild(parent);
	}

	var parents = document.querySelectorAll('li[data-mw-revid]');

	for (var i = 0; i < parents.length; i++) {
		addLink(parents[i]);
	}

	mw.loader.addStyleTag(
		'@keyframes restorer-loading {' +
		'0%, 100% {content: " ⡁"} 16% {content: " ⡈"} 33% {content: " ⠔"} 50% {content: " ⠒"} 66% {content: " ⠢"} 83% {content: " ⢁"}}' +
		'.restorer-loading::after {white-space: pre; content: ""; animation: restorer-loading 0.5s infinite}'
	);
});