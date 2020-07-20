var mysql = require('mysql');

function login() {
	return mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'portfolio'
	});
}

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

function update_project(con, res, id, project) {
	return new Promise(function(resolve, reject) {
		console.log("Updating project");
		console.log(project);
		var name = project['Name'];
		console.log(name);
		var desc = project['Description'];
		console.log(desc);
		var repo = project['RepoPath'];
		console.log(repo);
		var img = project['ImgPath'];
		console.log(img);
		var syn = project['Synopsis'];
		console.log(syn);
		var sql = "UPDATE projects SET Name='" + name + "', Description='" + desc + "', RepoPath='" + repo + "', ImgPath='" + img + "', Synopsis='" + syn + "' WHERE id=" + id + "";
		console.log("SQL script:");
		console.log(sql);
		con.query(sql, function(err) {
			if (err) {
				reject();
			} else {
				resolve();
			}
		})
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

module.exports = {
	login,
	get_projects,
	get_max,
	insert_project,
	update_project,
	delete_project
}