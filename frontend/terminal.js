class Terminal{
	constructor(inputFieldId, terminalFieldId){

		this.inputFieldId = inputFieldId;
		this.terminalFieldId = terminalFieldId;

		this.ctrlDown = false;
		this.readLineCallback = undefined;

		this.inputIndex = 0;
		this.inputhistoryIndex = 0;
		this.inputHistory = [];
		this.input = "";
		this.showBlock = true;
		this.moving = false;
		this.listeners = [];
		this.output = "";

		let theBase = this;

		let submitInput = function(line)
		{
			if(line != "" && line != " ")
			{
				theBase.printLine("-> " + line, "white");
				for(var i = 0; i < theBase.listeners.length; i++)
					theBase.listeners[i](line);
				
				if(theBase.readLineCallback != undefined)
				{
					theBase.readLineCallback(line);
					theBase.readLineCallback = undefined;
				}
			}
		}

		let renderInput = function()
		{
			$("#" + theBase.inputFieldId).html("<span class='white'>" + theBase.input.substr(0, theBase.input.length - theBase.inputIndex) + (theBase.showBlock ? "<span class='green'>&block;</span>" : "  ") + theBase.input.substr(theBase.input.length - theBase.inputIndex) + "</span>");
		}

		let processKey = function(key, ingoreCtrl = false)
		{
			if(key == "Backspace")
			{
				theBase.input = theBase.input.substr(0, theBase.input.length - theBase.inputIndex - 1) + theBase.input.substr(theBase.input.length - theBase.inputIndex);
				theBase.inputhistoryIndex = 0;
				
				if(theBase.inputIndex > theBase.input.length)
					theBase.inputIndex = theBase.input.length;
			}
			if(key == "Delete")
			{
				theBase.input = theBase.input.substr(0, theBase.input.length - theBase.inputIndex) + theBase.input.substr(theBase.input.length - theBase.inputIndex + 1);
				theBase.inputhistoryIndex = 0;
				
				if(theBase.inputIndex > theBase.input.length)
					theBase.inputIndex = theBase.input.length;
			}
			else if(key == "Enter")
			{
				if((theBase.inputHistory[0] == "" || theBase.inputHistory[0] == " "))
					theBase.inputHistory.shift();
				
				if(theBase.inputHistory[0] != theBase.input)
					theBase.inputHistory.unshift(theBase.input);
				
				theBase.inputhistoryIndex = 0;
				submitInput(theBase.input);
				theBase.input = "";
				
				theBase.inputIndex = 0;
			}
			else if(key == "ArrowUp")
			{
				if(theBase.inputhistoryIndex == 0 && theBase.inputHistory[0] != input)
					theBase.inputHistory.unshift(theBase.input);
				
				if(theBase.inputhistoryIndex < theBase.inputHistory.length - 1)
				{	
					theBase.inputhistoryIndex++;
					theBase.input = theBase.inputHistory[theBase.inputhistoryIndex];
				}
				
				theBase.inputIndex = 0;
			}
			else if(key == "ArrowDown")
			{
				if(theBase.inputhistoryIndex > 0)
				{	
					theBase.inputhistoryIndex--;
					theBase.input = theBase.inputHistory[inputhistoryIndex];
				}
				
				if(theBase.inputhistoryIndex == 0 && (theBase.inputHistory[0] == "" || theBase.inputHistory[0] == " "))
					theBase.inputHistory.shift();
				
				theBase.inputIndex = 0;
			}
			else if(key == "ArrowLeft")
			{
				if(theBase.inputIndex < theBase.input.length)
					theBase.inputIndex++;
			}
			else if(key == "ArrowRight")
			{
				if(theBase.inputIndex > 0)
					theBase.inputIndex--;
			}
			else if(key.length == 1 && (theBase.ctrlDown == false || theBase.ingoreCtrl))
			{
				theBase.historyIndex = 0;
				if(theBase.inputIndex == 0)
					theBase.input += key;
				else
					theBase.input = theBase.input.substr(0, theBase.input.length - theBase.inputIndex) + key + theBase.input.substr(theBase.input.length - theBase.inputIndex);
			}
			
			theBase.moving = true;
			
			renderInput();
		}

		$( "body" ).keydown(function(event) {
			processKey(event.key);
		});
		
		$("body").keydown(function(e) {
			if (e.keyCode == 17 || e.keyCode == 91) theBase.ctrlDown = true;
		}).keyup(function(e) {
			if (e.keyCode == 17 || e.keyCode == 91) theBase.ctrlDown = false;
		});
		
		$("body").on('paste', function(e) {
			var pasteData = e.originalEvent.clipboardData.getData('text');
			for(var i = 0; i < pasteData.length; i++)
				processKey(pasteData[i], true);
		});
		
		setInterval(function()
			{ 
				theBase.showBlock = (theBase.showBlock ? false : true);
				if(theBase.moving)
				{
					theBase.showBlock = true;
					theBase.moving = false;
				}
				
				renderInput(); 
			}, 500);
		
		console.log("Init finished");
	}

	readLine(output, cssClass, callback){
		this.readLineCallback = callback;
		this.printLine(output, cssClass);
	}

	printLine(str, cssClass)
	{
		var start = "<span class='"+cssClass+"'>";
		var end = "</span>";
		
		var fontSize = $("#" + this.terminalFieldId).css('font-size');
		var lineHeight = Math.floor(parseInt(fontSize.replace('px','')) * 1.5);
		var maxLines = Math.floor($("body").height() / lineHeight);

		this.output += start + str + end + "<br />";
		var outputLineArray = this.output.split('<br />');
		if(outputLineArray.length-1 > maxLines)
		{
			this.output = "";
			for(var i = 1; i < outputLineArray.length; i++)
				if(outputLineArray[i] != "" && outputLineArray[i] != " ")
					this.output += outputLineArray[i] + "<br />";
		}

		$("#" + this.terminalFieldId).html(this.output);
	}

	addInputListener(func)
	{
		this.listeners.push(func);
		return this.listeners.length - 1;
	}

	removeInputListener(listener)
	{
		this.listeners.splice(listener, 1);
	}
}