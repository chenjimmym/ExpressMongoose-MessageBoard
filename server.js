var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
var path = require('path');
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/message_board_db');
mongoose.Promise = global.Promise;

var Schema = mongoose.Schema;

var PostSchema = new mongoose.Schema({
    name: {type: String, required: true},
    message: {type: String, required: true},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true});

var CommentSchema = new mongoose.Schema({
    _post: {type: Schema.Types.ObjectId, ref: 'Post'},
    name: {type: String, required: true},
    message: {type: String, required: true}
}, {timestamps: true});

var Post = mongoose.model('Post', PostSchema);
var Comment = mongoose.model('Comment', CommentSchema);

app.get('/', function(req, res) {
    Post.find({}).populate('comments').exec(function(error, posts){
        // console.log(posts[0]);
        res.render('index', {posts: posts});
    })
});

app.post('/addPost', function(req, res) {
    console.log(req.body);
    var post = new Post({name: req.body.name, message: req.body.message});
    post.save(function(error){
        if (error) {
            console.log('error from addind');
        } else {
            console.log('Add Success');
            res.redirect('/');
        }
    })
});

app.post('/addComment/:id', function(req, res) {
    console.log(req.params.id);
    Post.findOne({_id: req.params.id}, function(error, post){
        var comment = new Comment({name: req.body.name, message: req.body.message});
        comment._post = post._id;
        comment.save(function(error){
            if (error) {
                console.log(error);
            } else {
                console.log(post);
                post.comments.push(comment);
                post.save(function(error){
                    if (error) {
                        console.log('Add comment error');
                    } else {
                        res.redirect('/');
                    }
                })
            }
        })
    })
});

app.listen(8000, function(){
    console.log('listenning on 8000');
})