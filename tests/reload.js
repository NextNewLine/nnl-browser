const Browser = require("../Browser");
const expect = require('chai').expect;

describe('Browser.reload()', function() {

	it("Reload causes the page to be refreshed", async function() {

		const browser = new Browser();

		await browser.visit("/reloadcount");
		expect(await browser.text()).to.equal("Times this page has been loaded: 1");

		await browser.reload();
		expect(await browser.text()).to.equal("Times this page has been loaded: 2");

		await browser.reload();
		expect(await browser.text()).to.equal("Times this page has been loaded: 3");

	});

});