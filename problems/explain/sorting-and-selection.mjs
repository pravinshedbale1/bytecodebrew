export default {
  'sort-array-by-increasing-frequency': {
    explain: '3 appears once, 1 appears twice and 2 appears three times, so they come in that order with all their copies: `[3,1,1,2,2,2]`.',
    more: 'Count each value first, then sort with a two-part key: frequency ascending, and for equal frequencies the value descending.',
  },
  'sort-an-array': {
    explain: 'The values 5, 2, 3 and 1 in ascending order are `[1,2,3,5]`.',
    more: 'Merge sort, heap sort or a randomised quicksort all meet the O(n log n) requirement. A plain insertion or bubble sort is too slow on the large test.',
  },
  'largest-number': {
    explain: 'Putting "2" first gives "210", while putting "10" first gives "102". "210" is larger, so the answer is "210".',
  },
  'h-index': {
    explain: 'Three papers have at least 3 citations each (3, 6 and 5), but there are not four papers with at least 4. So the h-index is 3.',
  },
  'sort-characters-by-frequency': {
    explain: '"e" appears twice and "r" and "t" once each, so the two "e"s come first: "eert". "eetr" is equally correct.',
  },
  'maximum-gap': {
    explain: 'Sorted, the values are 1, 3, 6, 9. The gaps between neighbours are 2, 3 and 3, so the largest is 3.',
  },
};
