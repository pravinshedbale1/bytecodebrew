export default {
  'find-if-path-exists-in-graph': {
    explain: 'Node 0 is joined directly to node 2 by the edge `[2,0]` (and also through 1), so a path exists and the answer is `true`.',
  },
  'redundant-connection': {
    explain: 'Edges `[1,2]` and `[1,3]` already connect all three nodes, so `[2,3]` closes a cycle. Removing it leaves a tree, and it is the last such edge, so the answer is `[2,3]`.',
  },
  'satisfiability-of-equality-equations': {
    explain: '"a==b" puts a and b in the same group, but "b!=a" says they must differ. Both cannot hold, so the answer is `false`.',
  },
  'smallest-string-with-swaps': {
    explain: 'Indices 0 and 3 can swap, holding "d" and "b", so "b" goes first. Indices 1 and 2 hold "c" and "a", so "a" goes to index 1. The result is "bacd".',
    more: 'Swaps chain together: if 0 can swap with 1 and 1 with 2, then the letters at 0, 1 and 2 can be arranged in any order. Group the indices, then sort the letters within each group.',
  },
  'accounts-merge': {
    explain: 'The first two John accounts share "johnsmith@mail.com", so they are the same person and merge into one account with three emails, sorted. The third John shares no email with them, so he stays separate, and Mary is on her own.',
  },
  'min-cost-to-connect-all-points': {
    explain: 'Distance is |x1 − x2| + |y1 − y2|. The cheapest way to connect everything uses [0,0]–[2,2] (4), [2,2]–[5,2] (3), [5,2]–[7,0] (4) and [2,2]–[3,10] (9), for a total of 20.',
  },
  'regions-cut-by-slashes': {
    explain: 'The two slashes join into one diagonal line from the bottom-left corner to the top-right corner, cutting the 2 × 2 square into 2 regions.',
  },
  'largest-component-size-by-common-factor': {
    explain: '4 and 6 share the factor 2, 6 and 15 share 3, and 15 and 35 share 5. That chains all four numbers into one component of size 4.',
  },
};
