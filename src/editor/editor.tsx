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
        width: '65%',
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        paddingTop: '100px',
        paddingLeft: '12.5%',
    },
})

const Editor = () => {
    const classes = useStyles()
    const history = useHistory()
    const [unselectCell, setUnselectCell] = useState(0)

    const [map, setMap] = useState(emptyMap())

    const handleRead = (data: string) => {
        const m: SpreadMap = JSON.parse(data)
        setMap(m)
        setUnselectCell(unselectCell + 1)
    }

    const handleSave = () => {
        const data = JSON.stringify(map)
        saveFile({ fileName: 'Map.spread', data: data })
    }

    return (
        <Box className={classes.centered}>
            <Box display="flex">
                <ReadFile
                    allowedFileEndings={['.spread']}
                    handleInput={handleRead}
                ></ReadFile>
                <Box paddingLeft={3}></Box>
                <MyButton onClick={handleSave}>Save Map</MyButton>
            </Box>
            <Box paddingBottom={3}></Box>
            <EditorCanvas
                map={map}
                setMap={setMap}
                unselectCell={unselectCell}
            ></EditorCanvas>
            <MyButton onClick={() => history.push(PATHS.root)}>Back</MyButton>
        </Box>
    )
}

export default Editor
