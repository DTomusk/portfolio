var mysql = require('mysql'), // needed for accessing the database
	http = require('http'), // nneded to create the server itself
	fs = require('fs'), // needed to access files in the directory, such as web pages
	projects = require('./pages/projects.js');

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

// the server needs separate logic for all the different requests that it could get
var server = http.createServer(function(req, res) {
	console.log("Request made"); // indicate whenever a request has been made

	var url = req.url;

	// very simple routing procedure
	if (url === '/projects') {

		projects.handle_records(con);
		write_page(res, './index.html');

	} else {
		res.write("What's up");
		res.end();
	}

	// not sure what this is doing here
	res.writeHead(200, {
		'Content-Type': 'text/html'
	});
});

server.listen(8080);

function write_page(res, page) {
	fs.createReadStream(page, 'utf8').pipe(res);
}