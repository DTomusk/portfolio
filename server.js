var mysql = require('mysql'), // needed for accessing the database
	fs = require('fs'), // needed to access files in the directory, such as web pages
	express = require('express'),
	morgan = require('morgan'),
	pug = require('pug'),
	bodyParser = require('body-parser');

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

app.use(bodyParser.urlencoded({
	extended: true
}));

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

app.get('/admin', function(req, res) {
	res.render('admin', {});
})

app.post('/admin', function(req, res) {
	console.log("Posted");
	console.log(req.body);
	var name = req.body.projectName;
	var sDesc = req.body.shortDescription;
	var gLink = req.body.gitLink;
	var iPath = req.body.imgPath;
	var lDesc = req.body.longDescription;
	console.log(name + sDesc + gLink + iPath + lDesc);
	res.end("Yes");
	// need to find the highest primary key in projects and set pk to the next
	// then we make a con put to add the new entry to the database
	// we might need to make a delete just so we don't end up adding a bunch of test projects
})

app.listen(8080, () =>
	console.log("Listening on 8080"));