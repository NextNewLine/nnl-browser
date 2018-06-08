module.exports = function(app) {

	app.get('/simplehtml', function(req, res) {
		res.render("simplehtml");
	});

}