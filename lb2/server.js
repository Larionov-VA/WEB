const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3200;

// состояние библиотеки лежит в JSON-файле на сервере.
const STORAGE_FILE = path.join(__dirname, 'data', 'library.json');

// в качестве шаблонизатора используется EJS.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


function loadLibrary() {
    try {
        return JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf-8'));
    } catch {
        return [];
    }
}


function saveLibrary(books) {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(books, null, 2), 'utf-8');
}


// главная страница со списком книг (рендерится через шаблон EJS).
app.get('/', (req, res) => {
    res.render('catalog');
});


// карточка отдельной книги. если id не найден -- 404.
app.get('/book/:id', (req, res) => {
    const book = loadLibrary().find(b => b.id === Number(req.params.id));
    if (!book) {
        return res.status(404).send('Книга с таким id не найдена');
    }
    res.render('card', { book });
});


// возвращает список книг
app.get('/api/books', (req, res) => {
    let books = loadLibrary();
    if (req.query.present === 'true') {
        books = books.filter(b => b.available);
    }
    if (req.query.dueBefore) {
        const limit = new Date(req.query.dueBefore);
        books = books.filter(b => !b.available && b.dueDate && new Date(b.dueDate) <= limit);
    }
    res.json(books);
});


// добавляет новую книгу
app.post('/api/books', (req, res) => {
    const books = loadLibrary();
    const created = {
        id: Date.now(),
        title: req.body.title || 'Без названия',
        author: req.body.author || 'Автор не указан',
        year: null,
        available: true,
        borrower: null,
        dueDate: null
    };
    books.push(created);
    saveLibrary(books);
    res.status(201).json(created);
});


// частично обновляет книгу: и редактирование полей, и выдача/возврат
app.put('/api/books/:id', (req, res) => {
    const books = loadLibrary();
    const index = books.findIndex(b => b.id === Number(req.params.id));
    if (req.body.year !== undefined && req.body.year !== null && req.body.year !== '') {
        year = Number(req.body.year);
        const currentYear = new Date().getFullYear();
        if (!Number.isInteger(year) || year < -3000 || year > currentYear || year === 0) {
            return res.status(400).json({
                message: `Год должен быть целым числом от -3000 до ${currentYear}, без нулевого года (отрицательные -- до н. э.)`
            });
        }
    }
    if (index === -1) {
        return res.status(404).json({ message: 'Книга не найдена' });
    }
    books[index] = { ...books[index], ...req.body };
    saveLibrary(books);
    res.json(books[index]);
});


// удаляет книгу. подтверждение удаления на стороне клиента.
app.delete('/api/books/:id', (req, res) => {
    const rest = loadLibrary().filter(b => b.id !== Number(req.params.id));
    saveLibrary(rest);
    res.json({ ok: true });
});


app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
