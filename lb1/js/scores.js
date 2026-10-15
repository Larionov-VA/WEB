const scores = JSON.parse(localStorage.getItem('tetris.scores') || '[]');
const table = document.getElementById('scoresTable');

if (scores.length === 0) {
    table.innerHTML = '<tr><td>Нет рекордов</td></tr>';
} else {
    table.innerHTML = `
        <tr>
            <th>#</th>
            <th>Имя</th>
            <th>Очки</th>
            <th>Дата</th>
        </tr>
    `;

    for (let i = 0; i < scores.length; i++) {
        const row = document.createElement('tr');
        const place = document.createElement('td');
        const name = document.createElement('td');
        const score = document.createElement('td');
        const date = document.createElement('td');

        place.textContent = i + 1;
        name.textContent = scores[i].name;
        score.textContent = scores[i].score;
        date.textContent = new Date(scores[i].date).toLocaleString();

        row.append(place, name, score, date);
        table.appendChild(row);
    }
}

const clearButton = document.getElementById('clearRecords');
clearButton.addEventListener('click', () => {
    localStorage.removeItem('tetris.scores');
    window.location.reload();
});

const backButton = document.getElementById('backToMenu');
backButton.addEventListener('click', () => {
    window.location.href = 'index.html';
});
