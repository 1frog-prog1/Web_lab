const path = require('path');
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser')

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/JustForTest');

let Nums = mongoose.model('Nums', new mongoose.Schema({
    num: Number
}));

const app = express();
const PORT = 3000;

//используем парсер, чтоб из JSON сделать JS объект
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'static', 'views'));
app.use('/css',express.static(path.join(__dirname, 'static/styles/')));

let post_list = JSON.parse(fs.readFileSync(path.join(__dirname, 'sources', 'posts.json')))


app.get('/', (req, res) => {
    Nums.find({}).then(num => {
        console.log(num);
    })
    res.redirect('/posts');
})

app.get('/posts', (req, res) => {
    res.render('posts', {
        posts: post_list,
    })
})

app.get('/posts/:id', (req, res) => {
    let id = req.params.id;
    if (id >= post_list.length)
        res.redirect('/error');
    else {
        let comment_url = '/posts/' + id + '/comments';

        res.render('article', {
            post_header: post_list[id].header,
            author: post_list[id].name,
            post_text: post_list[id].text,
            comments: post_list[id].comments,
            comment_url: comment_url
        })
    }
})

app.get('/posts/:id/comments', (req, res) => {
    let id = req.params.id;
    if (id >= post_list.length)
        res.redirect('/error');
    else {
        res.render('comments', {
            comments: post_list[id].comments
        });
    }
})

app.post('/posts/:id/comments', (req, res) => {
    let id = req.params.id;
    let name = req.body.nickname;
    let text = req.body.mes;
    //возможность добавлять комментарии
    res.redirect(`/posts/${id}/comments`);
})



app.get('/error', (req, res) => {

})

app.listen(PORT, () => {
    console.log(`Прослушиваю порт ${PORT}`);
})