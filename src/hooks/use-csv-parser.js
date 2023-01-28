import {useMemo} from "react";

const useCsvParser = (props) => {
    const { contents, mapFn } = props;

    return useMemo(() => {
        return contents
            .split('\n')
            .map((row) => row.trim().split(',').map(column => column.trim()))
            .filter(Boolean)
            .map(mapFn);
    }, [contents])
}

export default useCsvParser;