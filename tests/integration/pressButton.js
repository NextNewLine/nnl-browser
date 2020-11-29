const Browser = require("../../Browser");
const expect = require('chai').expect;

describe('browser.pressButton()', function() {

	it("A button can be pressed using its id", async function() {

		const browser = new Browser();

		await browser.visit("/forms1");
		await browser.select("catlist", "Russian Blue");
		await browser.pressButton("#forumSubmitButton");

		expect(await browser.text("#formResults")).to.contain("russianblue");

	});

	it("A button can be pressed using its text", async function() {

		const browser = new Browser();

		await browser.visit("/forms1");
		await browser.select("catlist", "Russian Blue");
		await browser.pressButton("Submit");

		expect(await browser.text("#formResults")).to.contain("russianblue");

	});

	it("A button can be pressed using its case insensitivetext", async function() {

		const browser = new Browser();

		await browser.visit("/forms1");
		await browser.select("catlist", "Russian Blue");
		await browser.pressButton("sUBMIT");

		expect(await browser.text("#formResults")).to.contain("russianblue");

	});
});