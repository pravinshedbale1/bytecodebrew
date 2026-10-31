export default {
  'is-graph-bipartite': {
    explain: 'In `[[1,2,3],[0,2],[0,1,3],[0,2]]`, nodes 0, 1 and 2 are all joined to each other: a triangle. Whichever groups 0 and 1 go into, they must differ, and then 2 must differ from both, which is impossible with two groups. So the answer is `false`.',
  },
  'possible-bipartition': {
    explain: 'With dislikes [1,2], [1,3] and [2,4], put person 1 and person 4 in one group and persons 2 and 3 in the other. Every disliked pair is split, so the answer is `true`.',
  },
  'critical-connections-in-a-network': {
    explain: 'Servers 0, 1 and 2 form a triangle, so removing any one of those three links still leaves the others connected. Server 3 hangs off server 1 by a single link, so removing [1,3] cuts it off. The only critical connection is `[[1,3]]`.',
  },
  'valid-arrangement-of-pairs': {
    explain: '[11,9] ends at 9, [9,4] starts at 9 and ends at 4, [4,5] starts at 4 and ends at 5, and [5,1] starts at 5. Each end matches the next start, so `[[11,9],[9,4],[4,5],[5,1]]` is valid.',
  },
};
