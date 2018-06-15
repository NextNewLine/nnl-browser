const RemoteControlServer = require("./remoteControl/RemoteControlServer");

module.exports = function(eventArgs) {

	const remoteControlServerArgs = {
		eventComplete: handleEventComplete
	};

	if (eventArgs && eventArgs.args && eventArgs.args.remoteUrl) {
		remoteControlServerArgs.remoteUrl = eventArgs.args.remoteUrl;
	}

	const remoteControlServer = new RemoteControlServer(remoteControlServerArgs);

	let currentUrl;
	// Wait for connection to be established
	function create(args) {

		return new Promise(async function(resolve, reject) {

			await remoteControlServer.waitUntilReady();
			console.log("Created");
			resolve();

		});
	}

	function open(url) {
		return new Promise(async function(resolve, reject) {
			triggerEvent("open", {
				url: url
			}, resolve);
		});
	}

	function evaluateJavaScript(script) {
		return new Promise(async function(resolve, reject) {
			if (remoteControlServer.currentEvent()) {
				reject("Already waiting for an event to complete");
			}

			triggerEvent("script", {
				script: script
			}, resolve);
		});
	}

	function screenshot(name) {
		console.log("Error: unsupported function");
		return new Promise(async function(resolve, reject) {
			console.log("Unable to take a screenshot");
			reject();
		});
	}

	function property(name) {
		return new Promise(async function(resolve, reject) {
			if (name == "url") {
				return resolve(currentUrl);
			}
			reject("No property found with the name '" + name + "'");
		});

	}

	function authentication(username, password) {
		console.log("Error: unsupported function");
		return new Promise(async function(resolve, reject) {
			reject();
		});

	}

	function triggerEvent(type, body, callback) {

		if (type == "open") {
			currentUrl = body.url;
			onNavigationRequested(body.url);
		}

		remoteControlServer.sendEvent(type, body).then((results) => {
			callback(results);
		});

	}

	function handleEventComplete(event, results) {

		if (event.type == "open") {
			onLoadFinished(); // Bug here as we're calling this before we reloaded the page
		}
		event.callback(results);
	}

	function onNavigationRequested(url) {
		if (eventArgs.onNavigationRequested) {
			eventArgs.onNavigationRequested(url);
		}

	}

	function onLoadFinished() {
		if (eventArgs.onLoadFinished) {
			eventArgs.onLoadFinished();
		}
	}

	function onResourceReceived() {
		const resource = {
			stage: "end",
			url: "foo.js",
			status: 200
		};
		if (eventArgs.onResourceReceived) {
			eventArgs.onResourceReceived(resource);
		}

	}

	return {
		create,
		open,
		property,
		evaluateJavaScript,
		screenshot,
		authentication
	}
};