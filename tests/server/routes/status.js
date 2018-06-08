module.exports = function(app) {

	app.get('/statustest/200', function(req, res) {
		res.sendStatus(200);
	});

	app.get('/statustest/404', function(req, res) {
		res.sendStatus(404);
	});

	app.get('/statustest/500', function(req, res) {
		res.sendStatus(500);
	});

	app.get('/statustest/302', function(req, res) {
		res.redirect("/statustestredirected");
	});

	app.get('/statustestredirected', function(req, res) {
		res.send("redirected");
	});

}