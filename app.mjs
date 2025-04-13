import Game from './models/Game.mjs';

let games = [];

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

function renderGames() {
    const container = document.getElementById('gameContainer');
    container.innerHTML = '';
    
    for (let i = 0; i < games.length; i++) {
        const game = games[i];
        const gameDiv = document.createElement('div');
        gameDiv.className = 'game-record';
        gameDiv.innerHTML = `
            <h2>${game.title}</h2>
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
        
        container.appendChild(gameDiv);
    }
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

export { saveGame, locateGames, exportGamesAsJSON, importGamesFromJSON, games };

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        loadGamesIntoMemory();
        renderGames();
        setupAddGameForm();
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