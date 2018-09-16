const Browser = require("../../Browser");
const expect = require('chai').expect;

describe('Remote Control browser.text()', () => {

	let browser;
	let controlledBrowser;

	before(async () => {

		// Create a new Remote Controlled Browser
		browser = new Browser({
			remoteControl: true,
			remoteUrl: "http://localhost:1414"
		});

		// Create a browser instance to be controlled.
		controlledBrowser = new Browser();

		// The controlled browser must be given a starting point with the remote control script tag in
		controlledBrowser.visit("/remoteControl");
	});

	it("Returns the text on a text-only page", async () => {
		await browser.visit("/remoteControl");
		expect(await browser.text()).to.equal("Hello Remote Controlled World!");
	});
});