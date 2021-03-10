/*** Test JS and CSS ***/

// Adds a button to the code editor to run the
// CSS and JavaScript code in the editor
// Documentation at [[User:BrandonXLF/TestCode]]
// By [[User:BrandonXLF]]

$(function() {
	var config = mw.config.get(['wgAction', 'wgPageContentModel']);
	if (config.wgAction != 'edit' || ['css', 'javascript'].indexOf(config.wgPageContentModel) == -1) return;

	var run = new OO.ui.ButtonWidget({
		label: 'Run'
	});

	run.on('click', function() {
		var ele = document.getElementById('testcodeelement');
		if (ele) ele.parentNode.removeChild(ele);
		ele = document.createElement(config.wgPageContentModel == 'css' ? 'style' : 'script');
		ele.id = 'testcodeelement';
		ele.innerHTML = $('#wpTextbox1').textSelection('getContents');
		document.head.appendChild(ele);
	});

	$('#wpDiffWidget').after(run.$element);
});