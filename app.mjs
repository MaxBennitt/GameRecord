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
    console.log(`Loaded ${games.length} games into memory`);
}

export { saveGame, locateGames, exportGamesAsJSON, importGamesFromJSON };

if (typeof window !== 'undefined') {
    loadGamesIntoMemory();
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
}