document.addEventListener('DOMContentLoaded', function () {
    let ROWS = 16;
    let COLS = 16;
    let TOTAL_MINES = 40;

    const gameBoard = document.getElementById('game-board');
    const restartBtn = document.getElementById('restart-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const resultsBtn = document.getElementById('results-btn');
    const flagsCountElement = document.getElementById('flags-count');
    const gameStatusElement = document.getElementById('game-status');
    const gameTimeElement = document.getElementById('game-time');

    const settingsModal = document.getElementById('settings-modal');
    const closeModal = document.querySelector('.close');
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const minesInput = document.getElementById('mines-input');
    const difficultyText = document.getElementById('difficulty-text');
    const applySettingsBtn = document.getElementById('apply-settings');

    let board = [];
    let mines = [];
    let revealedCount = 0;
    let flaggedCount = 0;
    let gameActive = true;
    let gameStartTime = null;
    let gameTimer = null;
    let firstClick = true;
    let firstClickRow = -1;
    let firstClickCol = -1;

    initSettingsHandlers();
    loadSettings();
    initGame();

    function initSettingsHandlers() {
        widthInput.addEventListener('input', function () {
            updateMinesMaxValue();
            updateDifficultyText();
        });

        heightInput.addEventListener('input', function () {
            updateMinesMaxValue();
            updateDifficultyText();
        });

        minesInput.addEventListener('input', function () {
            updateDifficultyText();
        });

        widthInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                applySettings();
            }
        });

        heightInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                applySettings();
            }
        });

        minesInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                applySettings();
            }
        });

        applySettingsBtn.addEventListener('click', applySettings);
    }

    function updateMinesMaxValue() {
        const width = parseInt(widthInput.value) || 16;
        const height = parseInt(heightInput.value) || 16;
        const maxMines = width * height - 1;

        minesInput.max = maxMines;

        const currentMines = parseInt(minesInput.value) || 40;
        if (currentMines > maxMines) {
            minesInput.value = maxMines;
            updateDifficultyText();
        }
    }

    function updateDifficultyText() {
        const width = parseInt(widthInput.value) || 16;
        const height = parseInt(heightInput.value) || 16;
        const mines = parseInt(minesInput.value) || 40;

        const currentDifficulty = calculateDifficulty(width, height, mines);
        difficultyText.textContent = currentDifficulty;

        const difficultyElement = document.querySelector('.difficulty-info');
        difficultyElement.classList.add('changed');

        setTimeout(() => {
            difficultyElement.classList.remove('changed');
        }, 300);
    }

    function calculateDifficulty(width, height, mines) {
        const totalCells = width * height;
        const minePercentage = (mines / totalCells) * 100;

        if (minePercentage < 10) {
            return "Супер легко";
        }
        if (minePercentage < 15) {
            return "Легко";
        }
        if (minePercentage < 20) {
            return "Просто";
        }
        if (minePercentage < 25) {
            return "Нормально";
        }
        if (minePercentage < 30) {
            return "Сложно";
        }
        if (minePercentage < 35) {
            return "Тяжело";
        }
        return "Невозможно";
    }

    function loadSettings() {
        const savedSettings = localStorage.getItem('minesweeperSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            ROWS = settings.rows || 16;
            COLS = settings.cols || 16;
            TOTAL_MINES = settings.mines || 40;

            widthInput.value = COLS;
            heightInput.value = ROWS;
            minesInput.value = TOTAL_MINES;

            updateMinesMaxValue();
            updateDifficultyText();
        }
    }

    function saveSettings() {
        const settings = {
            rows: ROWS,
            cols: COLS,
            mines: TOTAL_MINES
        };
        localStorage.setItem('minesweeperSettings', JSON.stringify(settings));
    }

    function applySettings() {
        const newWidth = parseInt(widthInput.value) || 16;
        const newHeight = parseInt(heightInput.value) || 16;
        const newMines = parseInt(minesInput.value) || 40;

        if (newWidth < 5) {
            widthInput.value = 5;
        }
        if (newHeight < 5) {
            heightInput.value = 5;
        }
        if (newMines < 1) {
            minesInput.value = 1;
        }

        if (newWidth > 30) {
            widthInput.value = 30;
        }
        if (newHeight > 30) {
            heightInput.value = 30;
        }

        const maxMines = (newWidth * newHeight) - 1;
        if (newMines > maxMines) {
            minesInput.value = maxMines;
        }

        COLS = parseInt(widthInput.value);
        ROWS = parseInt(heightInput.value);
        TOTAL_MINES = parseInt(minesInput.value);

        saveSettings();

        settingsModal.style.display = 'none';

        resetTimer();
        firstClick = true;
        firstClickRow = -1;
        firstClickCol = -1;
        initGame();
    }

    function initGame() {
        gameBoard.innerHTML = '';
        revealedCount = 0;
        flaggedCount = 0;
        gameActive = true;
        flagsCountElement.textContent = TOTAL_MINES;
        gameStatusElement.textContent = 'Готов к игре';

        resetTimer();

        gameBoard.style.gridTemplateColumns = `repeat(${COLS}, 30px)`;

        board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
        mines = [];

        const maxMines = ROWS * COLS - 1;
        if (TOTAL_MINES > maxMines) {
            TOTAL_MINES = maxMines;
            minesInput.value = TOTAL_MINES;
            updateDifficultyText();
        }

        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell', 'hidden');
                cell.dataset.row = i;
                cell.dataset.col = j;

                const cellInner = document.createElement('div');
                cellInner.classList.add('cell-inner');

                const cellContent = document.createElement('div');
                cellContent.classList.add('cell-content');

                cellInner.appendChild(cellContent);
                cell.appendChild(cellInner);

                cell.addEventListener('click', function () {
                    if ((!gameActive) || (this.classList.contains('flag')) || (this.classList.contains('revealed'))) {
                        return;
                    }

                    const row = parseInt(this.dataset.row);
                    const col = parseInt(this.dataset.col);

                    if (firstClick) {
                        firstClick = false;
                        firstClickRow = row;
                        firstClickCol = col;
                        startTimer();

                        generateSafeBoard(row, col);
                    }

                    revealCell(row, col);
                });

                cell.addEventListener('contextmenu', function (e) {
                    e.preventDefault();
                    if ((!gameActive) || (this.classList.contains('revealed'))) {
                        return;
                    }

                    if (this.classList.contains('flag')) {
                        this.classList.remove('flag');
                        flaggedCount--;
                    }
                    else if (flaggedCount < TOTAL_MINES) {
                        this.classList.add('flag');
                        flaggedCount++;
                    }

                    flagsCountElement.textContent = TOTAL_MINES - flaggedCount;

                    checkWin();
                });

                cell.addEventListener('dblclick', function () {
                    if ((!gameActive) || (!this.classList.contains('revealed')) || (this.classList.contains('flag'))) {
                        return;
                    }

                    const row = parseInt(this.dataset.row);
                    const col = parseInt(this.dataset.col);

                    if ((typeof board[row][col] === 'number') && (board[row][col] > 0)) {
                        openNeighborsIfFlagged(row, col);
                    }
                });

                gameBoard.appendChild(cell);
            }
        }
    }

    function generateSafeBoard(safeRow, safeCol) {
        const safeZone = [];
        for (let r = Math.max(0, safeRow - 1); r <= (Math.min(ROWS - 1, safeRow + 1)); r++) {
            for (let c = Math.max(0, safeCol - 1); c <= (Math.min(COLS - 1, safeCol + 1)); c++) {
                safeZone.push({ row: r, col: c });
            }
        }

        let minesPlaced = 0;
        while (minesPlaced < TOTAL_MINES) {
            const row = Math.floor(Math.random() * ROWS);
            const col = Math.floor(Math.random() * COLS);

            const isInSafeZone = safeZone.some(zone => (zone.row === row) && (zone.col === col));

            if ((!isInSafeZone) && (board[row][col] !== 'X')) {
                board[row][col] = 'X';
                mines.push({ row, col });
                minesPlaced++;

                for (let r = Math.max(0, row - 1); r <= (Math.min(ROWS - 1, row + 1)); r++) {
                    for (let c = Math.max(0, col - 1); c <= (Math.min(COLS - 1, col + 1)); c++) {
                        const isInSafeZoneUpdate = safeZone.some(zone => (zone.row === r) && (zone.col === c));
                        if ((!isInSafeZoneUpdate) && (board[r][c] !== 'X') && (typeof board[r][c] === 'number')) {
                            board[r][c]++;
                        }
                    }
                }
            }
        }

        for (const zone of safeZone) {
            if (board[zone.row][zone.col] !== 'X') {
                let mineCount = 0;

                for (let r = Math.max(0, zone.row - 1); r <= (Math.min(ROWS - 1, zone.row + 1)); r++) {
                    for (let c = Math.max(0, zone.col - 1); c <= (Math.min(COLS - 1, zone.col + 1)); c++) {
                        if (board[r][c] === 'X') {
                            mineCount++;
                        }
                    }
                }

                board[zone.row][zone.col] = mineCount;
            }
        }
    }

    function openNeighborsIfFlagged(row, col) {
        const cellValue = board[row][col];
        let flagCount = 0;

        for (let r = Math.max(0, row - 1); r <= (Math.min(ROWS - 1, row + 1)); r++) {
            for (let c = Math.max(0, col - 1); c <= (Math.min(COLS - 1, col + 1)); c++) {
                if ((r === row) && (c === col)) {
                    continue;
                }

                const neighborCell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                if (neighborCell && (neighborCell.classList.contains('flag'))) {
                    flagCount++;
                }
            }
        }

        if (flagCount === cellValue) {
            for (let r = Math.max(0, row - 1); r <= (Math.min(ROWS - 1, row + 1)); r++) {
                for (let c = Math.max(0, col - 1); c <= (Math.min(COLS - 1, col + 1)); c++) {
                    if ((r === row) && (c === col)) {
                        continue;
                    }

                    const neighborCell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                    if (neighborCell && (!neighborCell.classList.contains('flag')) && (!neighborCell.classList.contains('revealed'))) {
                        const nRow = parseInt(neighborCell.dataset.row);
                        const nCol = parseInt(neighborCell.dataset.col);
                        revealCell(nRow, nCol);
                    }
                }
            }
        }
    }

    function startTimer() {
        gameStartTime = Date.now();
        gameTimer = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        if (gameStartTime) {
            const elapsedSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
            gameTimeElement.textContent = elapsedSeconds;
        }
    }

    function resetTimer() {
        if (gameTimer) {
            clearInterval(gameTimer);
        }
        gameStartTime = null;
        gameTimeElement.textContent = '0';
    }

    function getGameTime() {
        if (gameStartTime) {
            return Math.floor((Date.now() - gameStartTime) / 1000);
        }
        return 0;
    }

    function revealCell(row, col) {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

        if (board[row][col] === 'X') {
            cell.classList.remove('hidden');
            cell.classList.add('revealed', 'mine');
            gameStatusElement.textContent = 'Игра окончена! Вы проиграли!';
            gameActive = false;
            clearInterval(gameTimer);
            revealAllMines();

            sendGameResult(false, getGameTime(), (COLS.toString() + "x" + ROWS.toString()), TOTAL_MINES);
        }
        else {
            cell.classList.remove('hidden');
            cell.classList.add('revealed');

            if (board[row][col] > 0) {
                cell.classList.add(getNumberClass(board[row][col]));
            }

            revealedCount++;

            if (board[row][col] === 0) {
                for (let r = Math.max(0, row - 1); r <= (Math.min(ROWS - 1, row + 1)); r++) {
                    for (let c = Math.max(0, col - 1); c <= (Math.min(COLS - 1, col + 1)); c++) {
                        const neighborCell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                        if ((neighborCell.classList.contains('hidden')) && (!neighborCell.classList.contains('flag'))) {
                            const nRow = parseInt(neighborCell.dataset.row);
                            const nCol = parseInt(neighborCell.dataset.col);
                            revealCell(nRow, nCol);
                        }
                    }
                }
            }

            checkWin();
        }
    }

    function getNumberClass(value) {
        const numberClasses = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
        return numberClasses[value - 1] || '';
    }

    function revealAllMines() {
        mines.forEach(mine => {
            const cell = document.querySelector(`.cell[data-row="${mine.row}"][data-col="${mine.col}"]`);
            if (!cell.classList.contains('flag')) {
                cell.classList.remove('hidden');
                cell.classList.add('revealed', 'mine');
            }
        });
    }

    function checkWin() {
        if (revealedCount === ((ROWS * COLS) - TOTAL_MINES)) {
            gameStatusElement.textContent = 'Поздравляем! Вы победили!';
            gameActive = false;
            clearInterval(gameTimer);

            mines.forEach(mine => {
                const cell = document.querySelector(`.cell[data-row="${mine.row}"][data-col="${mine.col}"]`);
                if (!cell.classList.contains('flag')) {
                    cell.classList.add('flag');
                }
            });

            sendGameResult(true, getGameTime(), (COLS.toString() + "x" + ROWS.toString()), TOTAL_MINES);
            return true;
        }
        return false;
    }

    restartBtn.addEventListener('click', function () {
        resetTimer();
        firstClick = true;
        firstClickRow = -1;
        firstClickCol = -1;
        initGame();
    });

    settingsBtn.addEventListener('click', function () {
        widthInput.value = COLS;
        heightInput.value = ROWS;
        minesInput.value = TOTAL_MINES;

        updateMinesMaxValue();
        updateDifficultyText();

        settingsModal.style.display = 'block';
    });

    resultsBtn.addEventListener('click', function () {
        window.location.href = 'resultsPlayng';
    });

    closeModal.addEventListener('click', function () {
        settingsModal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    async function sendGameResult(isWin, timeSeconds, fieldSize, minesCount) {
        try {
            const playerName = prompt('Введите своё имя для сохранения результата:') || 'Аноним';

            const response = await fetch('/api/game/results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerName: playerName,
                    isWin: isWin,
                    timeSeconds: timeSeconds,
                    fieldSize: fieldSize,
                    minesCount: minesCount
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Результат сохранен:', result);
            }
        }
        catch (error) {
            console.error('Ошибка при сохранении результата:', error);
        }
    }
});
