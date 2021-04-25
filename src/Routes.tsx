import React from 'react'
import { Switch, Route } from 'react-router-dom'
import App from './App'
import Editor from './editor/editor'

export const PATHS = {
    root: '/',
    editor: '/editor',
}

const Routes: React.FC = () => (
    <Switch>
        <Route exact path={PATHS.root} component={App} />
        <Route path={PATHS.editor} component={Editor} />
    </Switch>
)

export default Routes
