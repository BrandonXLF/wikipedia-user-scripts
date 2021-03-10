/*** Restorer ***/

// Easily restore an older version of a page
// Documentation at [[User:BrandonXLF/Restorer]]
// By [[User:BrandonXLF]]

$(function() {
	window.restorerSummary = window.restorerSummary || 'Restored revision $ID by [[Special:Contributions/$USER|$USER]] ([[User:BrandonXLF/Restorer|Restorer]])';

	function restore(user, revid) {
		$.post(mw.config.get('wgScriptPath') + '/api.php', {
			action: 'edit',
			pageid: mw.config.get('wgArticleId'),
			undo: mw.config.get('wgCurRevisionId'),
			undoafter: revid,
			summary: window.restorerSummary.replace(/\$ID/g, revid).replace(/\$USER/g, user),
			token: mw.user.tokens.get('csrfToken'),
			format: 'json'
		}).fail(function() {
			mw.notify('An error occured while restoring the revision.', {type: 'error'});
		}).done(function(result) {
			if (result.error) {
				mw.notify(result.error.info, {type: 'error'});
			} else {
				mw.notify('Restored revision sucessfully.');
				location.reload();
			}
		});
	}

	function addLink(item) {
		var revid = item.getAttribute('data-mw-revid'),
			user,
			links,
			ele,
			parent;

		if (revid != mw.config.get('wgCurRevisionId')) {
			user = item.getElementsByClassName('mw-userlink')[0].textContent.replace('User:', '');
			links = item.getElementsByClassName('mw-changeslist-links');
			links = links[links.length - 1];
			parent = document.createElement('span');
			ele = document.createElement('a');

			ele.addEventListener('click', function() {
				restore(user, revid);
			});

			ele.innerHTML = 'restore';
			parent.appendChild(ele);
			links.appendChild(parent);
		}
	}

	if (location.search.includes('action=history')) {
		var i,
			parents = document.querySelectorAll('li[data-mw-revid]');
		for (i = 0; i < parents.length; i++) {
			addLink(parents[i]);
		}
	}
});