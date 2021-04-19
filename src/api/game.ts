import { apiRequest, HttpVerb } from './base'
import API_PATH from './urls'

export interface CreateGameBody {}

export interface CreateGameResponse {
    id: string
    url: string
}

export const createGameRequest = () => {
    return apiRequest<CreateGameResponse>(
        API_PATH.createGame,
        HttpVerb.POST,
        {},
    )
}

export interface GetGameStateResponse {
    gameId: string
    gameServerUrl: string
}

export const getGameState = (gameServerUrl: string) => {
    return apiRequest<GetGameStateResponse>(gameServerUrl, HttpVerb.GET)
}
