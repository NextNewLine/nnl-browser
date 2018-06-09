const Browser = require("../../Browser");
const expect = require('chai').expect;

describe('browser.query()', function() {

	it("I can query the page using an id", async function() {

		const browser = new Browser();

		await browser.visit("/htmlsimple");

		expect(await browser.query("#firstParagraph")).not.to.exist;
		expect(await browser.query("#secondParagraph")).to.exist;
		expect(await browser.query("#thirdParagraph")).to.exist;

	});

	it("I can query the page using a class", async function() {

		const browser = new Browser();

		await browser.visit("/htmlsimple");

		expect(await browser.query(".paragraphOfInterest")).to.exist;
		expect(await browser.query(".notARealClass")).not.to.exist;

	});

	it("I can query the page using a class and id combination", async function() {

		const browser = new Browser();

		await browser.visit("/htmlsimple");

		expect(await browser.query("#secondParagraph.paragraphOfInterest")).to.exist;
		expect(await browser.query("#secondParagraph.notARealClass")).not.to.exist;

	});

});