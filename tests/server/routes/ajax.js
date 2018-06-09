module.exports = function(app) {

	app.get('/ajaxEndpoint800', function(req, res) {
		setTimeout(function() {
			res.sendStatus(200);
		}, 800);
	});

	app.get('/ajaxEndpoint100', function(req, res) {
		setTimeout(function() {
			res.sendStatus(200);
		}, 100);
	});

}