//use path module
const path = require('path');
//use express module
const express = require('express');
//use hbs view engine
const hbs = require('hbs');
//use bodyParser middleware
const bodyParser = require('body-parser');
//use mysql database
const mysql = require('mysql');

//session
const expressSession = require('express-session');
const expressValidator = require('express-validator');
// const redis = require('redis');
// const redisStore = require('connect-redis')(session);
// const client  = redis.createClient();

const app = express();

// app.use(session({
// 	secret: 'secret',
// 	resave: true,
// 	saveUninitialized: true
// }));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
// app.use(expressValidator());
app.use(expressSession({
  secret : 'max',
  saveUninitialized: false,
  resave: false,
}));

//konfigurasi koneksi
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shahabah'
});
 
//connect ke database
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected...');
});
 
//set views file
app.set('views',path.join(__dirname,'views'));
//set view engine
app.set('view engine', 'hbs');
//set folder public sebagai static folder untuk static file
app.use('/assets',express.static(__dirname + '/public'));
 
//route untuk homepage
app.get('/',(req, res) => {
  let sql = "SELECT * FROM produk";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.render('index',{
      results: results
    });
  });
});

//route untuk login/dashboard
app.get('/app',(req, res) => {
  if (req.session.loggedin) {
    res.render('admin/dashboard',{
      id:req.session.id
    });
  } else {
    res.render('admin/login');
  }
});

app.get('/logout',(req, res) => {
  req.session.destroy();
  response.redirect('/app');
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		conn.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.id = results[0].id_admin;
				response.redirect('/app');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

//server listening
app.listen(8000, () => {
  console.log('Server is running at port 8000');
});