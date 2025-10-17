(function () {
    function safeParseFieldSize(fieldSize) {
        if (typeof fieldSize === 'string') {
            const cleaned = fieldSize.replace(/\s+/g, '').toLowerCase();
            const parts = cleaned.split('x');
            if (parts.length === 2) {
                const rows = Number(parts[0]);
                const cols = Number(parts[1]);
                if (!Number.isNaN(rows) && !Number.isNaN(cols)) return { rows, cols };
            }
        }
        return null;
    }

    function calculateDifficulty(width, height, mines) {
        if (!width || !height) return "\u041d\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043d\u043e";
        const totalCells = width * height;
        const minePercentage = (mines / totalCells) * 100;

        if (minePercentage < 10) return "Супер легко";
        if (minePercentage < 15) return "Легко";
        if (minePercentage < 20) return "Просто";
        if (minePercentage < 25) return "Нормально";
        if (minePercentage < 30) return "Сложно";
        if (minePercentage < 35) return "Тяжело";
        return "Невозможно";
    }

    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatTime(seconds) {
        if (typeof seconds !== 'number' || Number.isNaN(seconds)) return '';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    }

    async function init() {
        let allResults = [];
        try {
            const resp = await fetch('/api/game/results');
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            const data = await resp.json();
            allResults = Array.isArray(data) ? data : [];

            console.log('Все результаты:', allResults);

        } catch (err) {
            console.error('leaderboard: ошибка загрузки результатов', err);
            allResults = [];
        }

        const tbody = document.querySelector('#leaderboard-table tbody');
        if (!tbody) {
            console.error('leaderboard: tbody не найден');
            return;
        }

        function renderTable(difficulty) {
            tbody.innerHTML = '';

            const filtered = allResults.filter(r => {
                try {
                    console.log('Проверяем запись:', r);

                    if (!r || !r.isWin) {
                        console.log('Пропускаем - не победа или пустая запись');
                        return false;
                    }

                    const parsed = safeParseFieldSize(r.fieldSize);
                    if (!parsed) {
                        console.log('Пропускаем - не удалось распарсить fieldSize:', r.fieldSize);
                        return false;
                    }

                    if (isNaN(parsed.rows) || isNaN(parsed.cols) || isNaN(r.minesCount)) {
                        console.warn('Некорректные данные в записи:', r);
                        return false;
                    }

                    const diff = calculateDifficulty(parsed.rows, parsed.cols, r.minesCount);
                    console.log('Вычисленная сложность:', diff, 'Ожидаемая:', difficulty);
                    return diff === difficulty;
                } catch (e) {
                    console.error('Ошибка при фильтрации записи:', e, r);
                    return false;
                }
            });

            console.log('Отфильтрованные результаты для сложности', difficulty, ':', filtered);

            filtered.sort((a, b) => (Number(a.timeSeconds) || 0) - (Number(b.timeSeconds) || 0));
            const top = filtered.slice(0, 10);

            if (top.length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = '<td colspan="5" class="no-data">Нет побед в этой сложности</td>';
                tbody.appendChild(tr);
                return;
            }

            for (const r of top) {
                const name = escapeHtml(r.playerName || 'Аноним');
                const time = formatTime(Number(r.timeSeconds));
                const field = escapeHtml(r.fieldSize || '');
                const mines = escapeHtml(String(r.minesCount ?? ''));
                const date = r.gameDate ? escapeHtml(new Date(r.gameDate).toLocaleString()) : '';
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${name}</td><td>${time}</td><td>${field}</td><td>${mines}</td><td>${date}</td>`;
                tbody.appendChild(tr);
            }
        }

        const buttons = Array.from(document.querySelectorAll('#difficulty-buttons button[data-difficulty]'));
        if (!buttons.length) {
            console.warn('leaderboard: кнопки выбора сложности не найдены (#difficulty-buttons button[data-difficulty])');
        } else {
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    buttons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    renderTable(btn.dataset.difficulty);
                });
            });
        }

        let defaultBtn = buttons.find(b => b.dataset.difficulty === 'Просто') || buttons[0];
        if (defaultBtn) {
            defaultBtn.classList.add('active');
            renderTable(defaultBtn.dataset.difficulty);
        } else {
            renderTable('Просто');
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
