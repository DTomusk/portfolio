var mysql = require('mysql'), // needed for accessing the database
	http = require('http'), // nneded to create the server itself
	fs = require('fs'), // needed to access files in the directory, such as web pages
	express = require('express'),
	projects = require('./pages/projects.js');

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

app.get('/', function(req, res) {
	res.send("What's up");
})

app.get('/projects', function(req, res) {
	projects.handle_records(con);
	write_page(res, './index.html');
})

app.listen(8080, function() {
	console.log("Listening on 8080");
});

function write_page(res, page) {
	fs.createReadStream(page, 'utf8').pipe(res);
}