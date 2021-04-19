const gameIdentifier = 'game-id'

const gameProvider = {
    getGameId: () => {
        const x = localStorage.getItem(gameIdentifier)
        return x
    },
    setGameId: (gameId: string) => {
        localStorage.setItem(gameIdentifier, gameId)
    },
}

export default gameProvider
