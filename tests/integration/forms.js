const Browser = require("../../Browser");
const expect = require('chai').expect;

describe('browser.fill(), browser.select(), browser.pressButton()', function() {

	it("Filled in values (using the inputs' name) are submitted in the form", async function() {

		const browser = new Browser();

		await browser.visit("/forms1");

		await browser.fill("forumInputOne", "Forms4Life");
		await browser.fill("formTextArea", "Textareasaremylife");
		await browser.select("catlist", "Russian Blue");
		await browser.pressButton("#forumSubmitButton");

		expect(await browser.text("#formResults")).to.contain("Forms4Life");
		expect(await browser.text("#formResults")).to.contain("Textareasaremylife");
		expect(await browser.text("#formResults")).to.contain("russianblue");

	});

	it("Filled in values (using the inputs' id) are submitted in the form", async function() {

		const browser = new Browser();

		await browser.visit("/forms1");

		await browser.fill("#forumInputId", "CatsCatsCats");
		await browser.fill("#formTextAreaId", "Woooooooo");
		await browser.select("#CatListId", "siamese");
		await browser.pressButton("#forumSubmitButton");

		expect(await browser.text("#formResults")).to.contain("CatsCatsCats");
		expect(await browser.text("#formResults")).to.contain("Woooooooo");
		expect(await browser.text("#formResults")).to.contain("siamese");

	});
});