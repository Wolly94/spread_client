const tokenIdentifier = 'token'

const authProvider = {
    getToken: () => {
        const x = localStorage.getItem(tokenIdentifier)
        return x
    },
    setToken: (token: string) => {
        localStorage.setItem(tokenIdentifier, token)
    },
}

export default authProvider
