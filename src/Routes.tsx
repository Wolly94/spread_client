import React from 'react'
import { Switch, Route } from 'react-router-dom'
import App from './App'
import Editor from './editor/editor'
import Game from './game'

export const PATHS = {
    root: '/',
    editor: '/editor',
    game: '/game',
}

const Routes: React.FC = () => (
    <Switch>
        <Route exact path={PATHS.root} component={App} />
        <Route path={PATHS.editor} component={Editor} />
        <Route path={PATHS.game} component={Game} />
    </Switch>
)

export default Routes
