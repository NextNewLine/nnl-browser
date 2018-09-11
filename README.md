# M14 Browser
### An easy to use headless browser, good for testing

**M14 Browser** is tested to work with Node 8 or later. 

The project is still undergoing frequent changes.

Currently two browsers are supported:

* Zombie
* Remote control (control any browser or webview with a simple line of JS, designed to work with Cordova)

## But why

The M14 Browser is a Promise based browser great for testing. It's controlled through a basic interface, which in turn injects JS into the page to control behaviour.

We're (John Kershaw, M14 Industries) building it as a testing tool so we can have a single, promise-based Browser interface which can control multiple different browsers.

Here's an example:

```js
const Browser = require("m14-browser");
const expect = require('chai').expect;


describe('Given we view the forms1 page', function() {

  const browser = new Browser();
    
  it("We can fill in the values and submit the form", async function() {

    await browser.visit("/forms1");

    await browser.fill("forumInput", "Forms4Life");
    await browser.fill("formTextArea", "Textareasaremylife");
    await browser.select("#favouriteCat", "Russian Blue");
    await browser.choose(".favouritePlant", "spiderplant");
    await browser.pressButton("#forumSubmitButton");
    
    await browser.screenshot("myScreenshot");

    expect(await browser.text("#formResults")).to.contain("Forms4Life");
    expect(await browser.text("#formResults")).to.contain("Textareasaremylife");
    expect(await browser.text("#formResults")).to.contain("russianblue");
    expect(await browser.text("#formResults")).to.contain("spiderplant");
    
  });
});
```
## Browser

### Controlling

#### `browser.visit(url)`

Visit a given Url.

#### `browser.reload()`

Reload the current page.
 
#### `browser.fill(selector, value)`

Fill in a form text field or text area.

#### `browser.select(selector, value)`

Select an option from a selection drop down

#### `browser.pressButton(selector)`

Press a button. This includes Bootstrap's `a.btn`.

#### `browser.clickLink(selector)`

Click a link.

#### `browser.choose(selector, value)`

Choose and click a radio button.

#### `browser.uncheck(selector, value)`

Uncheck and click a radio button.

### Viewing

#### `browser.text(selector)`

Return the readable text. Approximatly, this is what the user
 sees.

#### `browser.html(selector)`

Return the html. If no selector is given, returns the whole page.

#### `browser.query(selector)`

Does an element exist? Returns `true` or `false`.

#### `browser.status()`

Return the status of the most recently loaded page (e.g. `200` if everything loaded ok). If a redirect is followed, the value returned will be the page you end up on, not the `3xx` code from the first page.

#### `browser.url()`

Return the complete URL of the page being displayed


## Helpful additional functions

#### `browser.authentication(username, password)`

Provide a Basic Auth username and password.

#### `browser.screenShot()`

Take and save a screen shot of the current page. Saves as a png in the /screenshots folder.

#### `browser.login(username, password)`

Visit the root URL, auto fill "username" and "password", then submit the form by pressing the button with the id login-button