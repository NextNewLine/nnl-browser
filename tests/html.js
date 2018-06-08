const Browser = require("../Browser");
const expect = require('chai').expect;

describe('Browser.html()', function() {

	it("Returns the html on a text-only page", async function() {

		const browser = new Browser();

		await browser.visit("/simplehtml");

		expect(await browser.html()).to.contain("<title>Test page</title>");
		expect(await browser.html()).to.contain("<input type=\"text\" name=\"sampleTextInput\" value=\"A text input\">");

	});
});