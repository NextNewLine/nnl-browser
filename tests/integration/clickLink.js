const Browser = require("../../Browser");
const expect = require('chai').expect;

describe('browser.clickLink()', function() {

	it("Links can be followed by their text", async function() {

		const browser = new Browser();

		await browser.visit("/link1");

		expect(await browser.text()).to.contain("Link 1");
		
		await browser.clickLink("I like cats");

		expect(await browser.text()).to.contain("Link 2");

		await browser.clickLink("#link-again");

		expect(await browser.text()).to.contain("Link 3");

		await browser.clickLink(".classy-link");

		expect(await browser.text()).to.contain("Link 1");

	});

	it("Links which have a delay before they change page will work.", async function() {

		const browser = new Browser({
			waitForRedirection: 400
		});

		await browser.visit("/link4");		
		await browser.clickLink("Hats for all");
		expect(await browser.text()).to.contain("Link 5");

		await browser.visit("/link4");		
		await browser.clickLink("I like your shoes");
		expect(await browser.text()).to.contain("Link 5");

	});

	it("We can set the waitForRedirection to be shorter, causing trouble.", async function() {

		const args = {
			waitForRedirection: 1
		};

		const browser = new Browser(args);

		await browser.visit("/link4");		
		await browser.clickLink("Hats for all");
		expect(await browser.text()).to.contain("Link 4");

		await browser.visit("/link4");		
		await browser.clickLink("I like your shoes");
		expect(await browser.text()).to.contain("Link 4");

	});

	it("We are patient with slow ajax calls", async function() {

		const browser = new Browser();

		await browser.visit("/link5");		
		await browser.clickLink("Love it!");
		expect(await browser.text()).to.contain("Link 6");

	});

	it("We can follow a complex link selector", async function() {

		const browser = new Browser();

		await browser.visit("/link1");		
		await browser.clickLink("div[data-cat='meow'] .catclass a");
		expect(await browser.text()).to.contain("Link 2");

	});

	it("Click to show some text, and the link goes to an #anchor", async function() {

		const browser = new Browser();

		await browser.visit("/link7");
		await browser.clickLink("#change");

		expect(await browser.text()).to.contain("Link 7");

		await browser.clickLink("Another link?");

		expect(await browser.text()).to.contain("Link 7");
		

	});

});