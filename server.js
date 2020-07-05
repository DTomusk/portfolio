var mysql = require('mysql');
var http = require('http');

http.createServer(function(req, res) {
	res.write("Running");
	res.end()
}).listen(8888);

var con = mysql.createConnection({
	host: 'Mysql@localhost:3306',
	user: 'root',
	password: ''
});

con.connect(function(err) {
	if (err) throw err;
	console.log("Connected");
});