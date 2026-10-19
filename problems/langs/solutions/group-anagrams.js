var groupAnagrams = function(strs) {
    const groups = new Map();
    for (const s of strs) {
        const k = [...s].sort().join('');
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(s);
    }
    return [...groups.values()];
};
