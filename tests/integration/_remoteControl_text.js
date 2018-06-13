const Browser = require("../../Browser");
const expect = require('chai').expect;

describe('Remote Control browser.text()', function() {

	it("Returns the text on a text-only page", async function() {

		const browser = new Browser({
			remoteControl: true
		});

		const controlledBrowser = new Browser({
			debug: true
		});
		await controlledBrowser.visit("/remoteControl");

		await browser.visit("/remoteControl");
		expect(await browser.text()).to.equal("Hello Remote Controlled World!");

	});
});