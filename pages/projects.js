var fs = require('fs'),
	jsdom = require('jsdom'),
	jquery = require('jquery');

function handle_records(con) {
	get_records(con).then(function(results) {
		write_records(results)
	}).catch(function(err) {
		console.log("Promise rejection: " + err);
	});
}

// it doesn't feel right that I'm passing the connection all the way down here
function get_records(con) {
	return new Promise(function(resolve, reject) {
		con.query("SELECT * FROM projects", function(err, result) {
			if (err) throw err;
			if (result === undefined) {
				reject(new Error("Result is undefined"));
			} else {
				resolve(result);
			}
		})
	})
}

// this function reads a file, makes a dom out of the html, manipulates the
// html by adding elements for each record and then writes that dom back to
// index.html
function write_records(records) {
	fs.readFile('pages/projects.html', 'utf8', (err, data) => {
		if (err) throw err;
		const dom = new jsdom.JSDOM(data);
		// $ is an alias to jQuery, $('body') is short for jquery(dom.window)('body')
		const $ = jquery(dom.window);

		$(".ProjectList").empty();

		Object.keys(records).forEach(function(key) {
			var row = records[key];
			console.log(row.Name);
			// current image not displaying correctly, also need to add image path to database
			$(".ProjectList").append('<li>\
                <h2>' + row.Name + '</h2>\
                <img src="file:///E:/ProgrammingBusiness/nodejs/portfolio/assets/happy.png" alt="Happiness">\
                <p>' + row.Description + '</p>\
                <a href=' + row.RepoPath + '>github</a>\
                </li> ');
		});

		fs.writeFile('pages/projects.html', dom.serialize(), err => {
			if (err) throw err;
		});
	});
}

module.exports = {
	handle_records
};