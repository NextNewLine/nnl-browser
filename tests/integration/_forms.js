const Browser = require("../../Browser");
const expect = require('chai').expect;

describe('browser.fill(), browser.select(), browser.choose(), browser.uncheck(), browser.pressButton()', function() {

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

	it("Choose and uncheck can be used", async function() {

		const browser = new Browser();

		await browser.visit("/forms1");

		await browser.choose("#favePlant2");
		await browser.uncheck("#favePlant2");
		
		await browser.pressButton("#forumSubmitButton");

		expect(await browser.text("#formResults")).not.to.contain("other");

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

	it("A form can be submitted via ajax, even if the response takes a while", async function() {

		const browser = new Browser();

		await browser.visit("/forms2");

		await browser.fill("#forumInputId", "CatsCatsCats");
		await browser.fill("#formTextAreaId", "Woooooooo");
		await browser.select("#CatListId", "siamese");
		await browser.choose("other");

		await browser.pressButton("#forumSubmitButton");

		expect(await browser.text("#formResults")).to.contain("CatsCatsCats");
		expect(await browser.text("#formResults")).to.contain("Woooooooo");
		expect(await browser.text("#formResults")).to.contain("siamese");
		expect(await browser.text("#formResults")).to.contain("other");

	});

	it("Form submissions still work, even if it takes a while for the forum to submit", async function() {

		const browser = new Browser();

		await browser.visit("/forms3");

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

	it("Ajax slow Form submissions resulting in a redirect to a slow ajax loading page, still work", async function() {

		const browser = new Browser();

		await browser.visit("/forms4");
		
		await browser.pressButton("#forumSubmitButton");

		expect(await browser.text("#thirdParagraph")).to.contain("800ms here!");

	});
});

// Currently can't Choose with a Selector & text, as a radio button has no text