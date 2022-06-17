const path = require('path');
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser')

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27018/RitaBlog', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let blogs = mongoose.model('blogs', new mongoose.Schema({
    _id: String,
    header: String,
    name: String,
    text: String,
    comments: [{
        name: String,
        text: String
    }]
}))

const app = express();
const PORT = 3000;

//используем парсер, чтоб из JSON сделать JS объект
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'static', 'views'));
app.use('/css',express.static(path.join(__dirname, 'static/styles/')));


app.get('/', (req, res) => {
    res.redirect('/posts');
})

app.get('/posts', async (req, res) => {
    let result = await blogs.find().exec();
    res.render('posts', {
        posts: result,
    })
})

app.get('/posts/:id', async (req, res) => {

    let result = await blogs.findById({_id: req.params.id}).exec();
    if(result == null)
        res.redirect('/error');

    let comment_url = '/posts/' + req.params.id + '/comments';

    res.render('article', {
        post_header: result.header,
        author: result.name,
        post_text: result.text,
        comments: result.comments,
        comment_url: comment_url
    })
})

app.get('/posts/:id/comments', async (req, res) => {
    let result = await blogs.findById({ _id: req.params.id }).exec();

    if(result == null)
        res.redirect('/error');

    res.render('comments', {
        comments: result.comments
    });
})

app.post('/posts/:id/comments', async (req, res) => {
    let id = req.params.id;
    let name = req.body.nickname;
    let text = req.body.mes;
    //возможность добавлять комментарии

    await blogs.findOneAndUpdate({_id: req.params.id}, {$push: { comments: {
                name: req.body.nickname,
                text: req.body.mes
            }}});

    res.redirect(`/posts/${id}/comments`);
})



app.get('/error', (req, res) => {

})

app.listen(PORT, () => {
    console.log(`Прослушиваю порт ${PORT}`);
})