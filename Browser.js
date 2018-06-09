const phantom = require('phantom');
const fs = require('fs');

const Scripts = require('./lib/Scripts');
const TwirlTimer = require('./lib/TwirlTimer');

// used for Mocha tests
process.on('unhandledRejection', function(reason) {
	throw reason;
});

module.exports = function(args) {

	var baseUrl = "http://localhost:3000";

	var waitForRedirection = 200; // how long to wait for a redirection after a button or link has been clicked?
	var viewportSize = {
		width: 600,
		height: 961
	}; // default to the iPhone7
	var loadImages = false;

	if (args && args.site) {
		baseUrl = args.site;
	}
	if (args && args.waitForRedirection) {
		waitForRedirection = args.waitForRedirection;
	}
	if (args && args.viewportSize) {
		viewportSize = args.viewportSize;
	}
	if (args && args.loadImages) {
		loadImages = args.loadImages;
	}

	var phantomPage;
	var phantomInstance;
	var callbackWaiting;
	var navigationRequested = false;
	var redirectTimeout;

	var resources = [];

	var visit = function(url) {
		log("visiting " + "\x1b[34m" + url);

		return new Promise(async function(resolve, reject) {

			await createPhantom();

			var urlToOpen = url;

			if (url.indexOf("://") == -1) {
				urlToOpen = baseUrl + url;
			}

			await phantomPage.open(urlToOpen);
			await waitForAjaxToFinish();

			resolve();

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
			}, 50);

		});

	}

	var reload = function() {
		return new Promise(async function(resolve, reject) {
			let url = await phantomPage.property("url");
			url = url.replace(baseUrl, "");
			await visit(url);
			resolve();
		});
	}

	var fill = function(selector, value) {
		return new Promise(async function(resolve, reject) {

			const script = await Scripts.fetch("fill", selector, value);
			await phantomPage.evaluateJavaScript(script);
			resolve();
		});
	}

	var select = function(selector, value) {
		return new Promise(async function(resolve, reject) {

			const script = await Scripts.fetch("select", selector, value);
			await phantomPage.evaluateJavaScript(script);
			resolve();
		});
	}

	var choose = function(selector, value) {
		return new Promise(async function(resolve, reject) {

			const script = await Scripts.fetch("choose", selector, value);
			await phantomPage.evaluateJavaScript(script);
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
			await phantomPage.evaluateJavaScript(script);

			redirectTimeout = setTimeout(async () => {
				if (!navigationRequested && callbackWaiting) {

					if (await pendingAjax() == 0) {
						log(command + " complete (within clickElement) no navigationRequested" + selector);
						callbackWaiting();
						callbackWaiting = false;
					} else {
						log(command + " waiting for all pending ajax calls to complete");
					}
				}
			}, waitForRedirection);
		});
	}

	var pendingAjax = function() {
		return new Promise(async (resolve) => {
			const script = await Scripts.fetch("pendingjQueryAjax");
			const pendingCount = await phantomPage.evaluateJavaScript(script);
			resolve(pendingCount);

		});
	}

	var text = function(selector) {
		return new Promise(async function(resolve, reject) {

			const script = await Scripts.fetch("text", selector);
			let text = await phantomPage.evaluateJavaScript(script);

			if (text) {
				text = text.replace(/\r?\n|\r/g, " ").replace(/ +(?= )/g, '').replace(/\t/g, " ");;
			}
			resolve(text);
		});
	}

	var html = function() {
		return new Promise(async function(resolve, reject) {

			const script = await Scripts.fetch("html");
			let html = await phantomPage.evaluateJavaScript(script);

			if (html) {
				html = html.replace(/\r?\n|\r/g, " ").replace(/ +(?= )/g, '').replace(/\t/g, " ");;
			}
			resolve(html);

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
			const result = await phantomPage.evaluateJavaScript(script);

			if (result) {
				return resolve(true);
			}
			resolve(undefined);

		});
	};

	var screenShot = function(name) {
		return new Promise(async function(resolve, reject) {

			const fileName = name + ".png";
			const dir = "screenshots/";

			var base64 = await phantomPage.renderBase64('PNG');

			log("screenshot taken");

			fs.existsSync(dir) || fs.mkdirSync(dir);

			fs.writeFile(dir + fileName, base64, 'base64', function() {
				resolve();
			});

		});
	}

	var createPhantom = function() {

		return new Promise(async function(resolve, reject) {

			if (phantomPage) {
				if (phantomPage !== true) {
					return resolve();
				}
				// Still being created, try again in 10 ms
				log("\x1b[31mError: Still being created, waiting then trying again");
				return setTimeout(createPhantom().then(resolve), 100);
			}

			phantomPage = true;

			var options = ["--ignore-ssl-errors=yes"];
			if (!loadImages) {
				options.push("--load-images=no");
			}

			phantomInstance = await phantom.create(options);

			phantomPage = await phantomInstance.createPage();
			phantomPage.property("viewportSize", viewportSize);

			if (basicAuthUsername && basicAuthPassword) {
				await phantomPage.setting("userName", basicAuthUsername);
				await phantomPage.setting("password", basicAuthPassword);
			}

			phantomPage.on("onLoadFinished", async function() {

				let url = await phantomPage.property("url");

				log("done " + "\x1b[34m" + url);

				if (callbackWaiting) {
					callbackWaiting();
					clearTimeout(redirectTimeout);
					callbackWaiting = false;
				}
				navigationRequested = false;
			});

			phantomPage.on("onNavigationRequested", async function(url, type, willNavigate, main) {
				log("load " + "\x1b[34m" + url);
				resources = [];
				navigationRequested = true;
			});

			phantomPage.on("onResourceReceived", function(response) {
				if (response.stage !== "end") return;
				resources.push(response);
			});

			resolve();

		});
	}

	var basicAuthUsername, basicAuthPassword;

	function authentication(username, password) {
		basicAuthUsername = username;
		basicAuthPassword = password;
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
		text,
		html,
		query,
		authentication,
		status,
		screenShot
	}
};