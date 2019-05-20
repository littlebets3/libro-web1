const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const Joi = require("joi");
const fs = require('fs');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

let fetchAll = () => {
  try {
    let booksString = fs.readFileSync("books-data.json");
    return JSON.parse(booksString);
  } catch (e) {
    return [];
  }
};

let save = books => {
  fs.writeFileSync("books-data.json", JSON.stringify(books));
};

app.get("/books", (req, res) => {
  let books = fetchAll();
  res.send(books);
});

app.post("/books", (req, res) => {
  let {error} = validate(req.body);
  if (error) {
    res.send(error.details[0].message);
  }

  let books = fetchAll();

  let book = {
    id: books.length + 1,
    title: req.body.title,
    author: req.body.author,
    publisher: req.body.publisher,
    isbn: req.body.isbn,
    publishDate: req.body.publishDate
  };

  books.push(book);
  save(book);
  res.send(books);
});

app.listen(port, () => {
  console.log(`ポート番号${port}で立ち上がりました。`);
});

function validate(book) {
  const schema = {
    title: Joi.string().required(),
    author: Joi.string().required(),
    publisher: Joi.string().required(),
    isbn: Joi.string().required(),
    publishDate: Joi.string().required()
  };
  return Joi.validate(book, schema);
}
