// imports
var mysql = require('mysql'), // needed for accessing the database
	fs = require('fs'), // needed to access files in the directory, such as web pages
	express = require('express'),
	morgan = require('morgan'),
	pug = require('pug'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override');


// putting things in place


var app = express();
var con = mysql.createConnection({ // log into database
	host: 'localhost',
	user: 'root',
	password: '', // need to remember to remove this for every commit, not ideal
	database: 'portfolio'
});

con.connect(function(err) {
	if (err) throw err;
	console.log("Connected to database")
})

app.use(methodOverride('_method'));
app.use(morgan('combined'));
app.set('view engine', 'pug');
app.use(express.static('assets'));
app.use(bodyParser.urlencoded({
	extended: true
}));


// routing


app.get('/', function(req, res) {
	console.log(req.body);
	get_projects(con, res).then(
		result => {
			res.render('index', {
				"records": result
			});
		},
		error => fivehundred(res)
	)
})

app.get('/admin', function(req, res) {
	get_admin(con, res);
})

// admin should list all the projects so you can edit/delete them
app.post('/admin', function(req, res) {
	console.log("Trying to post");
	var entry = {
		'Name': req.body.projectName,
		'Description': req.body.shortDescription,
		'RepoPath': req.body.gitLink,
		'ImgPath': req.body.imgPath,
		'Synopsis': req.body.longDescription
	};
	console.log("Posting entry: " + entry);

	// I don't think this nesting is idiomatic
	get_projects(con, res).then(
		result => {
			console.log("Successfully retrieved projects");
			get_max(result).then(
				result => {
					console.log("Successfully retrieved max id");
					insert_project(con, res, result, entry).then(
						result => {
							console.log("Successfully inserted project");
							console.log("Rerendering admin");
							get_admin(con, res)
						},
						error => fivehundred(res)
					)
				},
				error => fivehundred(res)
			)
		},
		error => fivehundred(res)
	)
})

app.post('/admin/:id', function(req, res) {
	console.log("Hrmph");
})

app.delete('/admin/:id', function(req, res) {
	console.log(req.params.id);
	delete_project(con, res, req.params.id).then(
		result => get_admin(con, res),
		error => fivehundred(res)
	);
})

app.get('*', function(req, res) {
	res.status(404);
	res.render('404', {});
})

app.listen(8080, () =>
	console.log("Listening on 8080"));


// db functions


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
		resolve(max);
	})
}

function insert_project(con, res, id, project) {
	console.log("Inserting project with id: " + id);
	return new Promise(function(resolve, reject) {
		var name = project['Name'];
		var desc = project['Description'];
		var repo = project['RepoPath'];
		var img = project['ImgPath'];
		var syn = project['Synopsis'];
		var sql = "INSERT INTO projects(id,Name,Description,RepoPath,ImgPath,Synopsis) VALUES(" + id + ",'" + name + "','" + desc + "','" + repo + "','" + img + "','" + syn + "')"
		console.log("SQL script:");
		console.log(sql);
		con.query(sql, function(err) {
			if (err) {
				reject();
			} else {
				resolve();
			}
		});

	})
}

function delete_project(con, res, id) {
	return new Promise(function(resolve, reject) {
		con.query("DELETE FROM projects WHERE id=" + id, function(err) {
			if (err) {
				reject();
			} else {
				resolve();
			}
		});
	})
}


// some page functions


function fivehundred(res) {
	res.status(500);
	res.render("500", {});
}

function get_admin(con, res) {
	console.log("Getting admin");
	get_projects(con, res).then(
		result => {
			console.log("Got page");
			console.log(result);
			res.render('admin', {
				"records": result
			})
		},
		error => fivehundred(res)
	)
}