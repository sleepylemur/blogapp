var express = require('express');
var sqlite3 = require('sqlite3');
var bodyParser = require('body-parser');
var override = require('method-override');

var app = express();
app.use(override('_method'));
app.use(bodyParser.urlencoded({extended:false}));

var db = new sqlite3.Database('blog.db');



app.get("/", function(req,res) {
  res.render("articles.ejs");
});



app.listen(3000, function() {console.log("listening to port 3000");});