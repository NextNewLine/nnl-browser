const Browser = require("../../Browser");
const expect = require('chai').expect;

describe('browser.url()', function() {

	it("returns the url of the page", async function() {

		const browser = new Browser();

		await browser.visit("/statustest/200");
		expect(await browser.url()).to.equal("http://localhost:3000/statustest/200");

	});

	it("returns the url of the page even after a redirect", async function() {

		const browser = new Browser();

		await browser.visit("/redirect");
		expect(await browser.url()).to.equal("http://localhost:3000/htmlsimple");

	});

});