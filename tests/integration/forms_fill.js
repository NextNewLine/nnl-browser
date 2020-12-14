const Browser = require("../../Browser");
const expect = require('chai').expect;

describe('browser.fill()', function() {

	it("Filled in values (using the inputs' id) are submitted in the form", async function() {

		const browser = new Browser();

		await browser.visit("/forms1");

		await browser.fill("#forumInputId", "CatsCatsCats");
		await browser.fill("#formTextAreaId", "Woooooooo");
		await browser.select("#CatListId", "siamese");
		await browser.choose("#favePlant2");

		await browser.pressButton("#forumSubmitButton");

		expect(await browser.text("#formResults")).to.contain("CatsCatsCats");
		expect(await browser.text("#formResults")).to.contain("Woooooooo");
		expect(await browser.text("#formResults")).to.contain("siamese");
		expect(await browser.text("#formResults")).to.contain("bostonfern");

	});

	it("Filled in values can use apostraphies and speech marks", async function() {

		const browser = new Browser();

		await browser.visit("/forms1");
		await browser.fill("#forumInputId", `I'm a fan of "cats"`);
		await browser.pressButton("#forumSubmitButton");

		expect(await browser.text("#formResults")).to.contain(`I'm a fan of \\"cats\\"`);

	});

	it("Filled in values can be numbers", async function() {

		const browser = new Browser();

		await browser.visit("/forms1");
		await browser.fill("#forumInputId", 100);
		await browser.pressButton("#forumSubmitButton");

		expect(await browser.text("#formResults")).to.contain(`100`);

	});

});