var mysql = require('mysql'), // needed for accessing the database
	fs = require('fs'), // needed to access files in the directory, such as web pages
	express = require('express'),
	projects = require('./pages/projects.js'),
	morgan = require('morgan'),
	pug = require('pug');

var app = express();

var con = mysql.createConnection({ // log into database
	host: 'localhost',
	user: 'root',
	password: '', // need to remember to remove this for every commit, not ideal
	database: 'portfolio'
});

// only connect to the database once
con.connect(function(err) {
	if (err) throw err;
	console.log("Connected to database")
})

// logs all http requests in the console
app.use(morgan('combined'));
app.set('view engine', 'pug');

app.get('/', function(req, res) {
	res.render('index', {});
})

app.get('/projects', function(req, res) {
	let records = projects.handle_records(con);
	res.render('projects', {
		records
	});
	//write_page(res, './pages/projects.html');
})

app.listen(8080, function() {
	console.log("Listening on 8080");
});

function write_page(res, page) {
	fs.createReadStream(page, 'utf8').pipe(res);
}