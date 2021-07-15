var express = require('express');
var router = express.Router();

const Book = require('../models').Book;

function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      // res.status(500).send(error);
      next(error)
    }
  }
}

router.get('/', asyncHandler(async (req, res) => {
  const bookList = await Book.findAll();
  res.render('index', {bookList, title: 'My Lovely Library'});
}));

//Create a new article form
router.get('/new', (req, res) => {
  res.render('new-book', { book: {}, title: "New Book"});
});

// router.post('/new', asyncHandler(async (req, res) => {
//   let book = await Book.create(req.body);
//   res.redirect("/books" + book.id);
// }));

router.post('/new', asyncHandler(async (req, res) => { //Why does the route have to be the root?
  let book;
  try {
      book = await Book.create(req.body);
      res.redirect("/books");
  } catch (error) {
      if(error.name === 'SequelizeValidationError') {
          console.log(req.body)
          book = await Book.build(req.body);
          res.render("books/new-book", {book, errors: error.errors})
      } else {
          throw error;
      }
  }
}));

// router.get('/books/:id', asyncHandler(async (req, res) => {
 
// }));

// router.post('/books/:id', asyncHandler(async (req, res) => {

// }));

// router.post('/books/:id/delete', asyncHandler(async (req, res) => {
  
// }));

module.exports = router;


