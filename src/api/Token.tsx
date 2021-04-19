import { useState } from 'react'
import authProvider from '../auth/authProvider'
import { apiRequest, HttpVerb, useApiRequest } from './base'
import API_PATH from './urls'

interface TokenResponse {
    token: string
}

const requestToken = () => {
    const newToken = apiRequest<TokenResponse>(API_PATH.getToken, HttpVerb.GET)
    return newToken
}

export default requestToken
