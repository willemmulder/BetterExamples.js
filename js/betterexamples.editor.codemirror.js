/**
* @author Willem Mulder
* @license CC-BYSA 3.0 Unported
*/

BetterExamples.editors.codemirror = function(inputelm) {
	// Get class from input class, and store it for setting on the CodeMirror instance
	var classes = $(inputelm).first().attr("class").split(" ");
	//var height = $(inputelm).height();
	var editor = CodeMirror.fromTextArea(
		$(inputelm).get(0), {
			lineNumbers: true,
			matchBrackets: true,
			extraKeys: {"Enter": "newlineAndIndentContinueComment"}
		}
	);
	editor.setValue(inputelm.html());
	for (var index in classes) {
		if (classes.hasOwnProperty(index)) {
			$(editor.getWrapperElement()).addClass(classes[index]);
		}
	}
	
	editor.setSize(null, "auto");

	var facade = { 
		clear : function() {
			editor.setValue("");
		},
		getInputWrapper : function() {
			return $(editor.getWrapperElement()).find(".CodeMirror-lines > div:first");
		},
		getEventWrapper : function() {
			return $(editor.getWrapperElement())
			.add( $(editor.getWrapperElement()).find(".CodeMirror-cursor") );
		},
		getValue : function() {
			return editor.getValue();
		},
		setValue : function(value) {
			return editor.setValue(value);
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