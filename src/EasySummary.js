/*** Easy Summary ***/

// Easily use the last summary you used or load and save a summary
// Documentation at [[User:BrandonXLF/EasySummary]]
// By [[User:BrandonXLF]]

$(function() {
	function addLinks(label, field) {
		function updateField(storage) {
			return () => {
				var summary = $.trim(field.val()) || '';
				field.val((summary && summary + ' ' || '') + mw.storage.get(storage));
			};
		}
		function saveField(storage) {
			return () => {
				mw.storage.set(storage, field.val());
			};
		}
		function makeLink(object, title, onClick) {
			return $('<a>').text(object).attr('title', title).on('click', (e) => {e.preventDefault(); onClick();});
		}
		if (! $('#easySummary-container')[0]) {
			var $last = makeLink('Last', 'Use the last typed edit summary', updateField('easySummary-last'));
			var $load = makeLink('Load', 'Load the saved edit summary', updateField('easySummary-saved'));
			var $save = makeLink('Save', 'Save an edit summary for later', saveField('easySummary-saved'));
			label.append($('<span>').attr("id", "easySummary-container").append(' ( ', $last, ' | ', $load, ' | ', $save, ' )'));
			field.on('change', saveField('easySummary-last'));
		}
	}
	addLinks($("[for='wpSummary']"), $('#wpSummary'));
	mw.hook('ve.saveDialog.stateChanged').add(function(){
		addLinks(ve.init.target.saveDialog.$editSummaryLabel, ve.init.target.saveDialog.editSummaryInput.$input);
	});
});