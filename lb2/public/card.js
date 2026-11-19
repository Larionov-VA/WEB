const dialog = document.getElementById('issue-dialog');

// открывает <dialog> как модальное окно
function showIssueDialog() {
    dialog.showModal();
}

function hideIssueDialog() {
    dialog.close();
}

// сохранение отредактированных полей (название, автор, год) через PUT
async function saveChanges(id) {
    const body = {
        title: document.getElementById('f-title').value,
        author: document.getElementById('f-author').value,
        year: document.getElementById('f-year').value
    };

    await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    alert('Изменения сохранены');
    window.location.href = '/';
}

// выдача книги: данные читателя из <dialog> отправляются одним PUT-запросом.
async function issueBook(id) {
    const borrower = document.getElementById('f-borrower').value.trim();
    const dueDate = document.getElementById('f-duedate').value;
    if (!borrower || !dueDate) {
        alert('Укажите имя читателя и дату возврата');
        return;
    }
    await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: false, borrower, dueDate })
    });
    window.location.reload();
}

// возврат книги: сбрасываем признак наличия и поля читателя/даты.
async function giveBack(id) {
    await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: true, borrower: null, dueDate: null })
    });
    window.location.reload();
}
