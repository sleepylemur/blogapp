var bodyParser = require('body-parser');
var express = require('express');
var app = new express();
app.use(bodyParser.urlencoded({extended:false}));

app.get("/", function(req,res) {
  res.render("ajaxtest.ejs");
});

app.post("/test", function(req,res) {
  // console.log(req.body);
  res.end("nice hat "+req.body.name);
});

app.listen(3000, function() {console.log("listening to port 3000");});