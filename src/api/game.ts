import { apiRequest, HttpVerb } from './base'
import API_PATH from './urls'

export interface CreateGameBody {}

export interface CreateGameResponse {
    id: string
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

export const getGameState = (gameId: string) => {
    return apiRequest<GetGameStateResponse>(
        API_PATH.getGameState + '/' + gameId,
        HttpVerb.GET,
    )
}
