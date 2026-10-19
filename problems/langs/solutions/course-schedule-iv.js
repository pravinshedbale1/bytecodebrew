var checkIfPrerequisite = function(numCourses, prerequisites, queries) {
    const n = numCourses;
    const reach = Array.from({ length: n }, () => new Array(n).fill(false));
    for (const [a, b] of prerequisites) reach[a][b] = true;
    for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) if (reach[i][k]) for (let j = 0; j < n; j++) if (reach[k][j]) reach[i][j] = true;
    return queries.map(([a, b]) => reach[a][b]);
};
