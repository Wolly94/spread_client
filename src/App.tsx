import React, { useEffect, useState } from 'react'
import logo from './logo.svg'
import './App.css'
import authProvider from './auth/auth'

interface AppProps {}

function App() {
    const [token, setToken] = useState(authProvider.getToken())

    useEffect(() => {
        if (token == null) {
        }
    }, [])

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </div>
    )
}

export default App
