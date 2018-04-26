const expect = require('chai').expect;
const Browser = require("../Browser");

describe('Browser screen shot', function() {

	it("Create a screen shot of bristlr.com", async function() {

		const browser = new Browser({
			loadImages: true
		});

		await browser.visit("https://app.bristlr.com");
		await browser.screenShot("bristlr.com");

	});

	it("Create a screen shot of m14.industries", async function() {

		const browser = new Browser({
			loadImages: true
		});

		await browser.visit("https://m14.industries");
		await browser.screenShot("m14.industries");

	});
});