export class Game2024 {
    constructor() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.cells = [];
        this.initializeDOM();
        this.initializeEventListeners();
        this.startNewGame();
    }

    initializeDOM() {
        const gameGrid = document.getElementById('game-grid');
        gameGrid.innerHTML = '';
        
        // Create grid cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.className = 'aspect-square flex items-center justify-center text-2xl font-bold rounded bg-gray-200 dark:bg-gray-600 transition-all duration-200';
                gameGrid.appendChild(cell);
                this.cells.push(cell);
            }
        }

        // Initialize new game button
        document.getElementById('new-game-btn').addEventListener('click', () => this.startNewGame());
    }

    initializeEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    this.move('up');
                    break;
                case 'ArrowDown':
                    this.move('down');
                    break;
                case 'ArrowLeft':
                    this.move('left');
                    break;
                case 'ArrowRight':
                    this.move('right');
                    break;
            }
        });

        // Touch controls
        let touchStartX = 0;
        let touchStartY = 0;
        
        const gameGrid = document.getElementById('game-grid');
        gameGrid.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault(); // Prevent scrolling while touching the game grid
        }, { passive: false });

        gameGrid.addEventListener('touchend', (e) => {
            if (this.gameOver) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // Require a minimum swipe distance
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) return;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) {
                    this.move('right');
                } else {
                    this.move('left');
                }
            } else {
                if (deltaY > 0) {
                    this.move('down');
                } else {
                    this.move('up');
                }
            }
            
            e.preventDefault();
        }, { passive: false });
    }

    startNewGame() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.addNewTile();
        this.addNewTile();
        this.updateDisplay();
    }

    addNewTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({i, j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const {i, j} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[i][j] = Math.random() < 0.9 ? 2 : 4;
            
            // Add animation class to new tile
            const cell = this.cells[i * 4 + j];
            cell.classList.add('scale-0');
            setTimeout(() => cell.classList.remove('scale-0'), 0);
        }
    }

    move(direction) {
        const originalGrid = JSON.stringify(this.grid);
        
        switch(direction) {
            case 'up':
                this.moveUp();
                break;
            case 'down':
                this.moveDown();
                break;
            case 'left':
                this.moveLeft();
                break;
            case 'right':
                this.moveRight();
                break;
        }
        
        if (originalGrid !== JSON.stringify(this.grid)) {
            this.addNewTile();
            this.updateDisplay();
            this.checkGameOver();
        }
    }

    moveLeft() {
        for (let i = 0; i < 4; i++) {
            let row = this.grid[i].filter(x => x !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                }
            }
            while (row.length < 4) row.push(0);
            this.grid[i] = row;
        }
    }

    moveRight() {
        for (let i = 0; i < 4; i++) {
            let row = this.grid[i].filter(x => x !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j - 1, 1);
                    j--;
                }
            }
            while (row.length < 4) row.unshift(0);
            this.grid[i] = row;
        }
    }

    moveUp() {
        for (let j = 0; j < 4; j++) {
            let column = [];
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i + 1, 1);
                }
            }
            while (column.length < 4) column.push(0);
            for (let i = 0; i < 4; i++) {
                this.grid[i][j] = column[i];
            }
        }
    }

    moveDown() {
        for (let j = 0; j < 4; j++) {
            let column = [];
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i - 1, 1);
                    i--;
                }
            }
            while (column.length < 4) column.unshift(0);
            for (let i = 0; i < 4; i++) {
                this.grid[i][j] = column[i];
            }
        }
    }

    getTileColor(value) {
        const colors = {
            2: { bg: 'bg-yellow-100', text: 'text-gray-700' },
            4: { bg: 'bg-yellow-200', text: 'text-gray-700' },
            8: { bg: 'bg-orange-300', text: 'text-white' },
            16: { bg: 'bg-orange-400', text: 'text-white' },
            32: { bg: 'bg-orange-500', text: 'text-white' },
            64: { bg: 'bg-orange-600', text: 'text-white' },
            128: { bg: 'bg-yellow-300', text: 'text-white' },
            256: { bg: 'bg-yellow-400', text: 'text-white' },
            512: { bg: 'bg-yellow-500', text: 'text-white' },
            1024: { bg: 'bg-yellow-600', text: 'text-white' },
            2048: { bg: 'bg-yellow-700', text: 'text-white' }
        };
        return colors[value] || { bg: 'bg-yellow-700', text: 'text-white' };
    }

    updateDisplay() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const value = this.grid[i][j];
                const cell = this.cells[i * 4 + j];
                
                // Reset classes
                cell.className = 'aspect-square flex items-center justify-center text-2xl font-bold rounded transition-all duration-200';
                
                if (value === 0) {
                    cell.textContent = '';
                    cell.classList.add('bg-gray-200', 'dark:bg-gray-600');
                } else {
                    cell.textContent = value;
                    const { bg, text } = this.getTileColor(value);
                    cell.classList.add(bg, text);
                    
                    // Adjust font size for larger numbers
                    if (value > 512) {
                        cell.classList.remove('text-2xl');
                        cell.classList.add('text-xl');
                    }
                    if (value > 1024) {
                        cell.classList.remove('text-xl');
                        cell.classList.add('text-lg');
                    }
                }
            }
        }
        
        document.getElementById('game-score').textContent = this.score;
    }

    checkGameOver() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) return; // Still has empty cells
                
                // Check adjacent cells
                if (i < 3 && this.grid[i][j] === this.grid[i + 1][j]) return;
                if (j < 3 && this.grid[i][j] === this.grid[i][j + 1]) return;
            }
        }
        
        this.gameOver = true;
        
        // Show game over message with animation
        const gameContainer = document.querySelector('.game-container');
        const overlay = document.createElement('div');
        overlay.className = 'absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg opacity-0 transition-opacity duration-500';
        overlay.innerHTML = `
            <div class="text-white text-center">
                <h2 class="text-2xl font-bold mb-2">Game Over!</h2>
                <p class="text-xl">Final Score: ${this.score}</p>
            </div>
        `;
        gameContainer.style.position = 'relative';
        gameContainer.appendChild(overlay);
        
        // Trigger animation
        setTimeout(() => overlay.classList.add('opacity-100'), 0);
    }
} 