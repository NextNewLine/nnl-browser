const Browser = require("../../Browser");
const expect = require('chai').expect;

describe('browser.reload()', function() {

	it("Reload causes the page to be refreshed", async function() {

		const browser = new Browser();

		await browser.visit("/reloadcount");
		expect(await browser.text()).to.equal("Times this page has been loaded: 1");

		await browser.reload();
		expect(await browser.text()).to.equal("Times this page has been loaded: 2");

		await browser.reload();
		expect(await browser.text()).to.equal("Times this page has been loaded: 3");

	});

	it("Reload causes the page to be refreshed, even if it's an anchor page", async function() {

		const browser = new Browser();

		await browser.visit("/reloadcount#anchor");
		expect(await browser.text()).to.equal("Times this page has been loaded: 4");

		await browser.reload();
		expect(await browser.text()).to.equal("Times this page has been loaded: 5");

		await browser.reload();
		expect(await browser.text()).to.equal("Times this page has been loaded: 6");

	});

});