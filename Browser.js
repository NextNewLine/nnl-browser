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

	var currentStatus;
	var resources = [];

	var visit = function(url) {
		log("visiting " + "\x1b[34m" + url);
		return new Promise(function(resolve, reject) {
			createPhantom().then(function() {

				var urlToOpen = url;

				if (url.indexOf("://") == -1) {
					urlToOpen = baseUrl + url;
				}

				phantomPage.open(urlToOpen).then(async function(thisStatus) {
					currentStatus = thisStatus;
					await text();
					setTimeout(function() {
						resolve();
					}, 100);
				});
			});
		});
	}

	var reload = function() {
		return new Promise(async function(resolve, reject) {
			let url = await phantomPage.property("url");
			visit(url);
		});
	}

	var fill = function(selector, value) {
		return new Promise(function(resolve, reject) {
			var script = "function(){ document.querySelectorAll(\"input[name='" + selector + "'],input" + selector + ",textarea[name='" + selector + "'],textarea" + selector + "\")[0].value = '" + value + "'; }";
			phantomPage.evaluateJavaScript(script).then(html => {
				resolve();
			});
		});
	}

	var select = function(selector, value) {
		return new Promise(function(resolve, reject) {
			var script = "function(){ var selectObj = document.querySelectorAll(\"select[name='" + selector + "'],select" + selector + "\")[0];  for (var i = 0; i < selectObj.options.length; i++) {if (selectObj.options && selectObj.options[i] && selectObj.options[i].text=='" + value + "') { selectObj.options[i].selected = true;return;}}}";
			phantomPage.evaluateJavaScript(script).then(html => {
				resolve();
			});
		});
	}

	var choose = function(selector) {
		return new Promise(function(resolve, reject) {
			var script = "function(){ var inputObj = document.querySelectorAll(\"input[name='" + selector + "'],input" + selector + "\")[0]; if (inputObj) { inputObj.checked = true;return;} var inputObjs = document.querySelectorAll(\"input\"); for (var i = 0; i < inputObjs.length; i++) {if (inputObjs[i] && inputObjs[i].value=='" + selector + "') { inputObjs[i].checked = true;return;}}}";
			phantomPage.evaluateJavaScript(script).then(function() {
				resolve();
			});
		});
	}

	var reload = function() {
		return new Promise(function(resolve, reject) {
			phantomPage.property("url").then(url => {
				url = url.replace(baseUrl, "");
				visit(url).then(resolve);
			});
		});
	}

	/*
		callbackWaiting to be called once the button has been pressed and the page reloads
	*/

	var pressButton = function(selector) {
		log("pressing button '" + selector + "'");
		return new Promise(function(resolve, reject) {

			callbackWaiting = resolve;

			let script = "";
			if (selector.indexOf(".") === -1 && selector.indexOf("#") === -1) {
				script = "function(){ var debug; var possibleButtons = document.querySelectorAll(\"button, input, a.btn\"); var buttonToClick; for (var i = 0; i < possibleButtons.length; i++) { if (possibleButtons[i].innerText.indexOf('" + selector + "') !== -1){buttonToClick = possibleButtons[i]};} if(!buttonToClick){ return 'No button found for " + selector + "'; } buttonToClick.click(); var href = buttonToClick.getAttribute('href'); if (href && href.length > 1) {window.location.href = href}}";
			} else {
				script = "function(){ var debug; var buttonToClick = document.querySelectorAll(\"button" + selector + ", input" + selector + ", a.btn" + selector + "\")[0]; buttonToClick.click(); var href = buttonToClick.getAttribute('href'); if (href && href.length > 1 && href[0] !== '#') {window.location.href = href}}";
			}

			phantomPage.evaluateJavaScript(script).then((text) => {
				if (text) {
					log("Error " + text);
				}
				redirectTimeout = setTimeout(() => {
					if (!navigationRequested && callbackWaiting) {
						log("pressButton complete (within pressButton) no navigationRequested" + selector);
						callbackWaiting();
						callbackWaiting = false;
					}
				}, waitForRedirection);
			});
		});
	}

	var clickLink = function(selector) {
		log("clicking on link '" + selector + "'");
		return new Promise(function(resolve, reject) {

			callbackWaiting = resolve;

			const selectorIsIdOrClass = selector.indexOf(".") != -1 || selector.indexOf("#") != -1;

			let script;
			if (selectorIsIdOrClass) {
				script = "function(){ var foundLink = document.querySelectorAll(\"a" + selector + "\")[0]; if (!foundLink) return; foundLink.click(); }";
			} else {
				script = "function(){ var aTags = document.getElementsByTagName(\"a\"); var foundLink; for (var i = 0; i < aTags.length; i++) { if (aTags[i].textContent == \"" + selector + "\") { foundLink = aTags[i]; break;}} if (!foundLink) return; foundLink.click();}";
			}

			phantomPage.evaluateJavaScript(script).then(() => {
				redirectTimeout = setTimeout(() => {
					if (!navigationRequested && callbackWaiting) {
						log("clickLink complete (within clickLink) no navigationRequested" + selector);
						callbackWaiting();
						callbackWaiting = false;
					}
				}, waitForRedirection);
			});
		});
	}

	var text = function(selector) {
		return new Promise(function(resolve, reject) {

			var script = "function(){ if (!document.querySelectorAll(\"" + selector + "\")[0]) return ''; var text = \"\"; for (var i = 0; i < document.querySelectorAll(\"" + selector + "\").length; i++){ text += \" \" + (document.querySelectorAll(\"" + selector + "\")[i].innerText || document.querySelectorAll(\"" + selector + "\")[i].value)}; return text;}";
			if (!selector) {
				script = "function(){ var pageText = document.querySelectorAll(\"body\")[0].innerText; var inputText = \"\"; var inputs = document.querySelectorAll(\"input,textarea\"); for (var i = 0; i < inputs.length; i++){inputText += \" \" + inputs[i].value}; return pageText + inputText}";
			}
			phantomPage.evaluateJavaScript(script).then(text => {
				if (text) {
					text = text.replace(/\r?\n|\r/g, " ").replace(/ +(?= )/g, '').replace(/\t/g, " ");;
				}
				resolve(text);
			});
		});
	}

	var html = function() {
		return new Promise(function(resolve, reject) {
			var script = "function(){ return document.documentElement.outerHTML;}";
			phantomPage.evaluateJavaScript(script).then(html => {
				if (html) {
					html = html.replace(/\r?\n|\r/g, " ").replace(/ +(?= )/g, '').replace(/\t/g, " ");;
				}
				resolve(html);
			});
		});
	}

	var status = function() {
		return new Promise(function(resolve, reject) {
			resolve(resources[0].status);
		});
	}

	var query = function(selector) {
		return new Promise(function(resolve, reject) {
			var script = "function(){ return document.querySelectorAll(\"" + selector + "\").length !== 0; }";
			phantomPage.evaluateJavaScript(script).then(result => {
				if (result) {
					resolve(result);
				} else {
					resolve();
				}
			});
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
				log("finished loading" + "\x1b[34m" + url);
				if (callbackWaiting) {
					callbackWaiting();
					clearTimeout(redirectTimeout);
					callbackWaiting = false;
				}
				navigationRequested = false;
			});

			phantomPage.on("onNavigationRequested", async function(url, type, willNavigate, main) {
				resources = []
				log("started loading " + "\x1b[34m" + url);
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