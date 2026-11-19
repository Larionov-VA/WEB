const shelf = document.getElementById('shelf');
// фильтры
const checkPresent = document.getElementById('only-present');
const inputDue = document.getElementById('due-before');

// при изменении фильтра запрашиваем список
checkPresent.addEventListener('change', refreshShelf);
inputDue.addEventListener('change', refreshShelf);


async function refreshShelf() {
    const params = new URLSearchParams();
    if (checkPresent.checked) {
        params.set('present', 'true');
    }
    if (inputDue.value) {
        params.set('dueBefore', inputDue.value);
    }

    const response = await fetch('/api/books?' + params.toString());
    const books = await response.json();
    drawShelf(books);
}


function drawShelf(books) {
    shelf.innerHTML = '';
    if (books.length === 0) {
        shelf.innerHTML = '<p class="empty-note">По заданным фильтрам книг не найдено.</p>';
        return;
    }
    books.forEach(book => {
        const row = document.createElement('div');
        row.className = 'shelf-row';
        let tag = '<span class="tag tag-free">в наличии</span>';
        if(!book.available) {
            tag = `<span class="tag tag-busy">у читателя до ${book.dueDate}</span>`;
        }
        row.innerHTML = `
            <div>
                <h3>${book.title}</h3>
                <p>${tag}</p>
                <p><i class="fa-solid fa-user-pen"></i> ${book.author}
                   &nbsp; <i class="fa-solid fa-calendar-days"></i> ${book.year || 'год не указан'}</p>
            </div>
            <div class="row-actions">
                <a class="btn btn-blue" href="/book/${book.id}"><i class="fa-solid fa-pen"></i> Открыть</a>
                <button class="btn btn-red" onclick="removeBook(${book.id})"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
        shelf.appendChild(row);
    });
}


async function createBook() {
    await fetch('/api/books', { method: 'POST' });
    refreshShelf();
}


async function removeBook(id) {
    if (!confirm('Удалить книгу из библиотеки?')) {
        return;
    }
    await fetch(`/api/books/${id}`, { method: 'DELETE' });
    refreshShelf();
}

refreshShelf();