export default [
  {
    slug: 'sort-array-by-increasing-frequency', title: 'Sort Array by Increasing Frequency', level: 'Easy',
    summary: 'Sort the values by how often they occur, least frequent first; values with the same frequency go in decreasing order.',
    method: 'frequencySort', params: [['int[]', 'nums']], returns: 'int[]',
    tests: [
      { in: [[1, 1, 2, 2, 2, 3]], out: [3, 1, 1, 2, 2, 2] },
      { in: [[2, 3, 1, 3, 2]], out: [1, 3, 3, 2, 2] },
      { in: [[-1, 1, -6, 4, 5, -6, 1, 4, 1]], out: [5, -1, 4, 4, -6, -6, 1, 1, 1] },
      { in: [[7]] },
      { in: [[0, 0, -1, -1]] },
    ],
    ref: `class Solution {
    public int[] frequencySort(int[] nums) {
        Map<Integer, Integer> f = new HashMap<>();
        for (int x : nums) f.merge(x, 1, Integer::sum);
        return Arrays.stream(nums).boxed()
            .sorted((a, b) -> !f.get(a).equals(f.get(b)) ? Integer.compare(f.get(a), f.get(b)) : Integer.compare(b, a))
            .mapToInt(Integer::intValue).toArray();
    }
}`,
  },
  {
    slug: 'sort-an-array', title: 'Sort an Array', level: 'Medium',
    summary: 'Sort the array in ascending order without a built-in sort, in O(n log n) time (merge sort, heap sort or a randomised quick sort).',
    method: 'sortArray', params: [['int[]', 'nums']], returns: 'int[]',
    tests: [
      { in: [[5, 2, 3, 1]], out: [1, 2, 3, 5] },
      { in: [[5, 1, 1, 2, 0, 0]], out: [0, 0, 1, 1, 2, 5] },
      { in: [[1]] },
      { in: [[-4, 0, 7, 4, 9, -5, -1, 0, -7, -1]] },
      { in: [[3, 3, 3, 3]] },
    ],
    ref: `class Solution {
    public int[] sortArray(int[] nums) {
        mergeSort(nums, new int[nums.length], 0, nums.length - 1);
        return nums;
    }
    private void mergeSort(int[] a, int[] tmp, int lo, int hi) {
        if (lo >= hi) return;
        int mid = (lo + hi) >>> 1;
        mergeSort(a, tmp, lo, mid); mergeSort(a, tmp, mid + 1, hi);
        int i = lo, j = mid + 1, k = lo;
        while (i <= mid || j <= hi) tmp[k++] = j > hi || (i <= mid && a[i] <= a[j]) ? a[i++] : a[j++];
        System.arraycopy(tmp, lo, a, lo, hi - lo + 1);
    }
}`,
  },
  {
    slug: 'largest-number', title: 'Largest Number', level: 'Medium',
    summary: 'Arrange the non-negative integers so their concatenation is the largest possible number, returned as a string (no leading zeros except "0").',
    method: 'largestNumber', params: [['int[]', 'nums']], returns: 'String',
    tests: [
      { in: [[10, 2]], out: '210' },
      { in: [[3, 30, 34, 5, 9]], out: '9534330' },
      { in: [[0, 0]], out: '0' },
      { in: [[1]] },
      { in: [[432, 43243]] },
      { in: [[121, 12]] },
    ],
    ref: `class Solution {
    public String largestNumber(int[] nums) {
        String[] s = Arrays.stream(nums).mapToObj(String::valueOf).toArray(String[]::new);
        Arrays.sort(s, (a, b) -> (b + a).compareTo(a + b));
        if (s[0].equals("0")) return "0";
        return String.join("", s);
    }
}`,
  },
  {
    slug: 'h-index', title: 'H-Index', level: 'Medium',
    summary: 'citations[i] is the citation count of paper i. Return the largest h such that at least h papers have h or more citations each.',
    method: 'hIndex', params: [['int[]', 'citations']], returns: 'int',
    tests: [
      { in: [[3, 0, 6, 1, 5]], out: 3 },
      { in: [[1, 3, 1]], out: 1 },
      { in: [[0]] },
      { in: [[100]] },
      { in: [[4, 4, 4, 4, 4]] },
    ],
    ref: `class Solution {
    public int hIndex(int[] citations) {
        int n = citations.length;
        int[] count = new int[n + 1];
        for (int c : citations) count[Math.min(c, n)]++;
        int papers = 0;
        for (int h = n; h >= 0; h--) { papers += count[h]; if (papers >= h) return h; }
        return 0;
    }
}`,
  },
  {
    slug: 'sort-characters-by-frequency', title: 'Sort Characters By Frequency', level: 'Medium',
    summary: 'Rearrange s so characters appear in decreasing order of frequency, each character\'s copies together. Any order among equally frequent characters is accepted.',
    method: 'frequencySort', params: [['String', 's']], returns: 'String', check: 'custom:frequencySort',
    tests: [
      { in: ['tree'] },
      { in: ['cccaaa'] },
      { in: ['Aabb'] },
      { in: ['z'] },
      { in: ['2a554442f544asfasssffffasss'] },
    ],
    ref: `class Solution {
    public String frequencySort(String s) {
        Map<Character, Integer> f = new HashMap<>();
        for (char c : s.toCharArray()) f.merge(c, 1, Integer::sum);
        List<Character> keys = new ArrayList<>(f.keySet());
        keys.sort((a, b) -> f.get(b) - f.get(a));
        StringBuilder sb = new StringBuilder();
        for (char c : keys) sb.append(String.valueOf(c).repeat(f.get(c)));
        return sb.toString();
    }
}`,
  },
  {
    slug: 'maximum-gap', title: 'Maximum Gap', level: 'Hard',
    summary: 'Return the largest difference between neighbouring values once the array is sorted (0 if fewer than two values), in linear time and space.',
    method: 'maximumGap', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[3, 6, 9, 1]], out: 3 },
      { in: [[10]], out: 0 },
      { in: [[1, 1, 1, 1]] },
      { in: [[1, 10000000]] },
      { in: [[15252, 16764, 27963, 7817, 26155, 20757, 3478, 22602, 20404, 6739]] },
    ],
    ref: `class Solution {
    public int maximumGap(int[] nums) {
        int n = nums.length;
        if (n < 2) return 0;
        int lo = Integer.MAX_VALUE, hi = Integer.MIN_VALUE;
        for (int x : nums) { lo = Math.min(lo, x); hi = Math.max(hi, x); }
        if (lo == hi) return 0;
        int size = Math.max(1, (hi - lo) / (n - 1)), count = (hi - lo) / size + 1;
        int[] bmin = new int[count], bmax = new int[count];
        Arrays.fill(bmin, Integer.MAX_VALUE); Arrays.fill(bmax, Integer.MIN_VALUE);
        for (int x : nums) { int b = (x - lo) / size; bmin[b] = Math.min(bmin[b], x); bmax[b] = Math.max(bmax[b], x); }
        int best = 0, prev = lo;
        for (int b = 0; b < count; b++) {
            if (bmin[b] == Integer.MAX_VALUE) continue;
            best = Math.max(best, bmin[b] - prev);
            prev = bmax[b];
        }
        return best;
    }
}`,
  },
];
