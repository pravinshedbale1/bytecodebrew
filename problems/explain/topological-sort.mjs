export default {
  'course-schedule': {
    explain: 'The pair `[1,0]` means take course 0 before course 1. Take 0, then 1: both are finished, so the answer is `true`.',
  },
  'course-schedule-ii': {
    explain: 'Course 0 has no prerequisite and course 1 needs course 0, so the only valid order is `[0,1]`.',
  },
  'course-schedule-iv': {
    explain: 'Here `[1,0]` means course 1 comes before course 0. So 0 is not a prerequisite of 1, while 1 is a prerequisite of 0, giving `[false,true]`.',
  },
  'minimum-height-trees': {
    explain: 'Node 1 is joined to every other node, so rooting the tree at 1 gives height 1. Rooting at any leaf gives height 2, so the only answer is `[1]`.',
  },
  'find-eventual-safe-states': {
    explain: 'Nodes 5 and 6 have no outgoing edges, and 2 and 4 only lead to 5, so they are safe. Nodes 0, 1 and 3 can loop forever through 0 → 1 → 3 → 0, so the answer is `[2,4,5,6]`.',
  },
  'find-all-possible-recipes-from-given-supplies': {
    explain: 'Bread needs yeast and flour, and both are in the supplies, so bread can be made. The answer is `["bread"]`.',
  },
  'sort-items-by-groups-respecting-dependencies': {
    explain: 'Group 0 holds items 3, 4 and 6, and group 1 holds items 2 and 5. In `[6,3,4,5,2,0,7,1]` each group\'s items sit together, 6 comes before 1, 3 and 4, 3 comes before 4, and 5 comes before 2, so every rule holds. Other orders that satisfy the rules are also accepted.',
  },
};
