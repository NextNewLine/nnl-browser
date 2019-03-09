const passport = require('passport');
const Strategy = require('passport-facebook').Strategy;

passport.use(new Strategy({
		clientID: process.env.FACEBOOK_APP_ID,
		clientSecret: process.env.FACEBOOK_APP_SECRET,
		callbackURL: 'http://localhost:3000/auth/facebook/callback'
	},
	function(accessToken, refreshToken, profile, cb) {
		return cb(null, profile);
	}));

passport.serializeUser(function(user, cb) {
	cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
	cb(null, obj);
});

module.exports = function(app) {

	app.use(require('morgan')('combined'));
	app.use(require('cookie-parser')());

	app.use(require('express-session')({
		secret: 'keyboard cat',
		resave: true,
		saveUninitialized: true
	}));

	app.use(passport.initialize());
	app.use(passport.session());

	app.get('/auth/facebook',
		passport.authenticate('facebook'));

	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			failureRedirect: '/error'
		}),
		function(req, res) {
			res.redirect('/');
		});

	app.get('/facebookProfile',
		function(req, res) {
			res.json(req.user);
		});
}

/*


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/facebook',
  passport.authenticate('facebook'));

app.get('/login/facebook/return', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });
*/