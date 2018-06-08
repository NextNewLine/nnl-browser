module.exports = function(app) {

	app.get('/simplehtml', function(req, res) {
		res.render("simplehtml");
	});

	app.get('/link1', function(req, res) {
		res.render("link1");
	});

	app.get('/link2', function(req, res) {
		res.render("link2");
	});

	app.get('/link3', function(req, res) {
		res.render("link3");
	});

}