module.exports = function(app) {

	app.get('/forms1', function(req, res) {
		res.render("forms1");
	});

	app.get('/forms2', function(req, res) {
		res.render("forms2");
	});

	app.get('/forms3', function(req, res) {
		res.render("forms3");
	});

	app.get('/forms4', function(req, res) {
		res.render("forms4");
	});

	app.post('/post', function(req, res) {

		const model = {
			body: req.body
		};

		res.render("post", model);
	});

	app.post('/slowPost', function(req, res) {

		const model = {
			body: req.body
		};

		setTimeout(function() {
			res.render("post", model);
		}, 1000);
	});

	app.post('/slowPostNoReply', function(req, res) {

		setTimeout(function() {
			res.sendStatus(200)
		}, 1000);
	});

}