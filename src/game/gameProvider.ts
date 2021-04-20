const gameIdentifier = 'game-id'
const gameUrl = 'game-url'

const gameProvider = {
    getGameId: () => {
        const x = localStorage.getItem(gameIdentifier)
        return x
    },
    setupGame: (gameId: string, socketUrl: string) => {
        localStorage.setItem(gameIdentifier, gameId)
        localStorage.setItem(gameUrl, socketUrl)
    },
    getSocketUrl: () => {
        const x = localStorage.getItem(gameUrl)
        return x
    },
    clear: () => {
        localStorage.removeItem(gameIdentifier)
        localStorage.removeItem(gameUrl)
    },
}

export default gameProvider
