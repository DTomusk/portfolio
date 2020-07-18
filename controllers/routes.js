var express = require('express'),
	router = express.Router(),
	db = require('../models/mysql.js');

router.route('/')
	.get((req, res) => {
		con = db.login();
		con.connect(function(err) {
			if (err) throw err;
			console.log("Connected to database")
		})
		console.log(req.body);
		db.get_projects(con, res).then(
			result => {
				res.render('index', {
					"records": result
				});
			},
			error => fivehundred(res)
		)
	})

router.route('/admin')
	.get((req, res) => {
		con = db.login();
		get_admin(con, res);
	})
	.post((req, res) => {
		con = db.login();
		con.connect(function(err) {
			if (err) throw err;
			console.log("Connected to database")
		})
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
		db.get_projects(con, res).then(
			result => {
				console.log("Successfully retrieved projects");
				db.get_max(result).then(
					result => {
						console.log("Successfully retrieved max id");
						db.insert_project(con, res, result, entry).then(
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

router.route('/admin/:id')
	.delete((req, res) => {
		con = db.login();
		con.connect(function(err) {
			if (err) throw err;
			console.log("Connected to database")
		})
		console.log(req.params.id);
		db.delete_project(con, res, req.params.id).then(
			result => get_admin(con, res),
			error => fivehundred(res)
		);
	})

function get_admin(con, res) {
	console.log("Getting admin");
	con = db.login();
	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected to database")
	})
	db.get_projects(con, res).then(
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

function fivehundred(res) {
	res.status(500);
	res.render("500", {});
}

module.exports = router