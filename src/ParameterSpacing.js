/*** Parameter spacing ***/

// Utility to easily manager parameter spacing around the equal sign
// Documentation at [[en:w:User:BrandonXLF/ParameterSpacing]]
// By [[en:w:User:BrandonXLF]]

$.when(mw.loader.using('oojs-ui'), $.ready).then(function() {
	$(mw.util.addPortletLink('p-tb', '#', 'Parameter spacing')).click(function(e) {
		var extra = new OO.ui.CheckboxInputWidget({
				selected: true
			}),
			pre = new OO.ui.NumberInputWidget({
				input: {
					value: 1
				},

			}),
			post = new OO.ui.NumberInputWidget({
				input: {
					value: 1,
					min: 0
				},

			}),
			expand = new OO.ui.MultilineTextInputWidget({
				multiline: true,
				autosize: true,
				rows: 10,
				maxRows: 30
			});

		e.preventDefault();
		expand.$element.css({fontFamily: 'monospace, monospace'});

		function ParameterSpacingDialog(config) {
			ParameterSpacingDialog.super.call(this, config);
		}

		OO.inheritClass(ParameterSpacingDialog, OO.ui.ProcessDialog);

		ParameterSpacingDialog.static.name = 'paramspacing';
		ParameterSpacingDialog.static.title = 'Parameter spacing';
		ParameterSpacingDialog.static.actions = [
			{label: 'Close', flags: ['safe', 'close']},
			{label: 'Run', flags: ['primary', 'progressive'], action: 'run'}
		];

		ParameterSpacingDialog.prototype.initialize = function() {
			ParameterSpacingDialog.super.prototype.initialize.apply(this, arguments);

			this.content = new OO.ui.PanelLayout({
				padded: true,
				expanded: false
			});

			this.content.$element.append(
				(new OO.ui.FieldLayout(extra, {label: 'Equalize equal signs', align: 'left'})).$element,
				(new OO.ui.FieldLayout(pre, {label: 'Spaces before equal sign', align: 'left'})).$element,
				(new OO.ui.FieldLayout(post, {label: 'Spaces after equal sign', align: 'left'})).$element,
				(new OO.ui.FieldLayout(expand, {align: 'top'})).$element
			);

			this.$body.append(this.content.$element);
		};

		ParameterSpacingDialog.prototype.getActionProcess = function(action) {
			return new OO.ui.Process(function() {
				if (!action) return this.close();

				var val = expand.getValue(),
					max = 0;

				val.replace(/(.*?\|.*?)( *)(=.*)( *)/g, function(m, m1) {
					if (m1.length > max) max = m1.length;
					return m;
				});

				val = val.replace(/(.*?\|.*?)( *)=( *)(.*)/g, function(m, m1, m2, m3, m4) {
					return m1 +
					' '.repeat(Math.max(0, (extra.isSelected() ? max - m1.length : 0) + pre.getNumericValue())) +
					'=' +
					' '.repeat(Math.max(0, post.getNumericValue())) +
					m4;
				});

				expand.setValue(val);
			}, this);
		};

		ParameterSpacingDialog.prototype.getBodyHeight = function() {
			this.content.resetScroll();
			return this.content.$element.outerHeight(true);
		};

		var dialog = new ParameterSpacingDialog({
			size: 'large'
		});

		OO.ui.getWindowManager().addWindows([dialog]);
		OO.ui.getWindowManager().openWindow(dialog);

		expand.on('change', function() {
			dialog.updateSize();
		});
	});
});