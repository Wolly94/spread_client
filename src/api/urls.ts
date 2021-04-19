const baseUrl = () => {
    'http://localhost:8080/'
}

const API_PATH = {
    getToken: baseUrl() + 'token',
    createGame: baseUrl() + 'create-game',
    getGameState: baseUrl() + 'game-state',
}

export default API_PATH
