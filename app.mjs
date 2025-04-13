import Game from './models/Game.mjs';

let games = [];

let currentSort = {
    field: 'title',
    ascending: true
};

function saveGame(game) {
    const key = `game_${game.title.replace(/\s+/g, '_')}`;
    localStorage.setItem(key, JSON.stringify(game));
    const existingIndex = games.findIndex(g => g.title === game.title);
    if (existingIndex >= 0) {
        games[existingIndex] = game;
    } else {
        games.push(game);
    }
    return true;
}

function locateGames() {
    const games = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('game_')) {
            const gameData = localStorage.getItem(key);
            const gameObj = JSON.parse(gameData);
            const game = new Game(
                gameObj.title,
                gameObj.designer,
                gameObj.artist,
                gameObj.publisher,
                gameObj.year,
                gameObj.players,
                gameObj.time,
                gameObj.difficulty,
                gameObj.url,
                gameObj.playCount,
                gameObj.personalRating
            );
            
            games.push(game);
        }
    }
    return games;
}

function exportGamesAsJSON() {
    return JSON.stringify(locateGames(), null, 2);
}

function importGamesFromJSON(jsonString) {
    const gamesArray = JSON.parse(jsonString);
    let count = 0;
    
    gamesArray.forEach(gameData => {
        const game = new Game(
            gameData.title,
            gameData.designer,
            gameData.artist,
            gameData.publisher,
            gameData.year,
            gameData.players,
            gameData.time,
            gameData.difficulty,
            gameData.url,
            gameData.playCount,
            gameData.personalRating
        );
        
        saveGame(game);
        count++;
    });
    renderGames();
    return `Imported ${count} games`;
}

function importFromFile(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const jsonString = event.target.result;
        const result = importGamesFromJSON(jsonString);
        console.log(result);
    };
    reader.onerror = function() {
        console.error('Error reading file');
    };
    reader.readAsText(file);
}

function loadGamesIntoMemory() {
    games = locateGames();
}

function sortGames(gamesArray) {
    const sortedGames = [...gamesArray];
    sortedGames.sort((a, b) => {
        let valueA, valueB;
        switch (currentSort.field) {
            case 'title':
                valueA = a.title.toLowerCase();
                valueB = b.title.toLowerCase();
                break;
            case 'players':
                valueA = parseInt(a.players.match(/\d+/)[0] || 0);
                valueB = parseInt(b.players.match(/\d+/)[0] || 0);
                break;
            case 'difficulty':
                const difficultyOrder = {
                    'Light': 1,
                    'Medium-Light': 2,
                    'Medium': 3,
                    'Medium-Heavy': 4,
                    'Heavy': 5
                };
                valueA = difficultyOrder[a.difficulty] || 0;
                valueB = difficultyOrder[b.difficulty] || 0;
                break;
            case 'playCount':
                valueA = a.playCount;
                valueB = b.playCount;
                break;
            case 'personalRating':
                valueA = a.personalRating;
                valueB = b.personalRating;
                break;
            default:
                valueA = a.title.toLowerCase();
                valueB = b.title.toLowerCase();
        }
        if (currentSort.ascending) {
            return valueA > valueB ? 1 : -1;
        } else {
            return valueA < valueB ? 1 : -1;
        }
    });
    return sortedGames;
}

