const Scripts = require('./lib/Scripts');
const TwirlTimer = require('./lib/TwirlTimer');

const M14BrowserPhantom = require("./browsers/M14BrowserPhantom");
const M14BrowserRemoteControl = require("./browsers/M14BrowserRemoteControl");

module.exports = function(args) {

	let baseUrl = "http://localhost:3000";

	let waitForRedirection = 400; // how long to wait for a redirection after a button or link has been clicked?

	let viewportSize = {
		width: 600,
		height: 961
	}; // default to the iPhone7

	let loadImages = false;

	let logDebug = false;

	if (args) {
		if (args.site) {
			baseUrl = args.site;
		}
		if (args.waitForRedirection) {
			waitForRedirection = args.waitForRedirection;
		}
		if (args.viewportSize) {
			viewportSize = args.viewportSize;
		}
		if (args.loadImages) {
			loadImages = args.loadImages;
		}
		if (args.debug) {
			logDebug = args.debug;
		}
	}
	
	const driverArgs = {
		onLoadFinished,
		onNavigationRequested,
		onResourceReceived,
		loadImages,
		viewportSize,
		authentication,
		args: args
	};

	let m14BrowserDriver;
	if (args && args.remoteControl) {
		m14BrowserDriver = new M14BrowserRemoteControl(driverArgs);
	} else {
		m14BrowserDriver = new M14BrowserPhantom(driverArgs);
	}

	var callbackWaiting;
	var navigationRequested = false;
	var redirectTimeout;

	var resources = [];

	var visit = function(url) {
		log("visiting " + "\x1b[34m" + url);

		return new Promise(async function(resolve, reject) {
			callbackWaiting = resolve;

			if (args && args.authentication) {
				driverArgs.authentication = args.authentication;
			}

			await m14BrowserDriver.create(driverArgs);

			var urlToOpen = url;

			if (url.indexOf("://") == -1) {
				urlToOpen = baseUrl + url;
			}

			await m14BrowserDriver.open(urlToOpen);

		});
	}

	var waitForAjaxToFinish = function() {
		return new Promise(async function(resolve) {

			var myInterval = setInterval(async function() {
				if (await pendingAjax() === 0) {
					clearInterval(myInterval);
					TwirlTimer.stop();
					return resolve();
				}
				TwirlTimer.start();
			}, 250);

		});

	}

	var reload = function() {
		return new Promise(async function(resolve, reject) {
			let url = await m14BrowserDriver.property("url");
			url = url.replace(baseUrl, "");
			log("Reloading " + url);
			await visit(url);
			resolve();
		});
	}

	var fill = function(selector, value) {
		return new Promise(async function(resolve, reject) {

			const script = await Scripts.fetch("fill", selector, value);
			await m14BrowserDriver.evaluateJavaScript(script);
			resolve();
		});
	}

	var select = function(selector, value) {
		return new Promise(async function(resolve, reject) {

			const script = await Scripts.fetch("select", selector, value);
			await m14BrowserDriver.evaluateJavaScript(script);
			resolve();
		});
	}

	var choose = function(selector, value) {
		return new Promise(async function(resolve, reject) {

			const script = await Scripts.fetch("choose", selector, value);
			await m14BrowserDriver.evaluateJavaScript(script);
			resolve();
		});
	}

	var uncheck = function(selector, value) {
		return new Promise(async function(resolve, reject) {

			const script = await Scripts.fetch("uncheck", selector, value);
			await m14BrowserDriver.evaluateJavaScript(script);
			resolve();
		});
	}

	/*
		callbackWaiting to be called once the button has been pressed and the page reloads
	*/

	var pressButton = function(selector) {
		return activateElement("pressButton", selector);
	}

	var clickLink = function(selector) {
		return activateElement("clickLink", selector);
	}

	var activateElement = function(command, selector) {
		log(command + " '" + selector + "'");
		return new Promise(async function(resolve, reject) {

			callbackWaiting = resolve;

			const script = await Scripts.fetch(command, selector);
			await m14BrowserDriver.evaluateJavaScript(script);

			debug("activateElement Finished clicking, now waiting");

			redirectTimeout = setTimeout(async () => {
				debug("activateElement Finished waitForRedirection");
				if (!navigationRequested && callbackWaiting) {
					debug("activateElement !navigationRequested && callbackWaiting");

					if (await pendingAjax() > 0) {
						log(command + " (within activateElement) waiting for all pending ajax calls to complete '" + selector + "'");
						await waitForAjaxToFinish();
					}

					log(command + " complete (within activateElement) no navigationRequested '" + selector + "'");
					debug("Callback from activateElement");
					callbackWaiting();
					callbackWaiting = false;
				}
			}, waitForRedirection);
		});
	}

	var pendingAjax = function() {
		return new Promise(async (resolve) => {
			const script = await Scripts.fetch("pendingjQueryAjax");
			const pendingCount = await m14BrowserDriver.evaluateJavaScript(script);
			resolve(pendingCount);

		});
	}

	var text = function(selector) {
		return new Promise(async function(resolve, reject) {

			const script = await Scripts.fetch("text", selector);
			let text = await m14BrowserDriver.evaluateJavaScript(script);

			if (text) {
				text = text.replace(/\r?\n|\r/g, " ").replace(/ +(?= )/g, '').replace(/\t/g, " ");;
			}
			resolve(text);
		});
	}

	var html = function() {
		return new Promise(async function(resolve, reject) {

			const script = await Scripts.fetch("html");
			let html = await m14BrowserDriver.evaluateJavaScript(script);

			if (html) {
				html = html.replace(/\r?\n|\r/g, " ").replace(/ +(?= )/g, '').replace(/\t/g, " ");;
			}
			resolve(html);

		});
	}

	var runScript = function(script) {
		return new Promise(async function(resolve, reject) {

			const results = await m14BrowserDriver.evaluateJavaScript("function(){ " + script + "}");
			resolve(results);

		});
	}

	var status = function() {
		return new Promise(function(resolve, reject) {
			resolve(resources[resources.length - 1].status);
		});
	}

	var query = function(selector) {
		return new Promise(async function(resolve, reject) {

			const script = await Scripts.fetch("query", selector);
			const result = await m14BrowserDriver.evaluateJavaScript(script);

			if (result) {
				return resolve(true);
			}
			resolve(undefined);

		});
	};

	var screenShot = function(name) {
		return m14BrowserDriver.screenshot(name);
	}

	async function onLoadFinished() {
		log("onLoadFinished");
		let url = await m14BrowserDriver.property("url");
		log("done " + "\x1b[34m" + url);

		redirectTimeout = setTimeout(async () => {
			if (await pendingAjax() > 0) {
				log("waiting for all pending ajax calls to complete");
				await waitForAjaxToFinish();
			}

			// The page has loaded, we've waited for all the ajax stuff to complete. We can go ahead and say the page is loaded
			if (callbackWaiting && redirectTimeout) {
				debug("Callback from onLoadFinished");
				callbackWaiting();
				clearTimeout(redirectTimeout);
				redirectTimeout = false;
				callbackWaiting = false;
			}
			navigationRequested = false;
		}, waitForRedirection);

	};

	async function onNavigationRequested(url) {
		log("load " + "\x1b[34m" + url);

		debug("Current resource array:");
		resources.forEach(function(resource) {
			debug("\t" + resource.url + " " + resource.status);
		});

		// handle either the old, or new,or both links being #something
		if (resources.length > 0 && (resources[0].url.indexOf('#') > 0 || url.indexOf('#') > 0)) {

			debug("onNavigationRequested detected #anchor tag");

			// ignore any #anchor in the url
			let currenctUrl = resources[0].url.indexOf('#') > 0 ? resources[0].url.substring(0, resources[0].url.indexOf('#')) : resources[0].url;
			let newUrl = url.indexOf('#') > 0 ? url.substring(0, url.indexOf('#')) : url;

			if (currenctUrl == newUrl) {
				onLoadFinished();
				return;
			} else {

				debug("onNavigationRequested not the same page " + currenctUrl + " " + newUrl);

			}
		} else {
			debug("onNavigationRequested no #anchor tag");
		}
		resources = [];
		navigationRequested = true;
	};

	// add to resources list if "start", otherwisde update or add
	function onResourceReceived(response) {
		debug("onResourceReceived " + response.stage + " " + response.url + " " + response.status);

		// If the first thing we get is a redirect, follow it.
		if (resources.length == 0 && response.status == 302) {
			return;
		}

		let updated = false;

		resources.forEach(function(resource, i) {
			if (resource.url == response.url) {
				debug("resource updated: " + response.url + " " + response.status);
				resources[i] = response;
				updated = true;
			}
		});

		if (!updated) {
			debug("resource added: " + response.url + " " + response.status);
			resources.push(response);
		}

	};

	function authentication(username, password) {
		return m14BrowserDriver.authentication(username, password);
	}

	function debug(text) {
		if (logDebug) {
			console.log("\x1b[32m " + "Browser [Debug]" + "\x1b[0m " + text + "\x1b[0m");
		}
	}

	function log(text) {
		console.log("\x1b[32m " + "Browser" + "\x1b[0m " + text + "\x1b[0m");
	}

	return {
		visit,
		reload,
		fill,
		select,
		pressButton,
		clickLink,
		choose,
		uncheck,
		text,
		html,
		query,
		authentication,
		status,
		runScript,
		screenShot
	}
};

// used for Mocha tests
process.on('unhandledRejection', function(reason) {
	throw reason;
});