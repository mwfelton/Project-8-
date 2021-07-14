var express = require('express');
var router = express.Router();

const Book = require('../models').Book;

function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      res.status(500).send(error);
    }
  }
}

router.get('/', asyncHandler(async (req, res) => {
  const bookList = await Book.findAll();
  res.render('/index', {bookList, title: 'My Lovely Library'});
}));

// router.get('/books', asyncHandler(async (req, res) => {
//   const bookList = await Book.findAll()
//   res.render('index', {bookList, title: "The Library"});
// }));

router.get('/books/new', asyncHandler(async (req, res) => {
  res.render('new-book')
}));

router.post('/books/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book= await Book.create(req.body);
    res.redirect('/books')
  } catch (error) {
    if(error.name === 'SequelizeVlaidationError') {
      console.log(req.body);
      book = await Book.build(req.body);
      res.render('new-book', {book, errors: error.errors})
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


