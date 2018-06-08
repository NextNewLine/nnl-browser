const phantom = require('phantom');
const fs = require('fs');

// used for Mocha tests
process.on('unhandledRejection', function(reason) {
	throw reason;
});

module.exports = function(args) {

	var baseUrl = "http://localhost:3000";

	var waitForRedirection = 400; // how long to wait for a redirection after a button or link has been clicked?
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
			await text();

			setTimeout(function() {
				resolve();
			}, 100);
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

			var script = "function(){ document.querySelectorAll(\"input[name='" + selector + "'],input" + selector + ",textarea[name='" + selector + "'],textarea" + selector + "\")[0].value = '" + value + "'; }";
			await phantomPage.evaluateJavaScript(script);
			resolve();
		});
	}

	var select = function(selector, value) {
		return new Promise(async function(resolve, reject) {

			var script = "function(){ var selectObj = document.querySelectorAll(\"select[name='" + selector + "'],select" + selector + "\")[0];  for (var i = 0; i < selectObj.options.length; i++) { if (selectObj.options && selectObj.options[i] && ((selectObj.options[i].text=='" + value + "') || (selectObj.options[i].value=='" + value + "'))) { selectObj.options[i].selected = true;return;}}}";
			await phantomPage.evaluateJavaScript(script);
			resolve();
		});
	}

	var choose = function(selector, value) {
		return new Promise(async function(resolve, reject) {

			var script = "function(){ var inputObjs = document.querySelectorAll(\"input[name='" + selector + "'],input" + selector + "\"); if (inputObjs.length == 1) { inputObjs[0].checked = true;return;} for (var i = 0; i < inputObjs.length; i++) {if (inputObjs[i] && ((inputObjs[i].value == '" + selector + "') || (inputObjs[i].value == '" + value + "'))) { inputObjs[i].checked = true;return;}}}";
			await phantomPage.evaluateJavaScript(script);
			resolve();
		});
	}

	/*
		callbackWaiting to be called once the button has been pressed and the page reloads
	*/

	var pressButton = function(selector) {
		log("pressing button '" + selector + "'");
		return new Promise(async function(resolve, reject) {

			callbackWaiting = resolve;

			let script = "";
			if (selector.indexOf(".") === -1 && selector.indexOf("#") === -1) {
				script = "function(){ var debug; var possibleButtons = document.querySelectorAll(\"button, input, a.btn\"); var buttonToClick; for (var i = 0; i < possibleButtons.length; i++) { if (possibleButtons[i].innerText.indexOf('" + selector + "') !== -1){buttonToClick = possibleButtons[i]};} if(!buttonToClick){ return 'No button found for " + selector + "'; } buttonToClick.click(); var href = buttonToClick.getAttribute('href'); if (href && href.length > 1) {window.location.href = href}}";
			} else {
				script = "function(){ var debug; var buttonToClick = document.querySelectorAll(\"button" + selector + ", input" + selector + ", a.btn" + selector + "\")[0]; buttonToClick.click(); var href = buttonToClick.getAttribute('href'); if (href && href.length > 1 && href[0] !== '#') {window.location.href = href}}";
			}

			const error = await phantomPage.evaluateJavaScript(script);
			if (error) {
				log("Error " + error);
			}

			redirectTimeout = setTimeout(() => {
				if (!navigationRequested && callbackWaiting) {
					log("pressButton complete (within pressButton) no navigationRequested" + selector);
					callbackWaiting();
					callbackWaiting = false;
				}
			}, waitForRedirection);
		});
	}

	var clickLink = function(selector) {
		log("clicking on link '" + selector + "'");
		return new Promise(async function(resolve, reject) {

			callbackWaiting = resolve;

			const selectorIsIdOrClass = selector.indexOf(".") != -1 || selector.indexOf("#") != -1;

			let script;
			if (selectorIsIdOrClass) {
				script = "function(){ var foundLink = document.querySelectorAll(\"a" + selector + "\")[0]; if (!foundLink) return; foundLink.click(); }";
			} else {
				script = "function(){ var aTags = document.getElementsByTagName(\"a\"); var foundLink; for (var i = 0; i < aTags.length; i++) { if (aTags[i].textContent == \"" + selector + "\") { foundLink = aTags[i]; break;}} if (!foundLink) return; foundLink.click();}";
			}

			await phantomPage.evaluateJavaScript(script);
			redirectTimeout = setTimeout(() => {
				if (!navigationRequested && callbackWaiting) {
					log("clickLink complete (within clickLink) no navigationRequested" + selector);
					callbackWaiting();
					callbackWaiting = false;
				}
			}, waitForRedirection);
		});
	}

	var text = function(selector) {
		return new Promise(async function(resolve, reject) {

			var script = "function(){ if (!document.querySelectorAll(\"" + selector + "\")[0]) return ''; var text = \"\"; for (var i = 0; i < document.querySelectorAll(\"" + selector + "\").length; i++){ text += \" \" + (document.querySelectorAll(\"" + selector + "\")[i].innerText || document.querySelectorAll(\"" + selector + "\")[i].value)}; return text;}";
			if (!selector) {
				script = "function(){ var pageText = document.querySelectorAll(\"body\")[0].innerText; var inputText = \"\"; var inputs = document.querySelectorAll(\"input,textarea\"); for (var i = 0; i < inputs.length; i++){inputText += \" \" + inputs[i].value}; return pageText + inputText}";
			}

			let text = await phantomPage.evaluateJavaScript(script);
			if (text) {
				text = text.replace(/\r?\n|\r/g, " ").replace(/ +(?= )/g, '').replace(/\t/g, " ");;
			}
			resolve(text);
		});
	}

	var html = function() {
		return new Promise(async function(resolve, reject) {

			var script = "function(){ return document.documentElement.outerHTML;}";

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

			const script = "function(){ return document.querySelectorAll(\"" + selector + "\").length !== 0; }";

			const result = await phantomPage.evaluateJavaScript(script);
			if (result) {
				return resolve(true);
			}
			resolve(undefined);

		});
	};

	var screenShot = function(name) {
		return new Promise(function(resolve, reject) {

			setTimeout(async () => {

				const fileName = name + ".png";
				const dir = "screenshots/";

				var base64 = await phantomPage.renderBase64('PNG');

				log("screenshot taken");

				fs.existsSync(dir) || fs.mkdirSync(dir);

				fs.writeFile(dir + fileName, base64, 'base64', function() {
					resolve();
				});

			}, 2000);

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