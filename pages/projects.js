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

function get_records(con) {
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

module.exports = {
	handle_records
};