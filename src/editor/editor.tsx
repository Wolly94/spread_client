import MyButton from '../components/MyButton'
import React, { useState } from 'react'
import { Box, makeStyles } from '@material-ui/core'
import { useHistory } from 'react-router'
import { PATHS } from '../Routes'
import EditorCanvas from './editorCanvas'
import { ReadFile, saveFile, SaveFile } from '../fileService'
import { emptyMap, exampleMap, SpreadMap } from '../shared/game/map'

const useStyles = makeStyles({
    centered: {
        width: '50%',
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        paddingTop: '100px',
        paddingLeft: '25%',
    },
})

const Editor = () => {
    const classes = useStyles()
    const history = useHistory()

    const [map, setMap] = useState(emptyMap())

    const handleRead = (data: string) => {
        const m: SpreadMap = JSON.parse(data)
        setMap(m)
    }

    const handleSave = () => {
        const data = JSON.stringify(map)
        saveFile({ fileName: 'Map.spread', data: data })
    }

    return (
        <Box className={classes.centered}>
            <ReadFile
                allowedFileEndings={['.spread']}
                handleInput={handleRead}
            ></ReadFile>
            <MyButton onClick={handleSave}>Save Map</MyButton>
            <EditorCanvas map={map} setMap={setMap}></EditorCanvas>
            <MyButton onClick={() => history.push(PATHS.root)}>Back</MyButton>
        </Box>
    )
}

export default Editor
