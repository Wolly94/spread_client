import React from 'react'
import { ReadFile } from '../fileService'
import { SpreadMap, validateMap } from '../shared/game/map'

interface ReadMapProps {
    callback: (map: SpreadMap | null) => void
}

const ReadMap: React.FC<ReadMapProps> = (props) => {
    const handleRead = (data: string) => {
        const m: SpreadMap = JSON.parse(data)
        const r = validateMap(m)
        console.log(JSON.stringify(r.message))
        props.callback(r.map)
    }

    return (
        <ReadFile
            allowedFileEndings={['.spread']}
            handleInput={handleRead}
        ></ReadFile>
    )
}

export default ReadMap
