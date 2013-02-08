/**
* @author Willem Mulder
* @license CC-BYSA 3.0 Unported
*/

BetterExamples.editors.default = function(inputelm) {
	// use wrap="off" because white-space: nowrap does not function correctly in IE
	var inputInnerElm = $("<textarea style='outline: none; z-index:10; position: relative; width: 100%; height: 95%; background: rgba(255,255,255,0); border: none; text-decoration: none; overflow-y: hidden; overflow-x: auto;' wrap='off'></textarea>");
	// Save originalTextAreaContent for restore
	originalTextAreaContent = inputelm.html();
	inputInnerElm.html(originalTextAreaContent);
	inputelm.html(inputInnerElm);

	var facade = { 
		getInputWrapper : function() {
			return inputelm;
		},
		getEventWrapper : function() {
			return inputelm;
		},
		getValue : function() {
			return inputelm.find("textarea").val();
		},
		getValueLength : function() {
			return inputelm.find("textarea").val().length;
		},
		getLineHeight : function() {
			var checkelm = inputelm.find("textarea");
			var inputText = checkelm.html();
			checkelm.addClass("betterExampleNoSetHeight");
			// We need multiple lines in the textarea in order to push the scrollHeight above the 'auto' height of a standard textarea
			// as to obtain a scrollHeight that is determined by the height of the lines instead of the 'auto' height
			checkelm.html("line 1\r\nline 2\r\nline 3\r\nline 4\r\nline 5\r\nline 6\r\nline 7\r\nline 8\r\nline 9\r\nline 10");
			var inputLineHeight = checkelm.get(0).scrollHeight / 10;
			if (!inputLineHeight) {
				// Element is (probably) hidden. Show the element, and all of its parents, and afterwards hide them again
				checkelm.parents().addClass("betterExampleVisible");
				inputLineHeight = checkelm.get(0).scrollHeight / 10;
				checkelm.html(inputText);
				fitToScrollHeight();
				checkelm.parents().removeClass("betterExampleVisible");
			} else {
				checkelm.html(inputText);
			}
			checkelm.removeClass("betterExampleNoSetHeight");
			return inputLineHeight;
		},
		getLinesOffsetTop : function() {
			return 0;
		},
		fitToScrollHeight : function(scrollToBottom) {
			console.log("fitting!");
			var firstHeight = inputelm.find("textarea").height();
			inputelm.find("textarea").css("height", inputelm.find("textarea").get(0).scrollHeight + "px"); 
			// If the typed text caused our textarea to expand, scroll to bottom of parent element
			if (scrollToBottom && inputelm.find("textarea").height() > firstHeight) {
				inputelm.parent().animate({
					scrollTop: inputelm.find("textarea").height()
				}, 0);
			}
		},
		isClearingWithFade : function() {
			return true;
		},
		prependContent : function(content) {
			facade.getInputWrapper().prepend($(content));
		}
	};

	return facade;
}