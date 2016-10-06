$().ready(function(){
	
	$( "body" ).keydown(function(event) {
		//console.log(event);
		processKey(event.key);
	});
	
	console.log("Init finished");
	
});

inputhistoryIndex = 0;
inputHistory = [];
input = "";
function processKey(key)
{
	if(key == "Backspace")
	{
		input = input.substr(0, input.length - 1);
		inputhistoryIndex = 0;
	}
	else if(key == "Enter")
	{
		if(inputHistory[0] != input)
			inputHistory.unshift(input);
		
		inputhistoryIndex = 0;
		submitInput(input);
		input = "";
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
	}
	else
	{
		historyIndex = 0;
		input += key;
	}
	
	console.log(inputhistoryIndex);
	console.log(inputHistory);
	
	renderInput();
}

function renderInput()
{
	$("#inputLine").html(input + "&block;");
}

function submitInput(line)
{
	//
}