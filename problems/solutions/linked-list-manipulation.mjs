const r = String.raw;

export default {
  'reverse-linked-list': {
    pattern: 'In-place pointer reversal (prev, current, next)',
    approaches: [
      {
        level: 'Brute force', name: 'Copy the values, write them back reversed',
        idea: 'Read the values into an array, then walk the list again writing the values from the back of the array.',
        steps: [
          'Walk the list and append each value to an array.',
          'Walk the list again; write `values[n − 1]`, `values[n − 2]`, … into the nodes.',
          'Return `head` (the same first node, now holding the last value).',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Two passes; the array holds n values. It changes values rather than links, which interviewers usually do not accept.',
        code: {
          java: r`class Solution {
    public ListNode reverseList(ListNode head) {
        List<Integer> vals = new ArrayList<>();
        for (ListNode p = head; p != null; p = p.next) vals.add(p.val);
        int i = vals.size() - 1;
        for (ListNode p = head; p != null; p = p.next) p.val = vals.get(i--);
        return head;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        vector<int> vals;
        for (ListNode* p = head; p; p = p->next) vals.push_back(p->val);
        int i = (int) vals.size() - 1;
        for (ListNode* p = head; p; p = p->next) p->val = vals[i--];
        return head;
    }
};`,
          python: r`class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        vals = []
        p = head
        while p:
            vals.append(p.val)
            p = p.next
        p = head
        while p:
            p.val = vals.pop()
            p = p.next
        return head`,
          javascript: r`var reverseList = function(head) {
    const vals = [];
    for (let p = head; p; p = p.next) vals.push(p.val);
    for (let p = head; p; p = p.next) p.val = vals.pop();
    return head;
};`,
        },
      },
      {
        level: 'Better', name: 'Recursion',
        idea: 'Reverse the rest of the list first; then the node after `head` is the tail of that reversed part, so hang `head` after it.',
        steps: [
          'If `head` is null or has no next node, return `head`.',
          'Reverse the rest: `newHead = reverseList(head.next)`.',
          'Set `head.next.next = head` and `head.next = null`.',
          'Return `newHead`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One call per node; the call stack is n frames deep, which can overflow on very long lists.',
        code: {
          java: r`class Solution {
    public ListNode reverseList(ListNode head) {
        if (head == null || head.next == null) return head;
        ListNode newHead = reverseList(head.next);
        head.next.next = head;
        head.next = null;
        return newHead;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        if (!head || !head->next) return head;
        ListNode* newHead = reverseList(head->next);
        head->next->next = head;
        head->next = nullptr;
        return newHead;
    }
};`,
          python: r`class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if not head or not head.next:
            return head
        new_head = self.reverseList(head.next)
        head.next.next = head
        head.next = None
        return new_head`,
          javascript: r`var reverseList = function(head) {
    if (!head || !head.next) return head;
    const newHead = reverseList(head.next);
    head.next.next = head;
    head.next = null;
    return newHead;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Iterative reversal with three pointers',
        idea: 'Walk the list once, turning each node\'s `next` pointer back towards the previous node. Save the following node first so it is not lost.',
        steps: [
          'Set `prev = null`, `cur = head`.',
          'While `cur` is not null: save `next = cur.next`, set `cur.next = prev`, then `prev = cur`, `cur = next`.',
          'Return `prev`, the old tail and new head.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass with three pointers; no recursion stack.',
        code: {
          java: r`class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null, cur = head;
        while (cur != null) {
            ListNode next = cur.next;
            cur.next = prev;
            prev = cur;
            cur = next;
        }
        return prev;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode *prev = nullptr, *cur = head;
        while (cur) {
            ListNode* next = cur->next;
            cur->next = prev;
            prev = cur;
            cur = next;
        }
        return prev;
    }
};`,
          python: r`class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev, cur = None, head
        while cur:
            nxt = cur.next
            cur.next = prev
            prev, cur = cur, nxt
        return prev`,
          javascript: r`var reverseList = function(head) {
    let prev = null, cur = head;
    while (cur) {
        const next = cur.next;
        cur.next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
};`,
        },
      },
    ],
  },

  'merge-two-sorted-lists': {
    pattern: 'Two-pointer merge with a dummy head',
    approaches: [
      {
        level: 'Brute force', name: 'Collect all values, sort, build a new list',
        idea: 'Ignore that the lists are already sorted: gather every value, sort, and create fresh nodes.',
        steps: [
          'Append all values of both lists to an array.',
          'Sort the array.',
          'Build a new list from the sorted values and return its head.',
        ],
        time: 'O((n + m) log(n + m))', space: 'O(n + m)',
        why: 'The sort dominates; the array and the new nodes take O(n + m). It also breaks the rule of reusing the existing nodes.',
        code: {
          java: r`class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        List<Integer> vals = new ArrayList<>();
        for (ListNode p = list1; p != null; p = p.next) vals.add(p.val);
        for (ListNode p = list2; p != null; p = p.next) vals.add(p.val);
        Collections.sort(vals);
        ListNode dummy = new ListNode(), tail = dummy;
        for (int v : vals) tail = tail.next = new ListNode(v);
        return dummy.next;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        vector<int> vals;
        for (ListNode* p = list1; p; p = p->next) vals.push_back(p->val);
        for (ListNode* p = list2; p; p = p->next) vals.push_back(p->val);
        sort(vals.begin(), vals.end());
        ListNode dummy;
        ListNode* tail = &dummy;
        for (int v : vals) tail = tail->next = new ListNode(v);
        return dummy.next;
    }
};`,
          python: r`class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        vals = []
        for p in (list1, list2):
            while p:
                vals.append(p.val)
                p = p.next
        dummy = tail = ListNode()
        for v in sorted(vals):
            tail.next = ListNode(v)
            tail = tail.next
        return dummy.next`,
          javascript: r`var mergeTwoLists = function(list1, list2) {
    const vals = [];
    for (let p = list1; p; p = p.next) vals.push(p.val);
    for (let p = list2; p; p = p.next) vals.push(p.val);
    vals.sort((a, b) => a - b);
    const dummy = new ListNode();
    let tail = dummy;
    for (const v of vals) tail = tail.next = new ListNode(v);
    return dummy.next;
};`,
        },
      },
      {
        level: 'Better', name: 'Recursive merge',
        idea: 'The smaller of the two front nodes comes first; its `next` is the merge of everything that remains.',
        steps: [
          'If either list is empty, return the other.',
          'If `list1.val <= list2.val`, set `list1.next = merge(list1.next, list2)` and return `list1`.',
          'Otherwise set `list2.next = merge(list1, list2.next)` and return `list2`.',
        ],
        time: 'O(n + m)', space: 'O(n + m)',
        why: 'One call per node placed; the recursion goes n + m frames deep.',
        code: {
          java: r`class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        if (list1 == null) return list2;
        if (list2 == null) return list1;
        if (list1.val <= list2.val) {
            list1.next = mergeTwoLists(list1.next, list2);
            return list1;
        }
        list2.next = mergeTwoLists(list1, list2.next);
        return list2;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        if (!list1) return list2;
        if (!list2) return list1;
        if (list1->val <= list2->val) {
            list1->next = mergeTwoLists(list1->next, list2);
            return list1;
        }
        list2->next = mergeTwoLists(list1, list2->next);
        return list2;
    }
};`,
          python: r`class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        if not list1 or not list2:
            return list1 or list2
        if list1.val <= list2.val:
            list1.next = self.mergeTwoLists(list1.next, list2)
            return list1
        list2.next = self.mergeTwoLists(list1, list2.next)
        return list2`,
          javascript: r`var mergeTwoLists = function(list1, list2) {
    if (!list1) return list2;
    if (!list2) return list1;
    if (list1.val <= list2.val) {
        list1.next = mergeTwoLists(list1.next, list2);
        return list1;
    }
    list2.next = mergeTwoLists(list1, list2.next);
    return list2;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Iterative merge with a dummy node',
        idea: 'Build the result behind a dummy node: repeatedly attach the smaller front node, and attach whatever remains when one list runs out.',
        steps: [
          'Create `dummy` and set `tail = dummy`.',
          'While both lists are non-empty, attach the smaller front node to `tail`, advance that list, and advance `tail`.',
          'Attach the non-empty remainder (if any) in one step: `tail.next = list1 or list2`.',
          'Return `dummy.next`.',
        ],
        time: 'O(n + m)', space: 'O(1)',
        why: 'Each node is attached once; only the dummy and a tail pointer are extra.',
        code: {
          java: r`class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode(), tail = dummy;
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) { tail.next = list1; list1 = list1.next; }
            else { tail.next = list2; list2 = list2.next; }
            tail = tail.next;
        }
        tail.next = list1 != null ? list1 : list2;
        return dummy.next;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy;
        ListNode* tail = &dummy;
        while (list1 && list2) {
            if (list1->val <= list2->val) { tail->next = list1; list1 = list1->next; }
            else { tail->next = list2; list2 = list2->next; }
            tail = tail->next;
        }
        tail->next = list1 ? list1 : list2;
        return dummy.next;
    }
};`,
          python: r`class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = tail = ListNode()
        while list1 and list2:
            if list1.val <= list2.val:
                tail.next, list1 = list1, list1.next
            else:
                tail.next, list2 = list2, list2.next
            tail = tail.next
        tail.next = list1 or list2
        return dummy.next`,
          javascript: r`var mergeTwoLists = function(list1, list2) {
    const dummy = new ListNode();
    let tail = dummy;
    while (list1 && list2) {
        if (list1.val <= list2.val) { tail.next = list1; list1 = list1.next; }
        else { tail.next = list2; list2 = list2.next; }
        tail = tail.next;
    }
    tail.next = list1 ?? list2;
    return dummy.next;
};`,
        },
      },
    ],
  },

  'remove-linked-list-elements': {
    pattern: 'Dummy head + unlink in place',
    approaches: [
      {
        level: 'Brute force', name: 'Build a new list of the values to keep',
        idea: 'Walk the list and copy every value that is not `val` into a brand-new list.',
        steps: [
          'Create a dummy node and a `tail` pointer.',
          'For each node whose value is not `val`, append a new node with that value.',
          'Return `dummy.next`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One pass, but it allocates up to n new nodes instead of reusing the existing ones.',
        code: {
          java: r`class Solution {
    public ListNode removeElements(ListNode head, int val) {
        ListNode dummy = new ListNode(), tail = dummy;
        for (ListNode p = head; p != null; p = p.next)
            if (p.val != val) tail = tail.next = new ListNode(p.val);
        return dummy.next;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* removeElements(ListNode* head, int val) {
        ListNode dummy;
        ListNode* tail = &dummy;
        for (ListNode* p = head; p; p = p->next)
            if (p->val != val) tail = tail->next = new ListNode(p->val);
        return dummy.next;
    }
};`,
          python: r`class Solution:
    def removeElements(self, head: Optional[ListNode], val: int) -> Optional[ListNode]:
        dummy = tail = ListNode()
        while head:
            if head.val != val:
                tail.next = ListNode(head.val)
                tail = tail.next
            head = head.next
        return dummy.next`,
          javascript: r`var removeElements = function(head, val) {
    const dummy = new ListNode();
    let tail = dummy;
    for (let p = head; p; p = p.next)
        if (p.val !== val) tail = tail.next = new ListNode(p.val);
    return dummy.next;
};`,
        },
      },
      {
        level: 'Better', name: 'Recursion',
        idea: 'Clean the rest of the list first, then decide whether the current node stays.',
        steps: [
          'If `head` is null, return null.',
          'Set `head.next = removeElements(head.next, val)`.',
          'Return `head.next` if `head.val == val`, otherwise `head`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One call per node; the call stack is n deep.',
        code: {
          java: r`class Solution {
    public ListNode removeElements(ListNode head, int val) {
        if (head == null) return null;
        head.next = removeElements(head.next, val);
        return head.val == val ? head.next : head;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* removeElements(ListNode* head, int val) {
        if (!head) return nullptr;
        head->next = removeElements(head->next, val);
        return head->val == val ? head->next : head;
    }
};`,
          python: r`class Solution:
    def removeElements(self, head: Optional[ListNode], val: int) -> Optional[ListNode]:
        if not head:
            return None
        head.next = self.removeElements(head.next, val)
        return head.next if head.val == val else head`,
          javascript: r`var removeElements = function(head, val) {
    if (!head) return null;
    head.next = removeElements(head.next, val);
    return head.val === val ? head.next : head;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Dummy node and in-place unlinking',
        idea: 'Put a dummy node before the head so every node, including the head, has a predecessor. Then skip over matching nodes by relinking.',
        steps: [
          'Create `dummy` with `dummy.next = head`; set `prev = dummy`.',
          'While `prev.next` is not null: if `prev.next.val == val`, set `prev.next = prev.next.next` (do not move `prev`, the new next may match too); otherwise move `prev` forward.',
          'Return `dummy.next`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Each node is looked at once; only the dummy and one pointer are extra.',
        code: {
          java: r`class Solution {
    public ListNode removeElements(ListNode head, int val) {
        ListNode dummy = new ListNode(0, head), prev = dummy;
        while (prev.next != null) {
            if (prev.next.val == val) prev.next = prev.next.next;
            else prev = prev.next;
        }
        return dummy.next;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* removeElements(ListNode* head, int val) {
        ListNode dummy(0, head);
        ListNode* prev = &dummy;
        while (prev->next) {
            if (prev->next->val == val) prev->next = prev->next->next;
            else prev = prev->next;
        }
        return dummy.next;
    }
};`,
          python: r`class Solution:
    def removeElements(self, head: Optional[ListNode], val: int) -> Optional[ListNode]:
        dummy = prev = ListNode(0, head)
        while prev.next:
            if prev.next.val == val:
                prev.next = prev.next.next
            else:
                prev = prev.next
        return dummy.next`,
          javascript: r`var removeElements = function(head, val) {
    const dummy = new ListNode(0, head);
    let prev = dummy;
    while (prev.next) {
        if (prev.next.val === val) prev.next = prev.next.next;
        else prev = prev.next;
    }
    return dummy.next;
};`,
        },
      },
    ],
  },

  'add-two-numbers': {
    pattern: 'Digit-by-digit addition with a carry, building the result behind a dummy node',
    approaches: [
      {
        level: 'Brute force', name: 'Copy the digits into arrays, add, then build the list',
        idea: 'Converting to a built-in integer fails (numbers have up to 100 digits), so copy the digits into arrays and do schoolbook addition there, then turn the result into a list.',
        steps: [
          'Copy the digits of `l1` and `l2` into arrays `a` and `b` (ones digit first).',
          'For `i` from 0 to `max(len) − 1`, add `a[i] + b[i] + carry` (missing digits count as 0); store the last digit and keep the carry.',
          'If a carry remains, add it as a final digit.',
          'Build a list from the result digits and return it.',
        ],
        time: 'O(n + m)', space: 'O(n + m)',
        why: 'A few linear passes; the two digit arrays are extra O(n + m) memory that the direct approach avoids.',
        code: {
          java: r`class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        List<Integer> a = new ArrayList<>(), b = new ArrayList<>(), sum = new ArrayList<>();
        for (ListNode p = l1; p != null; p = p.next) a.add(p.val);
        for (ListNode p = l2; p != null; p = p.next) b.add(p.val);
        int carry = 0;
        for (int i = 0; i < Math.max(a.size(), b.size()); i++) {
            int s = (i < a.size() ? a.get(i) : 0) + (i < b.size() ? b.get(i) : 0) + carry;
            sum.add(s % 10);
            carry = s / 10;
        }
        if (carry > 0) sum.add(carry);
        ListNode dummy = new ListNode(), tail = dummy;
        for (int d : sum) tail = tail.next = new ListNode(d);
        return dummy.next;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        vector<int> a, b, sum;
        for (ListNode* p = l1; p; p = p->next) a.push_back(p->val);
        for (ListNode* p = l2; p; p = p->next) b.push_back(p->val);
        int carry = 0;
        for (size_t i = 0; i < max(a.size(), b.size()); i++) {
            int s = (i < a.size() ? a[i] : 0) + (i < b.size() ? b[i] : 0) + carry;
            sum.push_back(s % 10);
            carry = s / 10;
        }
        if (carry) sum.push_back(carry);
        ListNode dummy;
        ListNode* tail = &dummy;
        for (int d : sum) tail = tail->next = new ListNode(d);
        return dummy.next;
    }
};`,
          python: r`class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        def digits(p):
            out = []
            while p:
                out.append(p.val)
                p = p.next
            return out
        a, b = digits(l1), digits(l2)
        out, carry = [], 0
        for i in range(max(len(a), len(b))):
            s = (a[i] if i < len(a) else 0) + (b[i] if i < len(b) else 0) + carry
            out.append(s % 10)
            carry = s // 10
        if carry:
            out.append(carry)
        dummy = tail = ListNode()
        for d in out:
            tail.next = ListNode(d)
            tail = tail.next
        return dummy.next`,
          javascript: r`var addTwoNumbers = function(l1, l2) {
    const a = [], b = [], sum = [];
    for (let p = l1; p; p = p.next) a.push(p.val);
    for (let p = l2; p; p = p.next) b.push(p.val);
    let carry = 0;
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const s = (a[i] ?? 0) + (b[i] ?? 0) + carry;
        sum.push(s % 10);
        carry = Math.floor(s / 10);
    }
    if (carry) sum.push(carry);
    const dummy = new ListNode();
    let tail = dummy;
    for (const d of sum) tail = tail.next = new ListNode(d);
    return dummy.next;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Walk both lists adding with a carry',
        idea: 'The lists already hold the ones digit first, which is the order schoolbook addition works in. Walk both together, add digit + digit + carry, and append the last digit of that sum.',
        steps: [
          'Create `dummy`, `tail = dummy`, `carry = 0`.',
          'While `l1`, `l2` or `carry` is non-zero: `s = carry + (l1 ? l1.val : 0) + (l2 ? l2.val : 0)`.',
          'Append a node with `s % 10`, set `carry = s / 10`, and advance whichever lists are not finished.',
          'Return `dummy.next`.',
        ],
        time: 'O(max(n, m))', space: 'O(1)',
        why: 'One step per digit of the longer number (plus one for a final carry). Apart from the output list, only the carry and a few pointers are used.',
        code: {
          java: r`class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(), tail = dummy;
        int carry = 0;
        while (l1 != null || l2 != null || carry != 0) {
            int s = carry;
            if (l1 != null) { s += l1.val; l1 = l1.next; }
            if (l2 != null) { s += l2.val; l2 = l2.next; }
            tail = tail.next = new ListNode(s % 10);
            carry = s / 10;
        }
        return dummy.next;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        ListNode dummy;
        ListNode* tail = &dummy;
        int carry = 0;
        while (l1 || l2 || carry) {
            int s = carry;
            if (l1) { s += l1->val; l1 = l1->next; }
            if (l2) { s += l2->val; l2 = l2->next; }
            tail = tail->next = new ListNode(s % 10);
            carry = s / 10;
        }
        return dummy.next;
    }
};`,
          python: r`class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = tail = ListNode()
        carry = 0
        while l1 or l2 or carry:
            s = carry
            if l1:
                s += l1.val
                l1 = l1.next
            if l2:
                s += l2.val
                l2 = l2.next
            tail.next = ListNode(s % 10)
            tail = tail.next
            carry = s // 10
        return dummy.next`,
          javascript: r`var addTwoNumbers = function(l1, l2) {
    const dummy = new ListNode();
    let tail = dummy, carry = 0;
    while (l1 || l2 || carry) {
        let s = carry;
        if (l1) { s += l1.val; l1 = l1.next; }
        if (l2) { s += l2.val; l2 = l2.next; }
        tail = tail.next = new ListNode(s % 10);
        carry = Math.floor(s / 10);
    }
    return dummy.next;
};`,
        },
      },
    ],
  },

  'reverse-linked-list-ii': {
    pattern: 'Sublist reversal in one pass (head insertion behind a fixed predecessor)',
    approaches: [
      {
        level: 'Brute force', name: 'Copy values, reverse the slice, write back',
        idea: 'Read all values into an array, reverse positions `left..right` there, and write the values back into the nodes.',
        steps: [
          'Copy the values into an array.',
          'Reverse the array between indices `left − 1` and `right − 1`.',
          'Walk the list again and write the array values back in order; return `head`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'A few linear passes and an array of n values. It swaps values rather than links.',
        code: {
          java: r`class Solution {
    public ListNode reverseBetween(ListNode head, int left, int right) {
        List<Integer> vals = new ArrayList<>();
        for (ListNode p = head; p != null; p = p.next) vals.add(p.val);
        Collections.reverse(vals.subList(left - 1, right));
        int i = 0;
        for (ListNode p = head; p != null; p = p.next) p.val = vals.get(i++);
        return head;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* reverseBetween(ListNode* head, int left, int right) {
        vector<int> vals;
        for (ListNode* p = head; p; p = p->next) vals.push_back(p->val);
        reverse(vals.begin() + left - 1, vals.begin() + right);
        int i = 0;
        for (ListNode* p = head; p; p = p->next) p->val = vals[i++];
        return head;
    }
};`,
          python: r`class Solution:
    def reverseBetween(self, head: Optional[ListNode], left: int, right: int) -> Optional[ListNode]:
        vals = []
        p = head
        while p:
            vals.append(p.val)
            p = p.next
        vals[left - 1:right] = vals[left - 1:right][::-1]
        p = head
        for v in vals:
            p.val = v
            p = p.next
        return head`,
          javascript: r`var reverseBetween = function(head, left, right) {
    const vals = [];
    for (let p = head; p; p = p.next) vals.push(p.val);
    const mid = vals.slice(left - 1, right).reverse();
    vals.splice(left - 1, mid.length, ...mid);
    let i = 0;
    for (let p = head; p; p = p.next) p.val = vals[i++];
    return head;
};`,
        },
      },
      {
        level: 'Optimal', name: 'One pass: move each node to the front of the sublist',
        idea: 'Stop at the node before position `left` (`prev`). The node at `left` (`cur`) will end up last in the reversed part; repeatedly take the node right after `cur` and insert it directly after `prev`.',
        steps: [
          'Create `dummy` before `head`; walk `prev` forward `left − 1` steps from `dummy`.',
          'Set `cur = prev.next`.',
          'Repeat `right − left` times: `move = cur.next`; `cur.next = move.next`; `move.next = prev.next`; `prev.next = move`.',
          'Return `dummy.next`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'At most `right` steps in a single pass, each with O(1) relinking. The dummy covers `left = 1`, where the head changes.',
        code: {
          java: r`class Solution {
    public ListNode reverseBetween(ListNode head, int left, int right) {
        ListNode dummy = new ListNode(0, head), prev = dummy;
        for (int i = 1; i < left; i++) prev = prev.next;
        ListNode cur = prev.next;
        for (int i = 0; i < right - left; i++) {
            ListNode move = cur.next;
            cur.next = move.next;
            move.next = prev.next;
            prev.next = move;
        }
        return dummy.next;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* reverseBetween(ListNode* head, int left, int right) {
        ListNode dummy(0, head);
        ListNode* prev = &dummy;
        for (int i = 1; i < left; i++) prev = prev->next;
        ListNode* cur = prev->next;
        for (int i = 0; i < right - left; i++) {
            ListNode* move = cur->next;
            cur->next = move->next;
            move->next = prev->next;
            prev->next = move;
        }
        return dummy.next;
    }
};`,
          python: r`class Solution:
    def reverseBetween(self, head: Optional[ListNode], left: int, right: int) -> Optional[ListNode]:
        dummy = prev = ListNode(0, head)
        for _ in range(left - 1):
            prev = prev.next
        cur = prev.next
        for _ in range(right - left):
            move = cur.next
            cur.next = move.next
            move.next = prev.next
            prev.next = move
        return dummy.next`,
          javascript: r`var reverseBetween = function(head, left, right) {
    const dummy = new ListNode(0, head);
    let prev = dummy;
    for (let i = 1; i < left; i++) prev = prev.next;
    const cur = prev.next;
    for (let i = 0; i < right - left; i++) {
        const move = cur.next;
        cur.next = move.next;
        move.next = prev.next;
        prev.next = move;
    }
    return dummy.next;
};`,
        },
      },
    ],
  },

  'swap-nodes-in-pairs': {
    pattern: 'Pointer rewiring in fixed-size groups (dummy head)',
    approaches: [
      {
        level: 'Better', name: 'Recursion',
        idea: 'Swap the first two nodes, and let the recursive call handle the rest of the list.',
        steps: [
          'If fewer than two nodes remain, return `head`.',
          'Let `second = head.next`; set `head.next = swapPairs(second.next)`.',
          'Set `second.next = head` and return `second`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One call per pair: n/2 calls, so the stack is O(n) deep.',
        code: {
          java: r`class Solution {
    public ListNode swapPairs(ListNode head) {
        if (head == null || head.next == null) return head;
        ListNode second = head.next;
        head.next = swapPairs(second.next);
        second.next = head;
        return second;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* swapPairs(ListNode* head) {
        if (!head || !head->next) return head;
        ListNode* second = head->next;
        head->next = swapPairs(second->next);
        second->next = head;
        return second;
    }
};`,
          python: r`class Solution:
    def swapPairs(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if not head or not head.next:
            return head
        second = head.next
        head.next = self.swapPairs(second.next)
        second.next = head
        return second`,
          javascript: r`var swapPairs = function(head) {
    if (!head || !head.next) return head;
    const second = head.next;
    head.next = swapPairs(second.next);
    second.next = head;
    return second;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Iterative with a dummy node',
        idea: 'Keep `prev` just before the next pair. Rewire three links to put the pair\'s second node first, then move `prev` to the pair\'s new second node.',
        steps: [
          'Create `dummy` before `head`; set `prev = dummy`.',
          'While `prev.next` and `prev.next.next` exist: `a = prev.next`, `b = a.next`.',
          'Rewire: `a.next = b.next`, `b.next = a`, `prev.next = b`; then `prev = a`.',
          'Return `dummy.next`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Each pair is rewired once with three pointer changes; no recursion.',
        code: {
          java: r`class Solution {
    public ListNode swapPairs(ListNode head) {
        ListNode dummy = new ListNode(0, head), prev = dummy;
        while (prev.next != null && prev.next.next != null) {
            ListNode a = prev.next, b = a.next;
            a.next = b.next;
            b.next = a;
            prev.next = b;
            prev = a;
        }
        return dummy.next;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* swapPairs(ListNode* head) {
        ListNode dummy(0, head);
        ListNode* prev = &dummy;
        while (prev->next && prev->next->next) {
            ListNode *a = prev->next, *b = a->next;
            a->next = b->next;
            b->next = a;
            prev->next = b;
            prev = a;
        }
        return dummy.next;
    }
};`,
          python: r`class Solution:
    def swapPairs(self, head: Optional[ListNode]) -> Optional[ListNode]:
        dummy = prev = ListNode(0, head)
        while prev.next and prev.next.next:
            a, b = prev.next, prev.next.next
            a.next = b.next
            b.next = a
            prev.next = b
            prev = a
        return dummy.next`,
          javascript: r`var swapPairs = function(head) {
    const dummy = new ListNode(0, head);
    let prev = dummy;
    while (prev.next && prev.next.next) {
        const a = prev.next, b = a.next;
        a.next = b.next;
        b.next = a;
        prev.next = b;
        prev = a;
    }
    return dummy.next;
};`,
        },
      },
    ],
  },

  'partition-list': {
    pattern: 'Split into two lists behind two dummy heads, then join them',
    approaches: [
      {
        level: 'Brute force', name: 'Collect the nodes into two arrays',
        idea: 'Put nodes with values below `x` in one array and the rest in another, each in original order, then relink them in that order.',
        steps: [
          'Walk the list, appending each node to `small` or `large`.',
          'Concatenate `small` and `large` and link each node to the next one; the last node points to null.',
          'Return the first node (or null for an empty list).',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Two linear passes; the arrays hold n node references.',
        code: {
          java: r`class Solution {
    public ListNode partition(ListNode head, int x) {
        List<ListNode> all = new ArrayList<>(), large = new ArrayList<>();
        for (ListNode p = head; p != null; p = p.next) (p.val < x ? all : large).add(p);
        all.addAll(large);
        for (int i = 0; i < all.size(); i++) all.get(i).next = i + 1 < all.size() ? all.get(i + 1) : null;
        return all.isEmpty() ? null : all.get(0);
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* partition(ListNode* head, int x) {
        vector<ListNode*> all, large;
        for (ListNode* p = head; p; p = p->next) (p->val < x ? all : large).push_back(p);
        all.insert(all.end(), large.begin(), large.end());
        for (size_t i = 0; i < all.size(); i++) all[i]->next = i + 1 < all.size() ? all[i + 1] : nullptr;
        return all.empty() ? nullptr : all[0];
    }
};`,
          python: r`class Solution:
    def partition(self, head: Optional[ListNode], x: int) -> Optional[ListNode]:
        small, large = [], []
        while head:
            (small if head.val < x else large).append(head)
            head = head.next
        nodes = small + large
        for a, b in zip(nodes, nodes[1:] + [None]):
            a.next = b
        return nodes[0] if nodes else None`,
          javascript: r`var partition = function(head, x) {
    const small = [], large = [];
    for (let p = head; p; p = p.next) (p.val < x ? small : large).push(p);
    const all = small.concat(large);
    for (let i = 0; i < all.length; i++) all[i].next = all[i + 1] ?? null;
    return all.length ? all[0] : null;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two dummy-headed lists',
        idea: 'Grow two lists as you walk: one for values below `x`, one for the rest. Appending at the tail keeps each group\'s order. Finally link the end of the first to the start of the second.',
        steps: [
          'Create dummies `lessHead` and `moreHead` with tails `less` and `more`.',
          'For each node, append it to `less` if its value is below `x`, else to `more`.',
          'Set `more.next = null` (the last node may still point into the old list) and `less.next = moreHead.next`.',
          'Return `lessHead.next`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass; only two dummies and two tails are extra. Forgetting to end the second list creates a cycle.',
        code: {
          java: r`class Solution {
    public ListNode partition(ListNode head, int x) {
        ListNode lessHead = new ListNode(), moreHead = new ListNode(), less = lessHead, more = moreHead;
        for (ListNode p = head; p != null; p = p.next) {
            if (p.val < x) less = less.next = p;
            else more = more.next = p;
        }
        more.next = null;
        less.next = moreHead.next;
        return lessHead.next;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* partition(ListNode* head, int x) {
        ListNode lessHead, moreHead;
        ListNode *less = &lessHead, *more = &moreHead;
        for (ListNode* p = head; p; p = p->next) {
            if (p->val < x) less = less->next = p;
            else more = more->next = p;
        }
        more->next = nullptr;
        less->next = moreHead.next;
        return lessHead.next;
    }
};`,
          python: r`class Solution:
    def partition(self, head: Optional[ListNode], x: int) -> Optional[ListNode]:
        less_head = less = ListNode()
        more_head = more = ListNode()
        while head:
            if head.val < x:
                less.next = head
                less = head
            else:
                more.next = head
                more = head
            head = head.next
        more.next = None
        less.next = more_head.next
        return less_head.next`,
          javascript: r`var partition = function(head, x) {
    const lessHead = new ListNode(), moreHead = new ListNode();
    let less = lessHead, more = moreHead;
    for (let p = head; p; p = p.next) {
        if (p.val < x) less = less.next = p;
        else more = more.next = p;
    }
    more.next = null;
    less.next = moreHead.next;
    return lessHead.next;
};`,
        },
      },
    ],
  },

  'rotate-list': {
    pattern: 'Close the list into a ring, then cut it at the new tail (k mod length)',
    approaches: [
      {
        level: 'Brute force', name: 'Move the last node to the front, k mod n times',
        idea: 'One rotation step moves the tail to the front. Rotating n times returns the original list, so only `k mod n` steps are needed; do them one by one.',
        steps: [
          'If the list is empty, return it. Count its length `n` and set `k = k mod n`.',
          'Repeat `k` times: walk to the second-to-last node, detach the last node, and put it in front of `head`.',
          'Return `head`.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Up to n − 1 rotation steps, each walking the list. Without the `mod n` it would be O(k·n) with k up to 2 × 10⁹.',
        code: {
          java: r`class Solution {
    public ListNode rotateRight(ListNode head, int k) {
        if (head == null || head.next == null) return head;
        int n = 0;
        for (ListNode p = head; p != null; p = p.next) n++;
        for (int step = 0; step < k % n; step++) {
            ListNode prev = head;
            while (prev.next.next != null) prev = prev.next;
            ListNode last = prev.next;
            prev.next = null;
            last.next = head;
            head = last;
        }
        return head;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* rotateRight(ListNode* head, int k) {
        if (!head || !head->next) return head;
        int n = 0;
        for (ListNode* p = head; p; p = p->next) n++;
        for (int step = 0; step < k % n; step++) {
            ListNode* prev = head;
            while (prev->next->next) prev = prev->next;
            ListNode* last = prev->next;
            prev->next = nullptr;
            last->next = head;
            head = last;
        }
        return head;
    }
};`,
          python: r`class Solution:
    def rotateRight(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        if not head or not head.next:
            return head
        n, p = 0, head
        while p:
            n += 1
            p = p.next
        for _ in range(k % n):
            prev = head
            while prev.next.next:
                prev = prev.next
            last = prev.next
            prev.next = None
            last.next = head
            head = last
        return head`,
          javascript: r`var rotateRight = function(head, k) {
    if (!head || !head.next) return head;
    let n = 0;
    for (let p = head; p; p = p.next) n++;
    for (let step = 0; step < k % n; step++) {
        let prev = head;
        while (prev.next.next) prev = prev.next;
        const last = prev.next;
        prev.next = null;
        last.next = head;
        head = last;
    }
    return head;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Make a ring, then cut it',
        idea: 'Rotating right by `k` makes node `n − k` (counting from 0) the new head. Join the tail to the head to form a ring, walk to the new tail, and break the ring there.',
        steps: [
          'If the list is empty or has one node, return it. Find the tail and the length `n` in one pass.',
          'Set `k = k mod n`; if it is 0, return `head`.',
          'Link `tail.next = head` to make a ring.',
          'Walk `n − k − 1` steps from `head` to reach the new tail; the new head is the node after it. Cut: `newTail.next = null`; return the new head.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass to measure and at most one more partial pass to find the cut; a few pointers of state.',
        code: {
          java: r`class Solution {
    public ListNode rotateRight(ListNode head, int k) {
        if (head == null || head.next == null) return head;
        int n = 1;
        ListNode tail = head;
        while (tail.next != null) { tail = tail.next; n++; }
        k %= n;
        if (k == 0) return head;
        tail.next = head;
        ListNode newTail = head;
        for (int i = 0; i < n - k - 1; i++) newTail = newTail.next;
        ListNode newHead = newTail.next;
        newTail.next = null;
        return newHead;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* rotateRight(ListNode* head, int k) {
        if (!head || !head->next) return head;
        int n = 1;
        ListNode* tail = head;
        while (tail->next) { tail = tail->next; n++; }
        k %= n;
        if (k == 0) return head;
        tail->next = head;
        ListNode* newTail = head;
        for (int i = 0; i < n - k - 1; i++) newTail = newTail->next;
        ListNode* newHead = newTail->next;
        newTail->next = nullptr;
        return newHead;
    }
};`,
          python: r`class Solution:
    def rotateRight(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        if not head or not head.next:
            return head
        n, tail = 1, head
        while tail.next:
            tail = tail.next
            n += 1
        k %= n
        if k == 0:
            return head
        tail.next = head
        new_tail = head
        for _ in range(n - k - 1):
            new_tail = new_tail.next
        new_head = new_tail.next
        new_tail.next = None
        return new_head`,
          javascript: r`var rotateRight = function(head, k) {
    if (!head || !head.next) return head;
    let n = 1, tail = head;
    while (tail.next) { tail = tail.next; n++; }
    k %= n;
    if (k === 0) return head;
    tail.next = head;
    let newTail = head;
    for (let i = 0; i < n - k - 1; i++) newTail = newTail.next;
    const newHead = newTail.next;
    newTail.next = null;
    return newHead;
};`,
        },
      },
    ],
  },

  'reverse-nodes-in-k-group': {
    pattern: 'Reverse fixed-size groups in place, reconnecting each group to the previous one',
    approaches: [
      {
        level: 'Better', name: 'Recursion, one group per call',
        idea: 'Check that k nodes are available; if so, reverse those k nodes, and attach the result of recursively processing the rest of the list to the end of the reversed group.',
        steps: [
          'Walk k nodes from `head`; if the list ends first, return `head` unchanged.',
          'Reverse the first k nodes with the usual prev/cur loop; `head` becomes the group\'s last node.',
          'Set `head.next = reverseKGroup(nextGroupStart, k)`.',
          'Return the group\'s new first node (`prev`).',
        ],
        time: 'O(n)', space: 'O(n/k)',
        why: 'Each node is visited twice (counting and reversing). One call per group means n/k stack frames, which breaks the O(1) memory rule.',
        code: {
          java: r`class Solution {
    public ListNode reverseKGroup(ListNode head, int k) {
        ListNode check = head;
        for (int i = 0; i < k; i++) {
            if (check == null) return head;
            check = check.next;
        }
        ListNode prev = null, cur = head;
        for (int i = 0; i < k; i++) {
            ListNode next = cur.next;
            cur.next = prev;
            prev = cur;
            cur = next;
        }
        head.next = reverseKGroup(cur, k);
        return prev;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        ListNode* check = head;
        for (int i = 0; i < k; i++) {
            if (!check) return head;
            check = check->next;
        }
        ListNode *prev = nullptr, *cur = head;
        for (int i = 0; i < k; i++) {
            ListNode* next = cur->next;
            cur->next = prev;
            prev = cur;
            cur = next;
        }
        head->next = reverseKGroup(cur, k);
        return prev;
    }
};`,
          python: r`class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        check = head
        for _ in range(k):
            if not check:
                return head
            check = check.next
        prev, cur = None, head
        for _ in range(k):
            nxt = cur.next
            cur.next = prev
            prev, cur = cur, nxt
        head.next = self.reverseKGroup(cur, k)
        return prev`,
          javascript: r`var reverseKGroup = function(head, k) {
    let check = head;
    for (let i = 0; i < k; i++) {
        if (!check) return head;
        check = check.next;
    }
    let prev = null, cur = head;
    for (let i = 0; i < k; i++) {
        const next = cur.next;
        cur.next = prev;
        prev = cur;
        cur = next;
    }
    head.next = reverseKGroup(cur, k);
    return prev;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Iterative, group by group behind a dummy node',
        idea: 'Keep `groupPrev`, the node just before the next group. If k nodes follow it, reverse them in place, hook the reversed group between `groupPrev` and the rest, and move `groupPrev` to the group\'s new last node.',
        steps: [
          'Create `dummy` before `head`; set `groupPrev = dummy`.',
          'Find `kth`, the k-th node after `groupPrev`; if it does not exist, stop.',
          'Reverse the nodes from `groupPrev.next` to `kth`, starting `prev` at `kth.next` so the group\'s old first node ends up pointing to the rest of the list.',
          'Set `first = groupPrev.next` (old first, now last), `groupPrev.next = kth`, then `groupPrev = first`, and repeat. Return `dummy.next`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Each node is visited a constant number of times (finding `kth` and reversing); only a handful of pointers are used.',
        code: {
          java: r`class Solution {
    public ListNode reverseKGroup(ListNode head, int k) {
        ListNode dummy = new ListNode(0, head), groupPrev = dummy;
        while (true) {
            ListNode kth = groupPrev;
            for (int i = 0; i < k && kth != null; i++) kth = kth.next;
            if (kth == null) break;
            ListNode after = kth.next, prev = after, cur = groupPrev.next;
            while (cur != after) {
                ListNode next = cur.next;
                cur.next = prev;
                prev = cur;
                cur = next;
            }
            ListNode first = groupPrev.next;
            groupPrev.next = kth;
            groupPrev = first;
        }
        return dummy.next;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        ListNode dummy(0, head);
        ListNode* groupPrev = &dummy;
        while (true) {
            ListNode* kth = groupPrev;
            for (int i = 0; i < k && kth; i++) kth = kth->next;
            if (!kth) break;
            ListNode *after = kth->next, *prev = after, *cur = groupPrev->next;
            while (cur != after) {
                ListNode* next = cur->next;
                cur->next = prev;
                prev = cur;
                cur = next;
            }
            ListNode* first = groupPrev->next;
            groupPrev->next = kth;
            groupPrev = first;
        }
        return dummy.next;
    }
};`,
          python: r`class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        dummy = group_prev = ListNode(0, head)
        while True:
            kth = group_prev
            for _ in range(k):
                kth = kth.next
                if not kth:
                    return dummy.next
            after = kth.next
            prev, cur = after, group_prev.next
            while cur is not after:
                nxt = cur.next
                cur.next = prev
                prev, cur = cur, nxt
            first = group_prev.next
            group_prev.next = kth
            group_prev = first`,
          javascript: r`var reverseKGroup = function(head, k) {
    const dummy = new ListNode(0, head);
    let groupPrev = dummy;
    while (true) {
        let kth = groupPrev;
        for (let i = 0; i < k && kth; i++) kth = kth.next;
        if (!kth) break;
        const after = kth.next;
        let prev = after, cur = groupPrev.next;
        while (cur !== after) {
            const next = cur.next;
            cur.next = prev;
            prev = cur;
            cur = next;
        }
        const first = groupPrev.next;
        groupPrev.next = kth;
        groupPrev = first;
    }
    return dummy.next;
};`,
        },
      },
    ],
  },
  'insert-greatest-common-divisors-in-linked-list': {
    pattern: 'Insert after the current node, then skip the new one',
    approaches: [
      {
        level: 'Brute force', name: 'GCD by trying divisors',
        idea: 'Walk the list and insert a node between each pair, finding the GCD by testing candidates from the smaller value downwards.',
        steps: [
          'For each node `a` with a next node `b`: let `g` start at `min(a.val, b.val)` and decrease it until it divides both.',
          'Insert a node with value `g` between `a` and `b`, then move `a` to `b`.',
        ],
        time: 'O(n · V)', space: 'O(1)',
        why: 'V is the largest value (1000). The trial-division GCD costs up to V steps per pair, so this is fine here but grows with the values. Output nodes are not counted as extra space.',
        code: {
          java: r`class Solution {
    public ListNode insertGreatestCommonDivisors(ListNode head) {
        ListNode a = head;
        while (a.next != null) {
            ListNode b = a.next;
            int g = Math.min(a.val, b.val);
            while (a.val % g != 0 || b.val % g != 0) g--;
            a.next = new ListNode(g, b);
            a = b;
        }
        return head;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* insertGreatestCommonDivisors(ListNode* head) {
        ListNode* a = head;
        while (a->next) {
            ListNode* b = a->next;
            int g = min(a->val, b->val);
            while (a->val % g != 0 || b->val % g != 0) g--;
            a->next = new ListNode(g, b);
            a = b;
        }
        return head;
    }
};`,
          python: r`class Solution:
    def insertGreatestCommonDivisors(self, head: Optional[ListNode]) -> Optional[ListNode]:
        a = head
        while a.next:
            b = a.next
            g = min(a.val, b.val)
            while a.val % g or b.val % g:
                g -= 1
            a.next = ListNode(g, b)
            a = b
        return head`,
          javascript: r`var insertGreatestCommonDivisors = function(head) {
    let a = head;
    while (a.next) {
        const b = a.next;
        let g = Math.min(a.val, b.val);
        while (a.val % g !== 0 || b.val % g !== 0) g--;
        a.next = new ListNode(g, b);
        a = b;
    }
    return head;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Euclid\'s GCD',
        idea: 'Same walk, but compute each GCD with Euclid\'s algorithm: `gcd(a, b) = gcd(b, a mod b)`.',
        steps: [
          'For each node `a` with a next node `b`, compute `g = gcd(a.val, b.val)` with Euclid.',
          'Set `a.next = new node(g, b)` and continue from `b`, skipping the inserted node.',
        ],
        time: 'O(n · log V)', space: 'O(1)',
        why: 'Euclid\'s algorithm takes O(log V) steps because the remainder at least halves every two steps. Jumping straight to `b` matters: advancing one node at a time would land on the new node and insert endlessly.',
        code: {
          java: r`class Solution {
    public ListNode insertGreatestCommonDivisors(ListNode head) {
        for (ListNode a = head; a.next != null; a = a.next.next) a.next = new ListNode(gcd(a.val, a.next.val), a.next);
        return head;
    }
    private int gcd(int a, int b) {
        while (b != 0) { int t = a % b; a = b; b = t; }
        return a;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* insertGreatestCommonDivisors(ListNode* head) {
        for (ListNode* a = head; a->next; a = a->next->next) a->next = new ListNode(gcd(a->val, a->next->val), a->next);
        return head;
    }
};`,
          python: r`class Solution:
    def insertGreatestCommonDivisors(self, head: Optional[ListNode]) -> Optional[ListNode]:
        a = head
        while a.next:
            a.next = ListNode(gcd(a.val, a.next.val), a.next)
            a = a.next.next
        return head`,
          javascript: r`var insertGreatestCommonDivisors = function(head) {
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    for (let a = head; a.next; a = a.next.next) a.next = new ListNode(gcd(a.val, a.next.val), a.next);
    return head;
};`,
        },
      },
    ],
  },
  'copy-list-with-random-pointer': {
    pattern: 'Old-to-new node map (or interleave copies in place)',
    approaches: [
      {
        level: 'Brute force', name: 'Copy by position',
        idea: 'Copy the values and `next` links into an array of new nodes, then, for each original random pointer, find its position by walking the original list from the head.',
        steps: [
          'Put the original nodes in a list `orig` and create `copy[i]` for each, linking `copy[i].next = copy[i + 1]`.',
          'For each `i` with `orig[i].random != null`, scan `orig` to find the index `j` of that node.',
          'Set `copy[i].random = copy[j]` and return `copy[0]`.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Finding each random target by scanning costs O(n), so the whole copy is quadratic. It works because node identity (not value) is compared, which matters when values repeat.',
        code: {
          java: r`class Solution {
    public Node copyRandomList(Node head) {
        List<Node> orig = new ArrayList<>();
        for (Node t = head; t != null; t = t.next) orig.add(t);
        int n = orig.size();
        if (n == 0) return null;
        Node[] copy = new Node[n];
        for (int i = 0; i < n; i++) copy[i] = new Node(orig.get(i).val);
        for (int i = 0; i + 1 < n; i++) copy[i].next = copy[i + 1];
        for (int i = 0; i < n; i++) {
            Node r = orig.get(i).random;
            if (r == null) continue;
            for (int j = 0; j < n; j++) if (orig.get(j) == r) { copy[i].random = copy[j]; break; }
        }
        return copy[0];
    }
}`,
          cpp: r`class Solution {
public:
    Node* copyRandomList(Node* head) {
        vector<Node*> orig;
        for (Node* t = head; t; t = t->next) orig.push_back(t);
        int n = orig.size();
        if (n == 0) return nullptr;
        vector<Node*> copy(n);
        for (int i = 0; i < n; i++) copy[i] = new Node(orig[i]->val);
        for (int i = 0; i + 1 < n; i++) copy[i]->next = copy[i + 1];
        for (int i = 0; i < n; i++) {
            Node* r = orig[i]->random;
            if (!r) continue;
            for (int j = 0; j < n; j++) if (orig[j] == r) { copy[i]->random = copy[j]; break; }
        }
        return copy[0];
    }
};`,
          python: r`class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        orig = []
        t = head
        while t:
            orig.append(t)
            t = t.next
        if not orig:
            return None
        copy = [Node(o.val) for o in orig]
        for i in range(len(copy) - 1):
            copy[i].next = copy[i + 1]
        for i, o in enumerate(orig):
            if o.random is not None:
                j = next(k for k, p in enumerate(orig) if p is o.random)
                copy[i].random = copy[j]
        return copy[0]`,
          javascript: r`var copyRandomList = function(head) {
    const orig = [];
    for (let t = head; t; t = t.next) orig.push(t);
    if (orig.length === 0) return null;
    const copy = orig.map((o) => new _Node(o.val, null, null));
    for (let i = 0; i + 1 < copy.length; i++) copy[i].next = copy[i + 1];
    orig.forEach((o, i) => {
        if (o.random) copy[i].random = copy[orig.indexOf(o.random)];
    });
    return copy[0];
};`,
        },
      },
      {
        level: 'Better', name: 'Hash map from old node to new node',
        idea: 'First pass: create a copy of every node and store `old → new`. Second pass: wire each copy\'s `next` and `random` through the map.',
        steps: [
          'For each original node `t`, put `map[t] = new Node(t.val)`.',
          'For each `t`, set `map[t].next = map[t.next]` and `map[t].random = map[t.random]` (with `map[null] = null`).',
          'Return `map[head]`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Two linear passes with O(1) map lookups. The map is the clean, interview-friendly answer and also works for general graphs (Clone Graph is the same idea).',
        code: {
          java: r`class Solution {
    public Node copyRandomList(Node head) {
        Map<Node, Node> copy = new HashMap<>();
        for (Node t = head; t != null; t = t.next) copy.put(t, new Node(t.val));
        for (Node t = head; t != null; t = t.next) {
            copy.get(t).next = copy.get(t.next);
            copy.get(t).random = copy.get(t.random);
        }
        return copy.get(head);
    }
}`,
          cpp: r`class Solution {
public:
    Node* copyRandomList(Node* head) {
        unordered_map<Node*, Node*> copy;
        copy[nullptr] = nullptr;
        for (Node* t = head; t; t = t->next) copy[t] = new Node(t->val);
        for (Node* t = head; t; t = t->next) {
            copy[t]->next = copy[t->next];
            copy[t]->random = copy[t->random];
        }
        return copy[head];
    }
};`,
          python: r`class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        copy = {None: None}
        t = head
        while t:
            copy[t] = Node(t.val)
            t = t.next
        t = head
        while t:
            copy[t].next = copy[t.next]
            copy[t].random = copy[t.random]
            t = t.next
        return copy[head]`,
          javascript: r`var copyRandomList = function(head) {
    const copy = new Map([[null, null]]);
    for (let t = head; t; t = t.next) copy.set(t, new _Node(t.val, null, null));
    for (let t = head; t; t = t.next) {
        copy.get(t).next = copy.get(t.next);
        copy.get(t).random = copy.get(t.random);
    }
    return copy.get(head);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Interleave copies, then split',
        idea: 'Put each copy directly after its original: `A → A\' → B → B\' …`. Then the copy of `X.random` is simply `X.random.next`, so no map is needed. Finally pull the two lists apart.',
        steps: [
          'Weave: for each original `t`, insert `new Node(t.val)` between `t` and `t.next`.',
          'Randoms: for each original `t`, set `t.next.random = t.random == null ? null : t.random.next`.',
          'Split: restore `t.next = t.next.next` for each original and link each copy to the next copy. Return the first copy.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Three linear passes and no extra structure besides the output. The original list must be fully restored at the end; the judge checks that the copy shares no node with it.',
        code: {
          java: r`class Solution {
    public Node copyRandomList(Node head) {
        if (head == null) return null;
        for (Node t = head; t != null; t = t.next.next) {
            Node c = new Node(t.val);
            c.next = t.next;
            t.next = c;
        }
        for (Node t = head; t != null; t = t.next.next) t.next.random = t.random == null ? null : t.random.next;
        Node newHead = head.next;
        for (Node t = head; t != null; t = t.next) {
            Node c = t.next;
            t.next = c.next;
            c.next = c.next == null ? null : c.next.next;
        }
        return newHead;
    }
}`,
          cpp: r`class Solution {
public:
    Node* copyRandomList(Node* head) {
        if (!head) return nullptr;
        for (Node* t = head; t; t = t->next->next) {
            Node* c = new Node(t->val);
            c->next = t->next;
            t->next = c;
        }
        for (Node* t = head; t; t = t->next->next) t->next->random = t->random ? t->random->next : nullptr;
        Node* newHead = head->next;
        for (Node* t = head; t; t = t->next) {
            Node* c = t->next;
            t->next = c->next;
            c->next = c->next ? c->next->next : nullptr;
        }
        return newHead;
    }
};`,
          python: r`class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        if not head:
            return None
        t = head
        while t:
            t.next = Node(t.val, t.next)
            t = t.next.next
        t = head
        while t:
            t.next.random = t.random.next if t.random else None
            t = t.next.next
        new_head = head.next
        t = head
        while t:
            c = t.next
            t.next = c.next
            c.next = c.next.next if c.next else None
            t = t.next
        return new_head`,
          javascript: r`var copyRandomList = function(head) {
    if (!head) return null;
    for (let t = head; t; t = t.next.next) t.next = new _Node(t.val, t.next, null);
    for (let t = head; t; t = t.next.next) t.next.random = t.random ? t.random.next : null;
    const newHead = head.next;
    for (let t = head; t; t = t.next) {
        const c = t.next;
        t.next = c.next;
        c.next = c.next ? c.next.next : null;
    }
    return newHead;
};`,
        },
      },
    ],
  },
};
