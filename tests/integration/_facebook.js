require('dotenv').config();

if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_ACCESS_TOKEN) {
	throw ("Could not find FACEBOOK_APP_ACCESS_TOKEN or FACEBOOK_APP_ID");
}

const rp = require("request-promise-native");
const Browser = require("../../Browser");
const browser = new Browser();
const expect = require('chai').expect;

let facebookUser;

describe('Login with Facebook', function() {

	before(async function() {
		facebookUser = await createFacebookTestUser();
	});

	it("I can login", async function() {

		// Login
		await browser.visit("https://facebook.com");

		await browser.fill("email", facebookUser.email);
		await browser.fill("pass", facebookUser.password);
		await browser.pressButton("Log In");
		await browser.pressButton("OK");

		await browser.screenShot("FB_logged_in");

		expect(facebookUser.id).to.exist;

		//await browser.visit("/auth/facebook");

		//await browser.screenShot("FB_ask_permission");


		await deleteFacebookTestUser(facebookUser);

	});
});


function createFacebookTestUser() {
	return new Promise(async (resolve) => {

		console.log("Creating Facebook test user");

		const options = {
			method: "POST",
			uri: "https://graph.facebook.com/v3.2/" + process.env.FACEBOOK_APP_ID + "/accounts/test-users",
			json: true,
			qs: {
				access_token: process.env.FACEBOOK_APP_ACCESS_TOKEN,
				permissions: []
			}
		};

		const result = await rp(options);

		console.log("Created", result.email);

		resolve(result);
	});
}

function deleteFacebookTestUser(facebookUser) {
	return new Promise(async (resolve) => {

		console.log("Deleting Facebook test user", facebookUser.email);

		const options = {
			method: "DELETE",
			uri: "https://graph.facebook.com/v3.2/" + facebookUser.id,
			qs: {
				access_token: process.env.FACEBOOK_APP_ACCESS_TOKEN,
				uid: facebookUser.id
			}
		};

		await rp(options);

		resolve();
	});
}