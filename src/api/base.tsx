import axios, { CancelToken } from 'axios'
import { useEffect, useState } from 'react'
import authProvider from '../auth/authProvider'

export interface ApiError {
    errorMessage: string
}

export const isApiError = (val: any): val is ApiError => {
    return (val as ApiError).errorMessage !== undefined
}

export enum HttpVerb {
    GET = 'GET',
    POST = 'POST',
}

const headers = () => {
    const token = authProvider.getToken()
    if (token == null) {
        return { 'Content-Type': 'text/plain' }
    } else {
        return {
            'Content-Type': 'text/plain',
            Authorization: 'Basic ' + authProvider.getToken(),
        }
    }
}

export const apiRequest = <T,>(
    url: string,
    method: HttpVerb,
    data?: any,
    cancelToken?: CancelToken,
) => {
    return axios({
        method: method,
        url: url,
        data: data,
        cancelToken: cancelToken,
    })
        .then((res) => {
            return res.data as T
        })
        .catch((error) => {
            //console.log(error.response)
            var err: ApiError = { errorMessage: error.response }
            return err
        })
}

export const useApiRequest = <T,>(
    url: string,
    method: HttpVerb,
    data?: any,
) => {
    const [result, setResult] = useState<T | null>(null)
    useEffect(() => {
        const source = axios.CancelToken.source()
        var res = apiRequest<T>(url, method, data, source.token)
        res.then((r) => {
            if (isApiError(r)) {
                console.log(
                    'API-Request failed: ' +
                        method +
                        ' ' +
                        url +
                        ' returned ' +
                        r.errorMessage,
                )
            } else {
                setResult(r)
            }
        })

        return () => {
            source.cancel('Component got unmounted')
        }
    }, [])
    return result
}
