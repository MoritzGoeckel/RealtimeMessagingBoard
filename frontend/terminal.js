class Terminal{
	constructor(inputFieldId, terminalFieldId){

		//Private / Local
		let ctrlDown = false;
		let inputIndex = 0;
		let inputhistoryIndex = 0;
		let inputHistory = [];
		let input = "";
		let showBlock = true;
		let moving = false;

		//Public / Global
		this.inputFieldId = inputFieldId;
		this.terminalFieldId = terminalFieldId;
		this.readLineCallback = undefined;
		this.listeners = [];
		this.output = "";

		let theBase = this;

		let submitInput = function(line)
		{
			if(line != "" && line != " ")
			{
				theBase.printLine(line, "white");
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
			$("#" + inputFieldId).html("<span class='white'>" + input.substr(0, input.length - inputIndex) + (showBlock ? "<span class='green'>&block;</span>" : "  ") + input.substr(input.length - inputIndex) + "</span>");
		}

		let processKey = function(key, ingoreCtrl = false)
		{
			if(key == "Backspace")
			{
				input = input.substr(0, input.length - inputIndex - 1) + input.substr(input.length - inputIndex);
				inputhistoryIndex = 0;
				
				if(inputIndex > input.length)
					inputIndex = input.length;
			}
			if(key == "Delete")
			{
				input = theBase.input.substr(0, input.length - inputIndex) + input.substr(input.length - inputIndex + 1);
				inputhistoryIndex = 0;
				
				if(inputIndex > input.length)
					inputIndex = input.length;
			}
			else if(key == "Enter")
			{
				if((inputHistory[0] == "" || inputHistory[0] == " "))
					inputHistory.shift();
				
				if(inputHistory[0] != input)
					inputHistory.unshift(input);
				
				inputhistoryIndex = 0;
				submitInput(input);
				input = "";
				
				inputIndex = 0;
			}
			else if(key == "ArrowUp")
			{
				if(inputhistoryIndex == 0 && inputHistory[0] != input)
					inputHistory.unshift(input);
				
				if(inputhistoryIndex < inputHistory.length - 1)
				{	
					inputhistoryIndex++;
					input = inputHistory[inputhistoryIndex];
				}
				
				inputIndex = 0;
			}
			else if(key == "ArrowDown")
			{
				if(inputhistoryIndex > 0)
				{	
					inputhistoryIndex--;
					input = inputHistory[inputhistoryIndex];
				}
				
				if(inputhistoryIndex == 0 && (inputHistory[0] == "" || inputHistory[0] == " "))
					inputHistory.shift();
				
				inputIndex = 0;
			}
			else if(key == "ArrowLeft")
			{
				if(inputIndex < input.length)
					inputIndex++;
			}
			else if(key == "ArrowRight")
			{
				if(inputIndex > 0)
					inputIndex--;
			}
			else if(key.length == 1 && (ctrlDown == false || ingoreCtrl))
			{
				inputhistoryIndex = 0;
				if(inputIndex == 0)
					input += key;
				else
					input = input.substr(0, theBase.length - inputIndex) + key + input.substr(input.length - inputIndex);
			}
			
			moving = true;
			
			renderInput();
		}

		$( "body" ).keydown(function(event) {
			processKey(event.key);
		});
		
		$("body").keydown(function(e) {
			if (e.keyCode == 17 || e.keyCode == 91) ctrlDown = true;
		}).keyup(function(e) {
			if (e.keyCode == 17 || e.keyCode == 91) ctrlDown = false;
		});
		
		$("body").on('paste', function(e) {
			var pasteData = e.originalEvent.clipboardData.getData('text');
			for(var i = 0; i < pasteData.length; i++)
				processKey(pasteData[i], true);
		});
		
		setInterval(function()
			{ 
				showBlock = (showBlock ? false : true);
				if(moving)
				{
					showBlock = true;
					moving = false;
				}
				
				renderInput(); 
			}, 500);
		
		console.log("Init finished");
	}

	//Print line and read the next one
	//Or just read a line
	readLine(outputOrCallback, cssClass, callback){

		if(arguments.length == 3)
		{
			this.readLineCallback = callback;
			this.printLine(outputOrCallback, cssClass);
		}
		else
		if(arguments.length == 1)
		{
			this.readLineCallback = outputOrCallback;
		}
		else
			throw new Error("Only 3 or 1 argument allowed");
	}

	//Prints a line out
	printLine(str, cssClass)
	{
		var start = "<span class='"+cssClass+"'>";
		var end = "</span>";
		
		var fontSize = $("#" + this.terminalFieldId).css('font-size');
		var lineHeight = Math.floor(parseInt(fontSize.replace('px','')) * 1.1);
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

	//Add general input listener
	addInputListener(func)
	{
		this.listeners.push(func);
		return this.listeners.length - 1;
	}

	//Remove a listener
	removeInputListener(listener)
	{
		this.listeners.splice(listener, 1);
	}
}