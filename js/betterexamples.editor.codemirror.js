/**
* @author Willem Mulder
* @license CC-BYSA 3.0 Unported
*/

BetterExamples.editors.codemirror = function(inputelm) {
	//var height = $(inputelm).height();
	var editor = CodeMirror.fromTextArea(
		$(inputelm).get(0), {
			lineNumbers: true,
			matchBrackets: true,
			extraKeys: {"Enter": "newlineAndIndentContinueComment"}
		}
	);
	editor.setValue(inputelm.html());
	$(editor.getWrapperElement()).addClass("input");
	editor.setSize(null, "auto");

	var facade = { 
		getInputWrapper : function() {
			return $(editor.getWrapperElement()).find(".CodeMirror-lines > div:first");
		},
		getEventWrapper : function() {
			return $(editor.getWrapperElement()).closest(".CodeMirror.input")
			.add( $(editor.getWrapperElement()).find(".CodeMirror-cursor") );
		},
		getValue : function() {
			return editor.getValue();
		},
		getValueLength : function() {
			return editor.getValue().length;
		},
		getLineHeight : function() {
			//return $(editor.getInputField()).find(".CodeMirror-lines").height() / editor.lineCount();
			return editor.defaultTextHeight();
		},
		getLinesOffsetTop : function() {
			var wrapperOffsetTop = $(editor.getWrapperElement()).offset().top;
			var absoluteLinesOffsetTop = $(editor.getWrapperElement()).find(".CodeMirror-lines > div").first().offset().top;
			return absoluteLinesOffsetTop - wrapperOffsetTop;
		},
		fitToScrollHeight : function() { 
			// Happens automatically, because height is set to "auto"
		},
		isClearingWithFade : function() {
			return true;
		},
		prependContent : function(content) {
			$(editor.getWrapperElement()).find(".CodeMirror-lines  > div:first").prepend($(content).css("z-index", "-1"));
		}
	};

	return facade;
}