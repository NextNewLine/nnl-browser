module.exports = function(app) {

	app.get('/forms1', function(req, res) {
		res.render("forms1");
	});

	app.post('/post', function(req, res) {

		const model = {
			body: req.body
		};

		res.render("post", model);
	});
}