export default {
  'best-time-to-buy-and-sell-stock-ii': {
    explain: 'Buy at 1 and sell at 5 (+4), then buy at 3 and sell at 6 (+3). The total profit is 7.',
  },
  'best-time-to-buy-and-sell-stock-with-transaction-fee': {
    explain: 'Buy at 1 and sell at 8 (7 − 2 fee = 5), then buy at 4 and sell at 9 (5 − 2 = 3). The total is 8.',
  },
  'best-time-to-buy-and-sell-stock-iii': {
    explain: 'Buy at 0 and sell at 3 (+3), then buy at 1 and sell at 4 (+3). Two transactions give 6, the most possible.',
    more: 'A transaction is one buy followed by one sell. You hold at most one share at a time, and you don\'t have to use both transactions.',
  },
  'best-time-to-buy-and-sell-stock-iv': {
    explain: 'Buy at 2 and sell at 4 for a profit of 2. The price then drops to 1 with no later rise, so a second transaction adds nothing. The answer is 2.',
    more: 'A transaction is one buy followed by one sell, and you hold at most one share at a time. Using fewer than `k` transactions is allowed.',
  },
  'student-attendance-record-ii': {
    explain: 'There are 9 records of length 2 using P, A and L. Only "AA" breaks the rules (two absences), so 8 are eligible.',
  },
  'beautiful-arrangement': {
    explain: 'Both orders of 1 and 2 work: in `[1,2]` each number equals its position, and in `[2,1]` 2 is divisible by position 1 and position 2 is divisible by 1. So there are 2 arrangements.',
  },
  'partition-to-k-equal-sum-subsets': {
    explain: 'The total is 20, so each of the 4 groups must sum to 5: `(5)`, `(1,4)`, `(2,3)` and `(3,2)`. That works, so the answer is `true`.',
    more: 'Every group must reach exactly the total divided by `k`. If the total isn\'t divisible by `k`, or any value is larger than that target, the answer is `false` straight away.',
  },
  'minimum-number-of-work-sessions-to-finish-the-tasks': {
    explain: 'Tasks 1 and 2 fit together in one 3-hour session and task 3 fills a second. One session can\'t hold all 6 hours, so the answer is 2.',
  },
  'shortest-path-visiting-all-nodes': {
    explain: 'Node 0 is connected to 1, 2 and 3. The walk 1 → 0 → 2 → 0 → 3 visits every node in 4 moves (revisiting 0 is allowed), and no shorter walk does. So the answer is 4.',
  },
  'find-the-shortest-superstring': {
    explain: 'None of the words overlap, so a shortest superstring simply joins all three: 4 + 5 + 8 = 17 characters, for example "leetcodelovesalex". Any other order of the same length is also accepted.',
    more: 'When one word ends with the start of another, the two can share those letters, which shortens the result. Here no such overlap exists.',
  },
};
