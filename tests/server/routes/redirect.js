module.exports = function(app) {

	app.get('/redirect', function(req, res) {
		res.redirect("/htmlsimple");
	});

}