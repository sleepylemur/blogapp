var express = require('express');
var sqlite3 = require('sqlite3');
var bodyParser = require('body-parser');
var override = require('method-override');

var app = express();
app.use(override('_method'));
app.use(bodyParser.urlencoded({extended:false}));

var db = new sqlite3.Database('blog.db');


// front page - list of article summaries with links to the full-length articles
app.get("/", function(req,res) {
  db.all("SELECT * FROM articles", function(err,data) {
    // console.log(data);
    if (err) throw err;
    else res.render("articles.ejs",{articles: data});
  });
});

// read a specific article
app.get("/article/:id", function(req,res) {
  db.get("SELECT * FROM articles WHERE id = ?", req.params.id, function(err,article_data) {
    db.all("SELECT * FROM sections WHERE article_id = ?", req.params.id, function(err,section_data) {
      res.render("article.ejs",{article:article_data, sections: section_data});
    });
  });
});

// edit list of articles
app.get("/articles/edit", function(req,res) {
  db.all("SELECT * FROM articles", function(err,data) {
    if (err) throw err;
    else res.render("articles_edit.ejs",{articles: data});
  });
});

// edit specific article
app.get("/article/:id/edit", function(req,res) {
  db.get("SELECT * FROM articles WHERE id = ?", req.params.id, function(err,article_data) {
    db.all("SELECT * FROM sections WHERE article_id = ?", req.params.id, function(err,section_data) {
      res.render("article_edit.ejs",{article:article_data, sections: section_data});
    });
  });
});


app.listen(3000, function() {console.log("listening to port 3000");});