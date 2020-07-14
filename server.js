var mysql = require('mysql'), // needed for accessing the database
	fs = require('fs'), // needed to access files in the directory, such as web pages
	express = require('express'),
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
// use pug files in the view folder as templates for sites
app.set('view engine', 'pug');

app.use(express.static('assets'));

app.get('/', function(req, res) {

	var records = [];

	con.query("SELECT * FROM projects", function(err, rows, fields) {
		if (err) {
			// that looks more professional, could render a 500 error page
			res.status(500).json({
				"status_code": 500,
				"status_message": "internal server error"
			});
		} else {
			for (const [index, record] of rows.entries()) {
				var entry = {
					'Name': rows[index].Name,
					'Description': rows[index].Description,
					'RepoPath': rows[index].RepoPath,
				};
				records.push(entry);
			}
		}

		console.log(records);

		res.render('index', {
			"records": records
		});
	});
})

app.listen(8080, function() {
	console.log("Listening on 8080");
});