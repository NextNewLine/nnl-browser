const Browser = require("../../Browser");
const expect = require('chai').expect;

describe('browser.runScript()', function() {

	it("JS scripts can be run on the page", async function() {

		const browser = new Browser();

		await browser.visit("/htmlsimple");

		expect(await browser.text('#secondParagraph')).not.to.contain("And here is a second paragraph Whaaaaaat?");

		await browser.runScript("var div = document.getElementById('secondParagraph'); div.innerHTML = div.innerHTML + ' Whaaaaaat?';");

		expect(await browser.text('#secondParagraph')).to.contain("And here is a second paragraph Whaaaaaat?");

	});

	it("JS scripts can return values from the page", async function() {

		const browser = new Browser();

		await browser.visit("/htmlsimple");

		const result = await browser.runScript("var div = document.getElementById('secondParagraph'); return div.innerHTML;");

		expect(result).to.contain("And here is a second paragraph");

	});
});