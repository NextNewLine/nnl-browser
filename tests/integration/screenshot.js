const Browser = require("../../Browser");
const expect = require('chai').expect;

describe('browser.screenShot()', function() {

	it("Create a screenshot of bristlr.com", async function() {

		const browser = new Browser({
			loadImages: true
		});

		await browser.visit("https://app.bristlr.com");
		expect(await browser.text()).to.contain("Log in");

		await browser.screenShot("bristlr.com");

	});

});