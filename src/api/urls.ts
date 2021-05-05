const baseUrl = () => {
    if (process.env.NODE_ENV === 'development') return 'http://localhost:8765/'
    else if (process.env.NODE_ENV === 'production')
        //return 'http://ec2-3-14-131-174.us-east-2.compute.amazonaws.com/'
        return 'ec2-3-143-215-131.us-east-2.compute.amazonaws.com/'
    return 'http://localhost:8765/'
}

const API_PATH = {
    getToken: baseUrl() + 'token',
    createGame: baseUrl() + 'create-game',
    getFindGame: baseUrl() + 'find-game',
}

export default API_PATH
