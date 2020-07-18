var fs = require('fs'),
	express = require('express'),
	morgan = require('morgan'),
	pug = require('pug'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	myRouter = require('./controllers/routes.js');

var app = express();

app.use(methodOverride('_method'));
app.use(morgan('combined'));
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use('/', myRouter);
app.use('/admin', myRouter);


app.get('*', function(req, res) {
	res.status(404);
	res.render('404', {});
})

app.listen(8080, () =>
	console.log("Listening on 8080"));