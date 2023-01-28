import {useMemo, useState} from "react";
import useFileReader from "./hooks/use-file-reader";
import useCsvParser from "./hooks/use-csv-parser";
import {
    dayInMs,
    findPairWithLargestOverlapAndTheirCommonProjectsWorkingTime
} from "./helpers";

const csvRowMapFn = (cols) => {
    const [employeeId, projectId, start, end] = cols;

    const startDate = new Date(start);
    const endDate = isNaN(new Date(end).getTime()) ? new Date() : new Date(end);

    startDate.setUTCHours(0,0,0,0);
    endDate.setUTCHours(23,59,59,999);

    return {
        employeeId,
        projectId,
        start: startDate.getTime(),
        end: endDate.getTime(),
    }
}

function App() {
    const [file, setFile] = useState();
    const contents = useFileReader(file)
    const inputData = useCsvParser({
        contents,
        mapFn: csvRowMapFn,
    });

    const pair = useMemo(() => {
       return inputData
            ? findPairWithLargestOverlapAndTheirCommonProjectsWorkingTime(inputData)
            : []
    }, [inputData]);

    return (
        <div>
            <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                    setFile(e.target.files[0])
                }}
                onClick={(e) => {
                    e.target.value = null
                }}
            />

            <table>
                <thead>
                    <tr>
                        <th>Employee #1</th>
                        <th>Employee #2</th>
                        <th>Project ID</th>
                        <th>Days Worked</th>
                    </tr>
                </thead>

                <tbody>
                    {pair?.projects?.map?.((project) => (
                        <tr key={project.id}>
                            <td>{pair.employee1}</td>
                            <td>{pair.employee2}</td>
                            <td>{project.id}</td>
                            <td>{project.totalTime/dayInMs}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;
