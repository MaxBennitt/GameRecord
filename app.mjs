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
        container.appendChild(gameDiv);
    }
}

export { saveGame, locateGames, exportGamesAsJSON, importGamesFromJSON };

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        loadGamesIntoMemory();
        renderGames();
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