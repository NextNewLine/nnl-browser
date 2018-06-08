module.exports = function(app) {

	app.get('/simpletext', function(req, res) {
		res.send('Hello World!');
	});

	let reloadCount = 0;
	app.get('/reloadcount', function(req, res) {
		reloadCount++;
		res.send('Times this page has been loaded: ' + reloadCount);
	});

}