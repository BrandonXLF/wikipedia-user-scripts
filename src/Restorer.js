/*** Restorer ***/

// Easily restore an older version of a page
// Documentation at [[w:User:BrandonXLF/Restorer]]
// By [[w:User:BrandonXLF]]

$(function() {
	if (mw.config.get('wgAction') != 'history') return;

	window.restorerSummary = window.restorerSummary || 'Restored revision $ID by [[Special:Contributions/$USER|$USER]] ([[w:User:BrandonXLF/Restorer|Restorer]])';

	function restore(user, revid) {
		return new mw.Api().postWithEditToken({
			action: 'edit',
			pageid: mw.config.get('wgArticleId'),
			undo: mw.config.get('wgCurRevisionId'),
			undoafter: revid,
			summary: window.restorerSummary.replace(/\$ID/g, revid).replace(/\$USER/g, user)
		}).then(
			function() {
				mw.notify('Restored revision successfully.');
				location.reload();
			},
			function(_, data) {
				mw.notify(new mw.Api().getErrorMessage(data), {type: 'error'});
			}
		);
	}

	function addLink(item) {
		var revid = item.getAttribute('data-mw-revid'),
			user,
			links,
			el,
			parent;

		if (revid == mw.config.get('wgCurRevisionId')) return;

		user = item.getElementsByClassName('mw-userlink')[0].textContent.replace('User:', '');
		links = item.getElementsByClassName('mw-changeslist-links');
		links = links[links.length - 1];
		parent = document.createElement('span');
		el = document.createElement('a');

		el.addEventListener('click', function() {
			el.className = 'restorer-loading';

			restore(user, revid).always(function() {
				el.className = '';
			});
		});

		el.innerHTML = 'restore';
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