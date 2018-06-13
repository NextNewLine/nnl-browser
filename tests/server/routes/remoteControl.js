module.exports = function(app) {

	app.get('/remoteControl', function(req, res) {
		res.render('remoteControl');
	});

}