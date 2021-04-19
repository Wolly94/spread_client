import axios from 'axios'
import authProvider from '../auth/auth'

enum HttpVerb {
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

function apiRequest<T>(url: string, method: HttpVerb, data?: any) {
    axios({
        method: method,
        url: url,
        data: data,
    })
}

function apiGet<T>(url: string) {
    axios.get(url)
}

export default apiRequest
