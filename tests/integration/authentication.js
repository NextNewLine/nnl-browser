const Browser = require("../../Browser");
const expect = require('chai').expect;

describe('browser.authentication()', function() {

	it("Without authentication you get a 401", async function() {

		const browser = new Browser();

		await browser.visit("/authentication");

		expect(await browser.status()).to.equal(401);

	});

	it("With basic authentication you get a 200", async function() {

		const browser = new Browser();
		browser.authentication("username", "password");

		await browser.visit("/authentication");

		expect(await browser.status()).to.equal(200);

	});
});