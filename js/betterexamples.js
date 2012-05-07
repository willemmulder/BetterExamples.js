/**
* @author Willem Mulder
* @license CC-BYSA 3.0 Unported
*/

$(function() {
	$("body").append("<style>.betterExampleNoSetHeight { height: auto !important; }</style>");
});

// Name = sandbox.js?
BetterExamples = {
	pointers : {},
	documentLineNumberOfFirstInputLine : {}
};
BetterExample = function(inputelm, outputelm, options) {

	var inputelm = $(inputelm);
	var outputelm = $(outputelm);
	// use wrap="off" because white-space: nowrap does not function correctly in IE
	var inputInnerElm = $("<textarea style='outline: none; z-index:10; position: relative; width: 100%; height: 95%; background: rgba(255,255,255,0); border: none; text-decoration: none; overflow: hidden;' wrap='off'></textarea>");
	inputInnerElm.html(inputelm.html());
	inputelm.html(inputInnerElm);
	inputelm.on("keyup", function(event) { 
		var firstHeight = inputelm.find("textarea").height();
		inputelm.find("textarea").css("height", inputelm.find("textarea").get(0).scrollHeight + "px"); 
		// If textarea was expanded, scroll to bottom of parent element
		if (inputelm.find("textarea").height() > firstHeight) {
			inputelm.parent().animate({
				scrollTop: inputelm.find("textarea").height()
			}, 0);
		}
		facade.clearOutput(true); 
	});
	
	var functionBackups = [];
	
	var inputText = inputelm.html();
	inputelm.addClass("betterExampleNoSetHeight");
	inputelm.html("one line");
	var inputLineHeight = inputelm.innerHeight();
	inputelm.html(inputText);
	inputelm.removeClass("betterExampleNoSetHeight");
	
	function visit(node, visitFunction, parentsList) {
		var parents = (typeof parentsList === 'undefined') ? [] : parentsList;
	
		visitFunction = visitFunction || false;
		if (visitFunction && visitFunction(node,parentsList) == false) {
			return;
		}
		for (key in node) {
			if (node.hasOwnProperty(key)) {
				child = node[key];
				path = [ node ];
				path.push(parents);
				if (typeof child === 'object' && child !== null) {
					visit(child, visitFunction, path);
				}
			}
		}
	};
	
	function restoreFunctions() {
		// Restore the altered functions
		for(functionID in functionBackups) {
			window[functionID] = functionBackups[functionID];
			if (functionID == "console.log") {
				// TODO make this generic
				console.log = functionBackups[functionID];
			}
		}
	}
	
	function positionMessages() {
		// Loop over the error messages and show as much of their info as possible (i.e. without overlapping other messages)
		outputelm.find(".betterExamplesLine").each(function() {
			var next = $(this).nextAll(".betterExamplesLine");
			if (next.length > 0) {
				var space = $(next).attr("line") - $(this).attr("line");
				// See how much height the element would take
				$(this).css("height", "auto");
				// Now restrict the height if the height=auto would take up more height than there is space
				if ($(this).height() > (space * inputLineHeight)) {
					$(this).css("height", (space * inputLineHeight) + "px");
				}
			} else {
				$(this).css("height", "auto"); // unlimited space
			}
		});
	}
	
	var facade = {
		"run" : function() {
			// Set alert or log functions to redirect to the output window
			var instance = this;
			functionBackups["alert"] = window.alert;
			window.alert = function(output) { 
				instance.log(output);
			}
			if (typeof(console) != "undefined" && typeof(console.log) != "undefined") {
				functionBackups["console.log"] = console.log;
				console.log = alert;
			}
			// Set error function to redirect to 'alert'
			functionBackups["onerror"] = window.onerror;
			window.onerror = function (message, url, lineNo) {
				var lineIndex = message.indexOf("Line");
				if (lineIndex > -1) {
					// Syntax error
					var until = message.indexOf(":",lineIndex);
					lineNo = message.slice(lineIndex+4, until);
					message = message.slice(until+2);
				} else {
					// Runtime error
					if (message.indexOf("Uncaught") === 0) {
						message = message.slice(message.indexOf(":", 8)+2);
					}
					lineNo = BetterExamples.pointers['ID'];
				}
				// Firefox : if (message.indexOf("Line") === 0) {
				// Webkit : if (message.indexOf("Uncaught Error: Line") === 0) {
				// Opera : if (message.indexOf("Uncaught exception: Error: Line") === 0) {
				BetterExamples.pointers['ID'] = lineNo;
				if (lineIndex == -1) {
					facade.log(message, "Runtime error");
					// Restore functions and position messages. There will be no extra messages anyway, since a runtime error stops execution.
					restoreFunctions();
					positionMessages();
				} else {
					facade.log(message, "Syntax error");
				}
				return true; // Error was handled
			}
			// Remove output
			this.clearOutput();
			// Run the input and render the output
			var input = inputelm.find("textarea").val();
			// find which lines contain alert or log commands
			var analysis = esprima.parse(input,{ range: true, loc: true });
			var locations = [];
			// Set pointers for every VariableDeclaration or ExpressionStatement
			visit(analysis,function(node, parentsList) {
				if (node.type === "VariableDeclaration" || node.type === "ExpressionStatement") {
					locations.push({range: node.range, location: node.loc});
				}
			});
			// Insert pointer function at the specified locations
			var charactersInserted = 0;
			for(id in locations) {
				var range = locations[id].range;
				var location = locations[id].location;
				// TODO: proper element ID
				var func = "BetterExamples.pointers['ID'] = "+location.start.line+";";
				var length = func.length;
				var firstPart = input.slice(0,range[0]+charactersInserted);
				var secondPart = input.slice(range[0]+charactersInserted);
				input = firstPart + func + secondPart;
				charactersInserted += length;
			}
			eval(input);
			// If a runtime-error has occurred in the evaluated code, we won't get here so the below will not be executed. The window.onerror will ensure that it will happen anyways.
			restoreFunctions();
			positionMessages();
		},
		"clear" : function() { 
			inputInnerElm.html("");
			this.clearOutput();
		},
		"clearOutput" : function(withFade) { 
			if (withFade) {
				inputelm.find(".betterExamplesLine").fadeOut(function() { inputelm.find(".betterExamplesLine").remove(); });
				outputelm.find("*").fadeOut(function() { outputelm.html(""); });
				if (outputelm.find("*").size() == 0) {
					outputelm.html("");
				}
			} else {
				inputelm.find(".betterExamplesLine").remove();
				outputelm.html("");
			}
		},
		"log" : function(obj,type) {
			var type = type || typeof(obj);
			type = type.charAt(0).toUpperCase() + type.slice(1); // Capitalize first character
			var extraStyle = "";
			if (type.indexOf("error")>-1) { extraStyle = "background: #CC1919; color: #fff;" }
			var line = BetterExamples.pointers['ID'];
			var start = "<div class='betterExamplesLine' line='" + line + "' style='background: #eef; position:absolute; left: 0px; top:" + (inputLineHeight*(line-1)) + "px; height: " + inputLineHeight + "px; display: block; width: 100%; z-index: 1; overflow: hidden;' onMouseOver='$(this).attr(\"backupHeight\",$(this).css(\"height\")); $(this).css(\"height\",\"auto\").css(\"z-index\",\"100\")' onMouseOut='$(this).css(\"height\",$(this).attr(\"backupHeight\")).css(\"z-index\",\"1\")'>";
			var output = "<div style='width: 130px; background: #dde; "+ extraStyle + " display: inline-block;'>" + type + "</div> ";
			output += JSON.stringify(obj, null, 4);
			var end = "</div>";
			outputelm.append(start + output + end);
			inputelm.prepend(start+"&nbsp"+end);
		}
	};
	return facade;
}