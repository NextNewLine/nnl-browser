module.exports = function(app) {

	app.get('/htmlsimple', function(req, res) {
		res.render("htmlsimple");
	});

	app.get('/htmlajax', function(req, res) {
		res.render("htmlajax");
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

	app.get('/link4', function(req, res) {
		res.render("link4");
	});

	app.get('/link5', function(req, res) {
		res.render("link5");
	});

	app.get('/link6', function(req, res) {
		res.render("link6");
	});

}