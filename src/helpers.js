export const dayInMs = 24*3600*1000;

const groupBy = (arr, key) => {
    return arr.reduce((groups, row) => {
        const group = groups.get(row[key]);

        if(group) {
            group.push(row)
        } else {
            groups.set(row[key], [row])
        }

        return groups;
    }, new Map())
}

const calculateOverlap = (a, b) => {
    const start = Math.max(a.start, b.start);
    const end = Math.min(a.end, b.end);

    if(start > end) {
        return null;
    }

    return { start, end };
}

const generateEmployeePairHash = (employee1, employee2) => {
    // const hash = {
    //     employee1: employee1.employeeId < employee2.employeeId ? employee1.employeeId : employee2.employeeId,
    //     employee2: employee1.employeeId < employee2.employeeId ? employee2.employeeId : employee1.employeeId,
    // };

    return JSON.stringify({
        employee1: employee1.employeeId < employee2.employeeId ? employee1.employeeId : employee2.employeeId,
        employee2: employee1.employeeId < employee2.employeeId ? employee2.employeeId : employee1.employeeId,
    })
    // return hash.employee1 + '_' + hash.employee2
}

const parseEmployeePairHash = (hash) => {
    return JSON.parse(hash);
}

const findPairWithLargestOverlap = (input) => {
    const pairEmployeesMap = new Map();

    const groupMap = Array.from(groupBy(input, 'projectId').values());

    groupMap.forEach((projectGroup) => {
        for(let i = 0; i < projectGroup.length - 1; ++i) {
            for(let j = i + 1; j < projectGroup.length; ++j) {
                const employee1 = projectGroup[i]
                const employee2 = projectGroup[j];

                if(employee1.employeeId === employee2.employeeId) {
                    continue;
                }

                const intersection = calculateOverlap(employee1, employee2);

                if(!intersection) {
                    continue;
                }

                const hash = generateEmployeePairHash(employee1, employee2);
                const pair = pairEmployeesMap.get(hash);

                if(pair) {
                    pair.push(intersection);
                } else {
                    pairEmployeesMap.set(hash, [intersection])
                }
            }
        }
    })

    const [hash] = Array.from(pairEmployeesMap.entries())
        .map((entry) => {
            const [hash, intersections] = entry;

            const totalTime = intersections
                .sort((a, b) => a.start - b.start)
                .reduce((result, value) => {
                    const last = result[result.length - 1];

                    if(! last || last.end < value.start) {
                        result.push(value);
                    } else if (last.end < value.end) {
                        last.end = value.end
                    }

                    return result;
                }, [])
                .reduce((result, item) => result + item.end - item.start + 1, 0)

            return [hash, totalTime];
        })
        .reduce((result, entry) => result[1] > entry[1] ? result : entry, []);

    if(! hash) {
        return null;
    }
    return parseEmployeePairHash(hash);
}

export const findPairWithLargestOverlapAndTheirCommonProjectsWorkingTime = (input) => {
    const pair = findPairWithLargestOverlap(input);

    if(! pair) {
        return null;
    }

    const { employee1, employee2 } = pair;

    const filtered = input.filter((row) => {
        return row.employeeId === employee1 || row.employeeId === employee2;
    })

    return {
        employee1,
        employee2,
        projects: Array.from(groupBy(filtered, 'projectId').entries())
            .map((entry) => {
                const [projectId, projectGroup] = entry;
                const intersections = []

                for(let i = 0; i < projectGroup.length - 1; ++i) {
                    for (let j = i + 1; j < projectGroup.length; ++j) {
                        const employee1 = projectGroup[i];
                        const employee2 = projectGroup[j];

                        if (employee1.employeeId === employee2.employeeId) {
                            continue;
                        }

                        const intersection = calculateOverlap(employee1, employee2)
                        if(! intersection) {
                            continue;
                        }

                        intersections.push(intersection);
                    }
                }

                return {
                    id: projectId,
                    totalTime: intersections.reduce((result, item) => result + item.end - item.start + 1, 0)
                }
            })
    };
}