function renderGames() {
    const container = document.getElementById('gameContainer');
    container.innerHTML = '';
    const sortedGames = sortGames(games);
    
    for (let i = 0; i < sortedGames.length; i++) {
        const game = sortedGames[i];
        const gameDiv = document.createElement('div');
        gameDiv.className = 'game-record';
        gameDiv.innerHTML = `
            <div class="game-header">
                <h2>${game.title}</h2>
                <button class="delete-button">Delete</button>
            </div>
            <div class="game-details">
                <div class="game-information">
                    <p><strong>Designer:</strong> ${game.designer}</p>
                    <p><strong>Artist:</strong> ${game.artist}</p>
                    <p><strong>Publisher:</strong> ${game.publisher}</p>
                    <p><strong>Year:</strong> ${game.year}</p>
                    <p><strong>Players:</strong> ${game.players}</p>
                    <p><strong>Play Time:</strong> ${game.time}</p>
                    <p><strong>Difficulty:</strong> ${game.difficulty}</p>
                    <p><a href="${game.url}" target="_blank">View on BoardGameGeek</a></p>
                </div>
                <div class="game-stats">
                    <div class="play-counter">
                        <p><strong>Play Count:</strong> <span class="play-count-value">${game.playCount}</span></p>
                        <button class="play-button">+</button>
                    </div>
                    <div class="rating-section">
                        <p><strong>Rating:</strong> <span class="rating-value">${game.personalRating}</span>/10</p>
                        <input type="range" min="0" max="10" value="${game.personalRating}" class="rating-slider">
                    </div>
                </div>
            </div>
        `;
        
        const playButton = gameDiv.querySelector('.play-button');
        playButton.addEventListener('click', function() {
            game.playCount++;
            gameDiv.querySelector('.play-count-value').textContent = game.playCount;
            saveGame(game);
        });

        const ratingSlider = gameDiv.querySelector('.rating-slider');
        ratingSlider.addEventListener('input', function() {
            game.personalRating = parseInt(ratingSlider.value);
            gameDiv.querySelector('.rating-value').textContent = game.personalRating;
            saveGame(game);
        });

        const deleteButton = gameDiv.querySelector('.delete-button');
        deleteButton.addEventListener('click', function() {
            if (confirm(`Do you want to delete "${game.title}"?`)) {
                deleteGame(game.title);
                renderGames();
            }
        });
        
        container.appendChild(gameDiv);
    }
}

function deleteGame(title) {
    const key = `game_${title.replace(/\s+/g, '_')}`;
    localStorage.removeItem(key);
    const index = games.findIndex(game => game.title === title);
    if (index !== -1) {
        games.splice(index, 1);
    }
    return true;
}

function setupAddGameForm() {
    const addGameForm = document.getElementById('addGameForm');
    const ratingSlider = document.getElementById('gameRating');
    const ratingDisplay = document.getElementById('ratingDisplay');

    if (ratingSlider && ratingDisplay) {
        ratingSlider.addEventListener('input', function() {
            ratingDisplay.textContent = this.value;
        });
    }
    
    if (addGameForm) {
        addGameForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const title = document.getElementById('gameTitle').value.trim();
            const designer = document.getElementById('gameDesigner').value.trim();
            const artist = document.getElementById('gameArtist').value.trim();
            const publisher = document.getElementById('gamePublisher').value.trim();
            const year = parseInt(document.getElementById('gameYear').value);
            const players = document.getElementById('gamePlayers').value.trim();
            const time = document.getElementById('gameTime').value.trim();
            const difficulty = document.getElementById('gameDifficulty').value;
            const url = document.getElementById('gameURL').value.trim();
            const personalRating = parseInt(document.getElementById('gameRating').value);
            const newGame = new Game(
                title,
                designer,
                artist,
                publisher,
                year,
                players,
                time,
                difficulty,
                url,
                0,
                personalRating
            );
            
            saveGame(newGame);
            renderGames();
            addGameForm.reset();
            ratingDisplay.textContent = "0";
            alert(`Game "${title}" added`);
        });
    }
}

function setupSorting() {
    const sortButtons = document.querySelectorAll('.sort-button');
    
    sortButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sortField = this.getAttribute('data-sort');
            if (currentSort.field === sortField) {
                currentSort.ascending = !currentSort.ascending;
            } else {
                currentSort.field = sortField;
                currentSort.ascending = true;
            }
            sortButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            renderGames();
        });
    });
    const defaultButton = document.querySelector(`.sort-button[data-sort="${currentSort.field}"]`);
    if (defaultButton) {
        defaultButton.classList.add('active');
    }
}

export { saveGame, locateGames, exportGamesAsJSON, importGamesFromJSON, deleteGame, games };

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        loadGamesIntoMemory();
        renderGames();
        setupAddGameForm();
        setupSorting();
        const importInput = document.getElementById('importSource');
        if (importInput) {
            importInput.addEventListener('change', function(event) {
                if (event.target.files.length > 0) {
                    const file = event.target.files[0];
                    importFromFile(file);
                }
            });
        }
        console.log(`There are currently ${games.length} games in the memory:`, games);
    });
}