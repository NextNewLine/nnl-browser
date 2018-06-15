const phantom = require('phantom');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

module.exports = function(eventArgs) {

	let remoteUrl = "http://localhost:1414";

	if (eventArgs && eventArgs.args && eventArgs.args.remoteUrl) {
		remoteUrl = eventArgs.args.remoteUrl;
	}

	const app = express();
	app.set('view engine', 'ejs');
	app.set('views', path.join(__dirname, '/remoteControl/views'));

	app.use(bodyParser.urlencoded({
		extended: false
	}))
	app.use(bodyParser.json());

	app.use(function(request, response, next) {
		response.header("Access-Control-Allow-Origin", "*");
		response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	let fileLoaded = false;
	app.get('/remoteControl.js', function(req, res) {
		const remoteControlArgs = {
			remoteUrl: remoteUrl
		};

		res.render('remoteControljs', remoteControlArgs);
		fileLoaded = true;
	});

	let nextEvent = false;
	app.get('/nextEvent', function(req, res) {
		if (!nextEvent) {
			return res.json(false);
		}
		console.log("Next event requested", nextEvent.id);
		res.json(nextEvent);
	});

	app.post('/completedEvent', function(req, res) {

		const results = JSON.parse(req.body.results);
		handleEventComplete(nextEvent, results);
		nextEvent = false;
		res.sendStatus(200);
	});

	let serverListening = false;
	app.listen(1414, () => {
		serverListening = true;
		console.log('Remote control server now listening on port 1414!');
	});

	let currentUrl;
	// Wait for connection to be established
	function create(args) {

		return new Promise(async function(resolve, reject) {

			await waitUntilReady();
			console.log("Created");
			resolve();

		});
	}

	function waitUntilReady() {
		return new Promise(function(resolve) {
			const interval = setInterval(function() {

				console.log("Waiting for connection");

				if (serverListening && fileLoaded) {
					console.log("Connected!");
					clearInterval(interval);
					return resolve();
				}

			}, 1000);

		})
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
			if (nextEvent) {
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

		nextEvent = {
			type: type,
			body: body,
			callback: callback,
			id: new Date().getTime()
		};

		if (type == "open") {
			currentUrl = body.url;
			onNavigationRequested(body.url);
		}
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