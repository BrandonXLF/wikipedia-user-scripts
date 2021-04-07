/*** Increment Parameters ***/

// Utility to easily increment numbered parameterex
// Documentation at [[User:BrandonXLF/IncrementParameters]]
// By [[User:BrandonXLF]]


$.when(mw.loader.using('oojs-ui'), $.ready).then(function() {
	$(mw.util.addPortletLink('p-tb', '#', 'Increment params')).click(function(e) {
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

		function IncrementParametersDialog(config) {
			IncrementParametersDialog.super.call(this, config);
		}

		OO.inheritClass(IncrementParametersDialog, OO.ui.ProcessDialog);

		IncrementParametersDialog.static.name = 'incrementparams';
		IncrementParametersDialog.static.title = 'Increment parameters';
		IncrementParametersDialog.static.actions = [
			{label: 'Close', flags: ['safe', 'close']},
			{label: 'Run', flags: ['primary', 'progressive'], action: 'run'}
		];

		IncrementParametersDialog.prototype.initialize = function() {
			IncrementParametersDialog.super.prototype.initialize.apply(this, arguments);

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

		IncrementParametersDialog.prototype.getActionProcess = function(action) {
			return new OO.ui.Process(function() {
				if (!action) return this.close();

				text.setValue(text.getValue().replace(regex[opts.getValue()], function(match, prefix, num, suffix) {
					if (
						parseInt(num, 10) < parseInt(min.getNumericValue() || 0, 10) ||
						parseInt(num, 10) > parseInt(max.getNumericValue() || Infinity, 10)
					) {
						return match;
					}
					return '|' + prefix + (parseInt(num, 10) + parseInt(increment.getNumericValue(), 10)).toString() + suffix + '=';
				}));
			}, this);
		};

		IncrementParametersDialog.prototype.getBodyHeight = function() {
			this.content.resetScroll();
			return this.content.$element.outerHeight(true);
		};

		var dialog = new IncrementParametersDialog({
			size: 'large'
		});

		OO.ui.getWindowManager().addWindows([dialog]);
		OO.ui.getWindowManager().openWindow(dialog);

		text.on('change', function() {
			dialog.updateSize();
		});
	});
});