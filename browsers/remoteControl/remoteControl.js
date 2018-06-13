function checkForEvents() {
	console.log("Checking for new events");
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'http://localhost:1414/nextEvent');
	xhr.onload = function() {
		var event = JSON.parse(xhr.responseText);
		if (event) {
			handleEvent(JSON.parse(xhr.responseText));
		}
		setTimeout(checkForEvents, 250);
	};
	xhr.send();
}

function completeEvent(id, results, callback) {
	console.log("Completed event", id, results);

	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'http://localhost:1414/completedEvent', true);
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
			if (callback) {
				callback();
			}
		}
	}
	console.log("results", results);
	xhr.send("results=" + JSON.stringify(results));
}

function handleEvent(event) {
	console.log("Recieved event", event);

	if (event.type == "open") {
		completeEvent(event.id, true, function() {
			window.location = event.body.url;
		});
	}

	if (event.type == "script") {
		var results = eval("(" + event.body.script + ")")();
		completeEvent(event.id, results);
	}
}

setTimeout(checkForEvents, 250);