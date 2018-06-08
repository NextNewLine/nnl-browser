const auth = require('basic-auth');

module.exports = function(app) {

	app.get('/authentication', authChecker, function(req, res) {
		res.sendStatus(200);
	});
}

const authChecker = function(req, res, next) {
	function unauthorized(res) {
		res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
		return res.sendStatus(401);
	};

	const user = auth(req);

	if (!user || !user.name || !user.pass) {
		return unauthorized(res);
	};

	if (user.name === 'username' && user.pass === 'password') {
		return next();
	} else {
		return unauthorized(res);
	};
};