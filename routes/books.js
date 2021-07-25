var express = require('express');
var router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const Book = require('../models').Book;

function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      console.log('Error: ', error);
      next(error)
    }
  }
}


// router.get('/', asyncHandler(async (req, res) => {
//   const bookList = await Book.findAll();
//   res.render('index', {bookList, title: 'My Lovely Library'});
// }));

//Pagination

router.get('/', asyncHandler(async (req, res) => {
  const page = req.query.page;
  !page || page <= 0 ? res.redirect("?page=1") : null;
  const booksPerPage = 10;
  const { count, rows } = await Book.findAndCountAll({
    order: [['title', 'ASC']],
    limit: booksPerPage,
    offset: (page - 1) * booksPerPage
  });
  const numOfPages = Math.ceil(count / booksPerPage);
  page > numOfPages ? res.redirect(`?page=${numOfPages}`) : null;
  let pageLinks = 1;
  res.render('index', {
    bookList: rows,
    title: 'My Lovely Books',
    numOfPages,
    pageLinks
  });
}));

// Search Functionality 

router.get('/search', asyncHandler(async (req, res) => {
  // const { term } = req.query
  const term = req.query.term.toLowerCase();
  let page = req.query.page;
  !page || page <= 0 ? res.redirect(`search?term=${term}&page=1`) : null;
  const booksPerPage = 10;
  const {count, rows} = await Book.findAndCountAll({
    where: {
      [Op.or]: [
        {
          title: {
            [Op.like]: `%${term}%` 
          }
        },
        {
          author: {
            [Op.like]: `%${term}%` 
          }
        },
        {
          genre: {
            [Op.like]: `%${term}%` 
          }
        },
        {
          year: {
            [Op.like]: `%${term}%` 
          }
        }
      ]
    },
    limit: booksPerPage,
    offset: (page - 1) * booksPerPage
  });
  if (count > 0) {
    let pageLinks = 1
    const numOfPages = Math.ceil(count / booksPerPage);
    page > numOfPages ? res.redirect(`?term=${term}&page=${numOfPages}`) : null;
  res.render('index', {
    bookList: rows,
    title: 'Search',
    numOfPages,
    term,
    pageLinks
  })
  console.log(term);
  } else {
    res.render("none-found", { term, title: "Search" });
  }
  })
);

//books/new/

router.get('/new', (req, res) => {
  res.render('new-book', { book: {}, title: "New Book"});
});

router.post('/new', asyncHandler(async (req, res) => {
  let book;
  try {
      book = await Book.create(req.body);
      res.redirect("/books/");
  } catch (error) {
      if(error.name === 'SequelizeValidationError') {
          book = await Book.build(req.body);
          res.render("new-book", {book, errors: error.errors})
      } else {
          // throw error;
      }
  }
}));

//books/:id/

router.get('/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("update-book", { book, title: "Updata a magical book" });
    } else {
      const error = new Error(`The book with the ID you requested (${req.params.id}) does not exist.`)
      error.status = 404;
      throw error;    
    }
}));

router.post('/:id', asyncHandler(async (req, res) => {
  let book;
  try {
      book = await Book.findByPk(req.params.id);
      if (book) {
          await book.update(req.body);
          res.redirect("/books");
      } else {
          throw error;
      }
   } catch (error) {
          if(error.name === "SequelizeValidationError") {
              book = await Book.build(req.body);
              book.id = req.params.id;
              res.render(`update-book`, {book, errors: error.errors, title: `Update Book` })
          } else {
              throw error;
          }
      }
}));

router.post('/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book){
    await book.destroy();
    res.redirect("/");
  } else {
    const error = new Error("The book you are looking for does not exist!")
    error.status = 404;
    throw error;
  }
}));


module.exports = router;


