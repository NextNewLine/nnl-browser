const Browser = require("../../Browser");
const expect = require('chai').expect;

describe('browser.status()', function() {

	it("returns a 200 if everything is OK", async function() {

		const browser = new Browser();

		await browser.visit("/statustest/200");
		expect(await browser.status()).to.equal(200);

	});

	it("returns a 404 if that's what the server returned", async function() {

		const browser = new Browser();

		await browser.visit("/statustest/404");
		expect(await browser.status()).to.equal(404);

	});

	it("returns a 500 if that's what the server returned", async function() {

		const browser = new Browser();

		await browser.visit("/statustest/500");
		expect(await browser.status()).to.equal(500);

	});

	it("follows a redirect if that's what the server returned", async function() {

		const browser = new Browser();

		await browser.visit("/statustest/302");
		expect(await browser.status()).not.to.equal(302);
		expect(await browser.status()).to.equal(200);
		expect(await browser.text()).to.equal("redirected");

	});

});