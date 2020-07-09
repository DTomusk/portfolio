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
app.set('view engine', 'pug');

app.get('/', function(req, res) {
	res.render('index', {});
})

app.get('/projects', function(req, res) {
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

		res.render('projects', {
			"records": records
		});
	});
})

app.listen(8080, function() {
	console.log("Listening on 8080");
});

function write_page(res, page) {
	fs.createReadStream(page, 'utf8').pipe(res);
}