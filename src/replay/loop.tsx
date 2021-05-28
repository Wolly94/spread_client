import { useCallback, useEffect, useState } from 'react'

const useInterval = (
    callback: () => void,
    frequencyInMs: number,
): [boolean, () => void, () => void] => {
    const [runningId, setRunningId] = useState<NodeJS.Timeout | null>(null)
    const [call, setCall] = useState<number>(0)

    useEffect(() => {
        callback()
    }, [call, callback])

    const start = useCallback(() => {
        if (runningId === null) {
            const runId = setInterval(
                () => setCall((call) => call + 1),
                frequencyInMs,
            )
            setRunningId(runId)
        }
    }, [frequencyInMs, runningId])
    const stop = useCallback(() => {
        if (runningId !== null) {
            clearInterval(runningId)
            setRunningId(null)
        }
    }, [runningId])

    return [runningId !== null, start, stop]
}

export default useInterval
