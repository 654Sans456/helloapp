async function loadResults() {
    try {
        const response = await fetch('/api/game/results');
        const results = await response.json();

        const tbody = document.querySelector('#results-table tbody');
        tbody.innerHTML = '';

        results.forEach(result => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${result.playerName || 'Аноним'}</td>
                <td>${result.isWin ? 'Победа' : 'Поражение'}</td>
                <td>${result.timeSeconds} сек</td>
                <td>${result.fieldSize}</td>
                <td>${result.minesCount}</td>
                <td>${new Date(result.gameDate).toLocaleString()}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Ошибка загрузки результатов:', error);
        const tbody = document.querySelector('#results-table tbody');
        tbody.innerHTML = '<tr><td colspan="6">Не удалось загрузить результаты</td></tr>';
    }
}

loadResults();
