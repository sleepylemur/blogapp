var express = require('express');
var sqlite3 = require('sqlite3');
var bodyParser = require('body-parser');
var override = require('method-override');

var app = express();
app.use(override('_method'));
app.use(bodyParser.urlencoded({extended:false}));
app.use('/public',express.static(__dirname + "/public"));

var db = new sqlite3.Database('blog.db');


// front page - list of article summaries with links to the full-length articles
app.get("/", function(req,res) {
  res.redirect("/articles");
});
app.get("/articles", function(req,res) {
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
      db.all("SELECT * FROM comments WHERE article_id = ?", req.params.id, function(err,comment_data) {
        res.render("article.ejs",{article:article_data, sections: section_data, comments: parseComments(comment_data)});
      });
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

// update article visibility
app.put("/article/:id/visible", function(req,res) {
  db.run("UPDATE articles SET visible = ? WHERE id = ?", req.body.visible, req.params.id, function(err) {
    if (err) throw(err);
    res.redirect("/articles/edit");
  });
});

// delete article
app.delete("/article/:id", function(req,res) {
  db.run("DELETE FROM articles WHERE id = ?", req.params.id, function(err) {
    if (err) throw(err);
    res.redirect("/articles/edit");
  });
});

// new article -- this is the wrong RESTful type at the moment
app.get("/articles/new", function(req,res) {
  db.run("INSERT INTO articles (title, summary, image_url, visible, created) VALUES ('','','',0,'')", function(err) {
    if (err) throw(err);
    res.redirect("/article/"+this.lastID+"/edit");
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

// delete section
app.delete("/article/:article_id/section/:section_id", function(req,res) {
  db.run("DELETE FROM sections WHERE id = ?", req.params.section_id, function(err) {
    if (err) throw(err);
    res.redirect("/article/"+req.params.article_id+"/edit");
  });
});

// post or update comments
app.post("/article/:id/comments", function(req,res) {
  // if comment_id is 0 than this is a new comment, otherwise do an update
  if (req.body.comment_id == 0) {
    db.run("INSERT INTO comments (article_id, body, parent_comment, user_handle) VALUES (?,?,?,?)",
      req.params.id, req.body.comment, req.body.parent_comment, req.body.handle, function(err) {
        if (err) throw(err);
        res.redirect("/article/"+req.params.id);
      });
  } else {
    db.run("UPDATE comments SET article_id = ?, body = ?, parent_comment = ?, user_handle = ? WHERE id = ?",
      req.params.id, req.body.comment, req.body.parent_comment, req.body.handle, req.body.comment_id,
      function(err) {
        if (err) throw(err);
        res.redirect("/article/"+req.params.id);
      });
  }
});


app.listen(3000, function() {console.log("listening to port 3000");});

// turn database style comments into nested object
function parseComments(comments_db) {
  var comments = {};
  var toplevel = [];

  function Comment(id,handle,body,parent) {
    this.id = id;
    this.handle = handle;
    this.body = body;
    this.parent = parent;
    this.children = [];
  }

  for (var i = 0; i < comments_db.length; i++) {
    var cur_comment = new Comment(comments_db[i].id, comments_db[i].user_handle, comments_db[i].body, comments_db[i].parent_comment);
    // console.log(cur_comment + " parent "+ comments_db[i].parent_comment);
    comments[comments_db[i].id] = cur_comment;
    if (comments_db[i].parent_comment === 0) {
      toplevel.push(cur_comment);
    } else {
      comments[comments_db[i].parent_comment].children.push(cur_comment);
    }
  }
  // console.log(toplevel);
  return {db: comments, top: toplevel};
}





