const Browser = require("../../Browser");
const expect = require('chai').expect;

describe('browser.clickLink()', function() {

	it("Links can be followed by their text", async function() {

		const browser = new Browser();

		await browser.visit("/link1");

		expect(await browser.text()).to.contain("Link 1");
		
		await browser.clickLink("I like cats");

		expect(await browser.text()).to.contain("Link 2");

		await browser.clickLink("#link-again");

		expect(await browser.text()).to.contain("Link 3");

		await browser.clickLink(".classy-link");

		expect(await browser.text()).to.contain("Link 1");

	});
});