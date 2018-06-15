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
	app.set('views', path.join(__dirname, '/views'));

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

		res.render('remoteControljs.ejs', remoteControlArgs);
		fileLoaded = true;
	});

	let theEvent = false;
	app.get('/currentEvent', function(req, res) {
		console.log("Current event requested");

		if (!theEvent) {
			return res.json(false);
		}
		res.json(theEvent);
	});

	app.post('/completedEvent', function(req, res) {
		console.log("Completed event", theEvent.id);

		const results = JSON.parse(req.body.results);
		eventArgs.eventComplete(theEvent, results);
		theEvent = false;
		res.sendStatus(200);
	});

	app.post('/startedEvent', function(req, res) {
		console.log("Started event", theEvent.id);
		theEvent.state = "started";
		res.sendStatus(200);
	});

	let serverListening = false;
	app.listen(1414, () => {
		serverListening = true;
		console.log('Remote control server now listening on port 1414!');
	});

	function waitUntilReady() {
		return new Promise(function(resolve) {
			console.log("Waiting for connection ... ");

			const interval = setInterval(function() {

				if (serverListening && fileLoaded) {
					console.log(" Connected!");
					clearInterval(interval);
					return resolve();
				}

			}, 100);
		});
	}

	function sendEvent(type, body) {
		return new Promise(function(resolve) {
			theEvent = {
				type: type,
				body: body,
				callback: resolve,
				state: "waiting",
				id: new Date().getTime()
			};

			console.log("Event created", theEvent.id);
		});

	}

	function currentEvent() {
		return theEvent;
	}

	return {
		currentEvent,
		waitUntilReady,
		sendEvent
	}
};