const Browser = require("../../Browser");
const expect = require('chai').expect;

describe('browser.fill(), browser.select(), browser.choose(), browser.pressButton()', function() {

	it("Filled in values (using the inputs' name and text) are submitted in the form", async function() {

		const browser = new Browser();

		await browser.visit("/forms1");

		await browser.fill("forumInputOne", "Forms4Life");
		await browser.fill("formTextArea", "Textareasaremylife");
		await browser.select("catlist", "Russian Blue");
		await browser.choose("favePlant", "other");
		await browser.pressButton("#forumSubmitButton");

		expect(await browser.text("#formResults")).to.contain("Forms4Life");
		expect(await browser.text("#formResults")).to.contain("Textareasaremylife");
		expect(await browser.text("#formResults")).to.contain("russianblue");
		expect(await browser.text("#formResults")).to.contain("other");

	});

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
});

// Currently can't Choose with a Selector & text, as a radio button has no text