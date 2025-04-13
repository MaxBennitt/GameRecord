import Game from './models/Game.mjs';

function saveGame(game) {
    const key = `game_${game.title.replace(/\s+/g, '_')}`;
    localStorage.setItem(key, JSON.stringify(game));
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

export { saveGame, locateGames, exportGamesAsJSON, importGamesFromJSON };

const testGame = new Game(
    "Concordia",
    "Mac Gerdts",
    "Marina Fahrenbach",
    "PD-Verlag",
    2013,
    "2–5",
    "90 mins",
    "Medium",
    "https://boardgamegeek.com/boardgame/124361/concordia",
    44,
    9
);

saveGame(testGame);
console.log(locateGames());
console.log(exportGamesAsJSON());

const exampleJson = '[{"title":"Wingspan","designer":"Elizabeth Hargrave","artist":"Beth Sobel, Natalia Rojas, Ana Maria Martinez","publisher":"Stonemaier Games","year":2019,"players":"1–5","time":"40–70 mins","difficulty":"Medium","url":"https://boardgamegeek.com/boardgame/266192/wingspan","playCount":38,"personalRating":7}]';
console.log(importGamesFromJSON(exampleJson));