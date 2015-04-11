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

// update article info
app.put("/article/:id", function(req,res) {
  db.run("UPDATE articles SET title = ?, summary = ?, image_url = ?, created = ? WHERE id = ?",
    req.body.title, req.body.summary, req.body.image_url, req.body.created, req.params.id,
    function(err) {
      if (err) throw(err);
      res.redirect("/article/"+req.params.id+"/edit");
    });
});

// update section info
app.put("/article/:article_id/section/:section_id", function(req,res) {
  db.run("UPDATE sections SET body = ?, image_url = ?, image_position = ? WHERE id = ?",
    req.body.body, req.body.image_url, req.body.image_position, req.params.section_id,
    function (err) {
      if (err) throw(err);
      res.redirect("/article/"+req.params.article_id+"/edit");
    });
});

// add new blank section
app.post("/article/:article_id/sections", function(req,res) {
  db.run("INSERT INTO sections (article_id,body,image_url,image_position) VALUES (?,'','',0)", req.params.article_id, function(err) {
    if (err) throw(err);
    res.redirect("/article/"+req.params.article_id+"/edit");
  });
});


app.listen(3000, function() {console.log("listening to port 3000");});











