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
	// returns a promise that we can call then() on
	get_records().then(function(results) {
		write_records(results)
	}).catch(function(err) {
		console.log("Promise rejection: " + err);
	});
	var readStream = fs.createReadStream('./index.html', 'utf8'); // serve index.html
	readStream.pipe(res);
});

server.listen(8080);

function get_records() {
	return new Promise(function(resolve, reject) {
		con.query("SELECT * FROM projects", function(err, result) {
			if (err) throw err;
			console.log("Result: ");
			console.log(result);
			if (result === undefined) {
				reject(new Error("Result is undefined"));
			} else {
				// if we get a proper response, then we resolve the promise by calling write_records
				resolve(result);
			}
		})
	})
}

// only runs once get records has finished
function write_records(records) {
	console.log("Write records called");
	console.log(records);
	// like to manipulate the dom by adding elements to our list
	// can't access the dom directly, but can use jsdom and jquery
	fs.readFile('index.html', 'utf8', (err, data) => {
		if (err) throw err;
		const dom = new jsdom.JSDOM(data);
		// $ is an alias to jQuery, $('body') is short for jquery(dom.window)('body')
		const $ = jquery(dom.window);

		$(".ProjectList").empty();

		Object.keys(records).forEach(function(key) {
			var row = records[key];
			console.log(row.Name);
			// current image not displaying correctly, also need to add image path to database
			$(".ProjectList").append(' <li>\<h2>' + row.Name + '</h2>\<img src="./assets/happy.png" alt="Happiness">\<p>' + row.Description + '</p>\</li> ');
		});

		fs.writeFile('index.html', dom.serialize(), err => {
			if (err) throw err;
			console.log('Wrote new dom stuff');
		});
	});
}