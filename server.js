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
	get_projects(con, res).then(
		result => {
			console.log(result);
			res.render('index', {
				"records": result
			});
		},
		error => fivehundred(res)
	)
})

app.get('/admin', function(req, res) {
	res.render('admin', {});
})

// admin should list all the projects so you can edit/delete them
app.post('/admin', function(req, res) {
	console.log("Posted");
	console.log(req.body);
	var entry = {
		'Name': req.body.projectName,
		'Description': req.body.shortDescription,
		'RepoPath': req.body.gitLink,
		'ImgPath': req.body.imgPath,
		'Synopsis': req.body.longDescription
	};

	// I don't think this nesting is idiomatic
	get_projects(con, res).then(
		result => get_max(result).then(
			result => insert_project(con, res, result, entry).then(
				result => res.end("Posted"),
				error => fivehundred(res)
			),
			error => fivehundred(res)
		),
		error => fivehundred(res)
	)
})

app.listen(8080, () =>
	console.log("Listening on 8080"));

function get_projects(con, res) {
	return new Promise(function(resolve, reject) {
		var records = [];
		con.query("SELECT * FROM projects", function(err, rows, fields) {
			if (err) {
				// that looks more professional, could render a 500 error page
				reject();
			} else {
				for (const [index, record] of rows.entries()) {
					var entry = {
						'id': rows[index].id,
						'Name': rows[index].Name,
						'Description': rows[index].Description,
						'RepoPath': rows[index].RepoPath,
						'ImgPath': rows[index].ImgPath,
						'Synopsis': rows[index].Synopsis
					};
					records.push(entry);
				}
				resolve(records);
			}
		});
	})
};

function get_max(results) {
	return new Promise(function(resolve, reject) {
		var max = 0;
		for (const project of results) {
			var id = parseInt(project['id']);
			if (id > max) {
				max = id;
			}
		}
		max += 1;
		console.log("Next ID " + max);
		resolve(max);
	})
}

function insert_project(con, res, id, project) {
	return new Promise(function(resolve, reject) {
		console.log(id);
		console.log(project);
		con.query("INSERT INTO projects(id,Name,Description,RepoPath,ImgPath,Synopsis) VALUES(" + id + "," + project['Name'] + "," + project['Description'] + "," + project['RepoPath'] + "," + project['ImgPath'] + "," + project['Synopsis'] + ")", function(err) {
			if (err) {
				reject();
			} else {
				resolve();
			}
		});

	})
}

function fivehundred(res) {
	res.status(500).json({
		"status_code": 500,
		"status_message": "internal server error"
	});
	res.end("Nope");
}