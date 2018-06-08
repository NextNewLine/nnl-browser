module.exports = function(app) {

	app.get('/simpletext', function(req, res) {
		res.send('Hello World!');
	});

}