const phantom = require('phantom');
const fs = require('fs');

module.exports = function() {

	let phantomPage;
	let phantomInstance;

	// default to the iPhone7
	let viewportSize = {
		width: 600,
		height: 961
	};

	let loadImages = false;

	let basicAuthUsername = false;
	let basicAuthPassword = false;

	function create(args) {

		return new Promise(async function(resolve, reject) {

			if (args) {
				if (args.viewportSize) {
					viewportSize = args.viewportSize;
				}
				if (args.loadImages) {
					loadImages = args.loadImages;
				}
				if (args.authentication && args.authentication.username && args.authentication.password) {
					basicAuthUsername = args.authentication.username;
					basicAuthPassword = args.authentication.password;
				}
			}

			if (phantomPage) {
				if (phantomPage !== true) {
					return resolve();
				}
				// Still being created, try again in 10 ms
				console.log("\x1b[31mError: Still being created, waiting then trying again");
				return setTimeout(create().then(resolve), 100);
			}

			phantomPage = true;

			var options = ["--ignore-ssl-errors=yes", "--ssl-protocol=any"];
			if (!loadImages) {
				options.push("--load-images=no");
			}

			phantomInstance = await phantom.create(options);

			phantomPage = await phantomInstance.createPage();
			phantomPage.property("viewportSize", viewportSize);

			//await phantomPage.setting("userAgent", 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/53 (KHTML, like Gecko) Chrome/15.0.87');

			if (basicAuthUsername && basicAuthPassword) {
				await phantomPage.setting("userName", basicAuthUsername);
				await phantomPage.setting("password", basicAuthPassword);
			}

			phantomPage.on("onLoadFinished", args.onLoadFinished);
			phantomPage.on("onNavigationRequested", args.onNavigationRequested);
			phantomPage.on("onResourceReceived", args.onResourceReceived);

			resolve();

		});
	}

	function open(url) {
		return phantomPage.open(url);
	}

	function evaluateJavaScript(script) {
		return phantomPage.evaluateJavaScript(script);
	}

	function screenshot(name) {
		return new Promise(async function(resolve, reject) {

			const fileName = name + ".png";
			const dir = "screenshots/";

			var base64 = await phantomPage.renderBase64('PNG');

			console.log("Screenshot taken");

			fs.existsSync(dir) || fs.mkdirSync(dir);

			fs.writeFile(dir + fileName, base64, 'base64', function() {
				resolve();
			});

		});
	}

	function property(name) {
		return new Promise(async function(resolve, reject) {
			if (name == "url") {
				const url = await phantomPage.property("url");
				return resolve(url);
			}

			reject("No property found with the name '" + name + "'");
		});

	}

	function authentication(username, password) {
		return new Promise(async function(resolve, reject) {

			basicAuthUsername = username;
			basicAuthPassword = password;

			try {
				await phantomPage.setting("userName", basicAuthUsername);
				await phantomPage.setting("password", basicAuthPassword);
			} catch (e) {}

			resolve();
		});

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