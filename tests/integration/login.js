const Browser = require("../../Browser");
const expect = require('chai').expect;

describe('browser.login()', function() {

	it("Fill the username and password and submit the form", async function() {

		const browser = new Browser();

		await browser.login("username", "password");

		expect(await browser.text("#formResults")).to.contain("username");
		expect(await browser.text("#formResults")).to.contain("password");

	});

});