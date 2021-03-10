$(function() {
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:BrandonXLF/CitationStyleMarker.css&action=raw&ctype=text/css', 'text/css');
	if (window.CSMarkerMode != 'always') {
		var portletItem = mw.util.addPortletLink('p-tb', '#', 'Hide CS marker'),
			classes = ['cs1', 'cs2', 'csvan', 'calsa'],
			typeCount = classes.reduce(function(acc, cur) {
				return acc + !!document.getElementsByClassName(cur).length;
			}, 0);

		if (!portletItem) return;

		var portlet = portletItem.getElementsByTagName('a')[0];

		portlet.addEventListener('click', function(e) {
			var enabled = document.body.classList.contains('nocsmarker');
			e.preventDefault();
			document.body.classList[enabled ? 'remove' : 'add']('nocsmarker');
			portlet.innerText = enabled ? 'Hide CS maker' : 'Show CS marker';
		});

		if (window.CSMarkerMode == 'disabled' || window.CSMarkerMode == 'both' && typeCount < 2) {
			document.body.classList.add('nocsmarker');
			portlet.innerText = 'Show CS marker';
		}
	}
});