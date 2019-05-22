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
  save(books);
  res.send(books);
});

app.get("/books/:id", (req, res) => {
  let books = fetchAll();
  let book = books.find(e => e.id === parseInt(req.params.id));
  if(!book) {
    res.send("該当idのデータが見つかりません。");
  }
  res.send(book);
});

app.post("/books/:id", (req, res) => {
  // 1. データ(course)を探す
  let books = fetchAll();
  let book = books.find(e => e.id === parseInt(req.params.id));
  if(!book) {
    res.send("該当idのデータが見つかりません。");
  }

  // 2. バリデーション
  let {error} = validate(req.body);
  if (error) {
    res.send(error.details[0].message);
  }

  // 3. データを編集し、結果を返す
  books.forEach(e => {
    if (e.id === parseInt(req.params.id)) {
      e.title = req.body.title;
      e.author = req.body.author;
      e.publisher = req.body.publisher;
      e.isbn = req.body.isbn;
      e.publishDate = req.body.publishDate;
    }
  });
  save(books);
  res.send(books);
});

app.delete("/books/:id", (req, res) => {
  // 1. 該当idのデータを検索
  let books = fetchAll();
  let book = books.find(e => e.id === parseInt(req.params.id));
  if(!book) {
    res.send("該当idのデータが見つかりません。");
  }
  // 2. 削除
  let index = books.indexOf(book);
  books.splice(index, 1);
  // 3. 結果を返す
  save(books);
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
