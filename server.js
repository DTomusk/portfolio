var mysql = require('mysql'), // needed for accessing the database
	http = require('http'), // nneded to create the server itself
	fs = require('fs'), // needed to access files in the directory, such as web pages
	jsdom = require('jsdom'),
	jquery = require('jquery');

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

var server = http.createServer(function(req, res) {
	console.log("Request made"); // indicate whenever a request has been made
	res.writeHead(200, {
		'Content-Type': 'text/html'
	});
	// making a request to this page makes a request to the database
	//
	get_records(function() {
		write_records()
	});
	var readStream = fs.createReadStream('./index.html', 'utf8'); // serve index.html
	readStream.pipe(res);
});

server.listen(8080);

function get_records(callback) {
	con.query("SELECT * FROM projects", function(err, result) {
		if (err) throw err;
		console.log("Result: ");
		console.log(result);
		callback(result);
	});
}

// only runs once get records has finished
function write_records(records) {
	console.log("Write records called");
	// like to manipulate the dom by adding elements to our list
	// can't access the dom directly, but can use jsdom and jquery
	fs.readFile('index.html', 'utf8', (err, data) => {
		const dom = new jsdom.JSDOM(data);
		const $ = jquery(dom.window);
		$('body').html('');
		fs.writeFile('index.html', dom.serialize(), err => {
			console.log('Wrote new dom stuff');
		});
	});
}