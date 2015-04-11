app.post('/posts', function(req, res) {
    db.run("INSERT INTO posts (title, body, image) VALUES (?, ?, ?);", req.body.title, req.body.body, req.body.image, function(err) {
        var id = this.lastID
        if (req.body.giphy != "") {
            request('http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=' + req.body.giphy, function(err, response, body) {
                var giphy = JSON.parse(body).data.image_url
                db.run("UPDATE posts SET giphy = ? WHERE id = ?;", giphy, id)
            })
        }
        if (req.body.instagram != "") {
            fs.readFile('secrets.json', function(err, data) {
                if (err) {
                    throw err
                } else {
                    request('https://api.instagram.com/v1/tags/hedgehog/media/recent?client_id=56d7c37949824d8a9cf3d465255f41f7', function(err, response, body) {
                            var instagram = JSON.parse(body).data[Math.floor(Math.random()*JSON.parse(body).data.length)].images.standard_resolution.url
                            db.run("UPDATE posts SET instagram = ? WHERE id = ?;", instagram, id)
                    })
                }
            })
        }
        res.redirect('/posts')
    })
})