const Browser = require("../../Browser");
const expect = require('chai').expect;

describe('browser.text()', function() {

	it("Returns the text on a text-only page", async function() {

		const browser = new Browser();

		await browser.visit("/simpletext");

		expect(await browser.text()).to.equal("Hello World!");

	});

	it("Returns the text on a basic html page", async function() {

		const browser = new Browser();

		await browser.visit("/htmlsimple");

		expect(await browser.text()).to.contain("This is the title");
		expect(await browser.text()).to.contain("First paragraph");
		expect(await browser.text()).to.contain("And here is a second paragraph");
		expect(await browser.text()).to.contain("A text input");
		expect(await browser.text()).to.contain("Another text input");
		expect(await browser.text()).to.contain("A text area");
		expect(await browser.text()).to.contain("Another text area");

	});

	it("Returns the text on a basic html page using the id selector", async function() {

		const browser = new Browser();

		await browser.visit("/htmlsimple");

		expect(await browser.text("#secondParagraph")).not.to.contain("First paragraph");
		expect(await browser.text("#secondParagraph")).to.contain("And here is a second paragraph");

	});

	it("Returns the text on a basic html page using the class selector", async function() {

		const browser = new Browser();

		await browser.visit("/htmlsimple");

		expect(await browser.text(".paragraphOfInterest")).not.to.contain("First paragraph");
		expect(await browser.text(".paragraphOfInterest")).to.contain("And here is a second paragraph");
		expect(await browser.text(".paragraphOfInterest")).to.contain("And here is a paragraph with the same class as the secondParagraph");

	});

	it("Waits for jQuery ajax requests to complete before checking", async function() {

		const browser = new Browser();

		await browser.visit("/htmlajax");

		expect(await browser.text("#secondParagraph")).to.contain("100ms here!");
		expect(await browser.text("#thirdParagraph")).to.contain("800ms here!");

	});

	it("Waits for jQuery ajax requests to complete before checking even if the request takes a while to start", async function() {

		const browser = new Browser({
			debug: true
		});

		await browser.visit("/htmlajax2");

		expect(await browser.text("#secondParagraph")).to.contain("100ms here!");

	});

	it("Waits for slow jQuery ajax requests to complete before checking", async function() {

		const browser = new Browser({
			debug: true
		});

		await browser.visit("/htmlajax2");

		expect(await browser.text("#thirdParagraph")).to.contain("800ms here!");

	});
});