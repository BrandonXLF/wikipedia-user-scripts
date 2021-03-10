/*** Increment Parameters ***/

// Utility to easily increment numbered parameterex
// Documentation at [[User:BrandonXLF/IncrementParameters]]
// By [[User:BrandonXLF]]


$.when(mw.loader.using('oojs-ui'), $.ready).then(function() {
	$(mw.util.addPortletLink('p-tb', '#', 'Increment parameters')).click(function(e) {
		var regex = {
				all: new RegExp('\\|(\\s*[^ =|_-]?[^ =|]*?\\s*)([1-9]\\d*)(\\s*[^ =|]*?[^ =|]?\\s*)=', 'g'),
				suffix: new RegExp('\\|(\\s*(?:header|label|data|rowclass|class)*?\\s*)([1-9]\\d*)(\\s*[^ =|]*?[^ =|]?\\s*)=', 'g'),
				infobox: new RegExp('\\|(\\s*(?:header|label|data|rowclass|class)*?\\s*)([1-9]\\d*)(\\s*)=', 'g')
			},
			opts = new OO.ui.RadioSelectInputWidget({
				value: 'all',
				options: [
					{
						data: 'all',
						label: 'Increment ALL incremental parameters.'
					},
					{
						data: 'suffix',
						label: 'Only increment header, label, data, rowclass, and class (with or without suffix).'
					},
					{
						data: 'infobox',
						label: 'Only increment header, label, data, rowclass, and class (without suffix).'
					}
				]
			}),
			increment = new OO.ui.NumberInputWidget({
				min: 0,
				step: 1,
				value: 1
			}),
			min = new OO.ui.NumberInputWidget({
				min: 0,
				step: 1,
				placeholder: '0'
			}),
			max = new OO.ui.NumberInputWidget({
				min: 0,
				step: 1,
				placeholder: 'Infinity'
			}),
			text = new OO.ui.MultilineTextInputWidget({
				rows: 10,
				maxRows: 999999,
				autosize: true,
				placeholder: 'Input'
			});

		e.preventDefault();
		text.$element.css({fontFamily: 'monospace, monospace'});
		function ProcessDialog(config) {
			ProcessDialog.super.call(this, config);
		}

		OO.inheritClass(ProcessDialog, OO.ui.ProcessDialog);

		ProcessDialog.static.name = 'incrementparams';
		ProcessDialog.static.title = 'Increment parameters';
		ProcessDialog.static.actions = [
			{
				action: 'run',
				label: 'Run',
				flags: ['primary', 'progressive']
			},
			{
				label: 'Cancel',
				flags: 'safe'
			}
		];
		ProcessDialog.prototype.getBodyHeight = function() {
			return this.panel.$element.outerHeight(true);
		};

		ProcessDialog.prototype.initialize = function() {
			ProcessDialog.super.prototype.initialize.apply(this, arguments);

			this.content = new OO.ui.PanelLayout({
				padded: true,
				expanded: false
			});

			this.content.$element.append(
				(new OO.ui.FieldLayout(opts, {align: 'top'})).$element,
				(new OO.ui.FieldLayout(increment, {label: 'Increment by', align: 'left'})).$element,
				(new OO.ui.FieldLayout(min, {label: 'Min range', align: 'left'})).$element,
				(new OO.ui.FieldLayout(max, {label: 'Max range', align: 'left'})).$element,
				(new OO.ui.FieldLayout(text, {align: 'top'})).$element
			);

			this.$body.append(this.content.$element);
		};

		ProcessDialog.prototype.getActionProcess = function(action) {
			var dialog = this;

			if (action) {
				return new OO.ui.Process(function() {
					text.setValue(text.getValue().replace(regex[opts.getValue()], function(match, prefix, num, suffix) {
						if (
							parseInt(num, 10) < parseInt(min.getNumericValue() || 0, 10) ||
							parseInt(num, 10) > parseInt(max.getNumericValue() || Infinity, 10)
						) {
							return match;
						}
						return '|' + prefix + (parseInt(num, 10) + parseInt(increment.getNumericValue(), 10)).toString() + suffix + '=';
					}));
				});
			}

			return new OO.ui.Process(function() {
				dialog.close();
			});
		};

		ProcessDialog.prototype.getBodyHeight = function() {
			this.content.resetScroll();
			return this.content.$element.outerHeight(true);
		};

		var windowManager = new OO.ui.WindowManager(),
			processDialog = new ProcessDialog({
				size: 'large'
			});

		$(document.body).append(windowManager.$element);

		windowManager.addWindows([processDialog]);
		windowManager.openWindow(processDialog);

		text.on('change', function() {
			processDialog.updateSize();
		});
	});
});