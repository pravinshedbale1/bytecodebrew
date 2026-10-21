const r = String.raw;

export default {
  'middle-of-the-linked-list': {
    pattern: 'Fast and slow pointers (fast moves two steps for each step of slow)',
    approaches: [
      {
        level: 'Brute force', name: 'Copy the nodes into an array',
        idea: 'Put every node in an array; the middle (the second one for an even length) is at index `n / 2`.',
        steps: [
          'Walk the list and append each node to an array.',
          'Return the node at index `n / 2` (integer division).',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One pass to copy; the array holds all n node references.',
        code: {
          java: r`class Solution {
    public ListNode middleNode(ListNode head) {
        List<ListNode> nodes = new ArrayList<>();
        for (ListNode p = head; p != null; p = p.next) nodes.add(p);
        return nodes.get(nodes.size() / 2);
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* middleNode(ListNode* head) {
        vector<ListNode*> nodes;
        for (ListNode* p = head; p; p = p->next) nodes.push_back(p);
        return nodes[nodes.size() / 2];
    }
};`,
          python: r`class Solution:
    def middleNode(self, head: Optional[ListNode]) -> Optional[ListNode]:
        nodes = []
        while head:
            nodes.append(head)
            head = head.next
        return nodes[len(nodes) // 2]`,
          javascript: r`var middleNode = function(head) {
    const nodes = [];
    for (let p = head; p; p = p.next) nodes.push(p);
    return nodes[Math.floor(nodes.length / 2)];
};`,
        },
      },
      {
        level: 'Better', name: 'Count, then walk half way',
        idea: 'Count the nodes in a first pass, then walk `n / 2` steps from the head in a second pass.',
        steps: [
          'Count the nodes: `n`.',
          'Start at `head` and move `n / 2` times.',
          'Return that node.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Two passes (n + n/2 steps) with only a counter and a pointer.',
        code: {
          java: r`class Solution {
    public ListNode middleNode(ListNode head) {
        int n = 0;
        for (ListNode p = head; p != null; p = p.next) n++;
        ListNode p = head;
        for (int i = 0; i < n / 2; i++) p = p.next;
        return p;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* middleNode(ListNode* head) {
        int n = 0;
        for (ListNode* p = head; p; p = p->next) n++;
        ListNode* p = head;
        for (int i = 0; i < n / 2; i++) p = p->next;
        return p;
    }
};`,
          python: r`class Solution:
    def middleNode(self, head: Optional[ListNode]) -> Optional[ListNode]:
        n, p = 0, head
        while p:
            n += 1
            p = p.next
        p = head
        for _ in range(n // 2):
            p = p.next
        return p`,
          javascript: r`var middleNode = function(head) {
    let n = 0;
    for (let p = head; p; p = p.next) n++;
    let p = head;
    for (let i = 0; i < Math.floor(n / 2); i++) p = p.next;
    return p;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Slow and fast pointers in one pass',
        idea: 'Move `slow` one step and `fast` two steps at a time. When `fast` reaches the end, `slow` has covered half the distance and sits at the middle.',
        steps: [
          'Set `slow = fast = head`.',
          'While `fast` and `fast.next` are not null: `slow = slow.next`, `fast = fast.next.next`.',
          'Return `slow` (for an even length this is the second middle).',
        ],
        time: 'O(n)', space: 'O(1)',
        why: '`fast` crosses the list once, so about n/2 iterations; two pointers of state.',
        code: {
          java: r`class Solution {
    public ListNode middleNode(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        return slow;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* middleNode(ListNode* head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        return slow;
    }
};`,
          python: r`class Solution:
    def middleNode(self, head: Optional[ListNode]) -> Optional[ListNode]:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        return slow`,
          javascript: r`var middleNode = function(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
};`,
        },
      },
    ],
  },

  'linked-list-cycle': {
    pattern: "Floyd's cycle detection (tortoise and hare)",
    approaches: [
      {
        level: 'Brute force', name: 'Remember every node visited',
        idea: 'Walk the list storing each node in a hash set. Reaching a node that is already in the set means the list loops.',
        steps: [
          'Create an empty set of nodes.',
          'Walk from `head`: if the current node is in the set, return true; otherwise add it and move on.',
          'If the walk reaches null, return false.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each node is visited once before a repeat is found or the end is reached; the set can hold all n nodes. Nodes are compared by identity, not value.',
        code: {
          java: r`class Solution {
    public boolean hasCycle(ListNode head) {
        Set<ListNode> seen = new HashSet<>();
        for (ListNode p = head; p != null; p = p.next)
            if (!seen.add(p)) return true;
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool hasCycle(ListNode* head) {
        unordered_set<ListNode*> seen;
        for (ListNode* p = head; p; p = p->next)
            if (!seen.insert(p).second) return true;
        return false;
    }
};`,
          python: r`class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        seen = set()
        while head:
            if head in seen:
                return True
            seen.add(head)
            head = head.next
        return False`,
          javascript: r`var hasCycle = function(head) {
    const seen = new Set();
    for (let p = head; p; p = p.next) {
        if (seen.has(p)) return true;
        seen.add(p);
    }
    return false;
};`,
        },
      },
      {
        level: 'Optimal', name: "Floyd's slow and fast pointers",
        idea: 'Run two pointers, one step and two steps at a time. Without a cycle the fast one falls off the end; with a cycle both end up circling it and the fast one closes the gap by one node per step, so they must meet.',
        steps: [
          'Set `slow = fast = head`.',
          'While `fast` and `fast.next` are not null: move `slow` one step and `fast` two steps.',
          'If they point to the same node, return true.',
          'If the loop ends, return false.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Once both are in the cycle, the gap shrinks by 1 each step, so they meet within one lap; before that, slow takes at most n steps. Only two pointers are stored.',
        code: {
          java: r`class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool hasCycle(ListNode* head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) return true;
        }
        return false;
    }
};`,
          python: r`class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                return True
        return False`,
          javascript: r`var hasCycle = function(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) return true;
    }
    return false;
};`,
        },
      },
    ],
  },

  'happy-number': {
    pattern: 'Cycle detection on an implicit sequence (n → sum of squares of digits)',
    approaches: [
      {
        level: 'Better', name: 'Remember every value seen',
        idea: 'Keep applying the digit-square step. The sequence either reaches 1 or repeats a value (then it loops forever). A hash set spots the repeat.',
        steps: [
          'Create an empty set.',
          'While `n != 1`: if `n` is in the set, return false; otherwise add it and replace `n` with the sum of the squares of its digits.',
          'Return true when `n` becomes 1.',
        ],
        time: 'O(log n)', space: 'O(log n)',
        why: 'One step costs O(number of digits) = O(log n), and after the first step every value is below 1000 (a 10-digit number gives at most 10 × 81 = 810), so only a bounded number of steps follow. The set stores those few values.',
        code: {
          java: r`class Solution {
    public boolean isHappy(int n) {
        Set<Integer> seen = new HashSet<>();
        while (n != 1) {
            if (!seen.add(n)) return false;
            n = next(n);
        }
        return true;
    }

    private int next(int n) {
        int s = 0;
        while (n > 0) { int d = n % 10; s += d * d; n /= 10; }
        return s;
    }
}`,
          cpp: r`class Solution {
    int next(int n) {
        int s = 0;
        while (n > 0) { int d = n % 10; s += d * d; n /= 10; }
        return s;
    }
public:
    bool isHappy(int n) {
        unordered_set<int> seen;
        while (n != 1) {
            if (!seen.insert(n).second) return false;
            n = next(n);
        }
        return true;
    }
};`,
          python: r`class Solution:
    def isHappy(self, n: int) -> bool:
        seen = set()
        while n != 1:
            if n in seen:
                return False
            seen.add(n)
            n = sum(int(d) ** 2 for d in str(n))
        return True`,
          javascript: r`var isHappy = function(n) {
    const next = (n) => { let s = 0; while (n > 0) { const d = n % 10; s += d * d; n = Math.floor(n / 10); } return s; };
    const seen = new Set();
    while (n !== 1) {
        if (seen.has(n)) return false;
        seen.add(n);
        n = next(n);
    }
    return true;
};`,
        },
      },
      {
        level: 'Optimal', name: "Floyd's slow and fast pointers on the sequence",
        idea: 'Treat the numbers as a linked list where each value points to its digit-square sum. Run a slow pointer (one step) and a fast pointer (two steps); they meet inside the cycle, and the number is happy exactly when that cycle is the fixed point 1.',
        steps: [
          'Set `slow = n`, `fast = next(n)`.',
          'While `fast != 1` and `slow != fast`: `slow = next(slow)`, `fast = next(next(fast))`.',
          'Return `fast == 1`.',
        ],
        time: 'O(log n)', space: 'O(1)',
        why: 'Same number of steps as before, up to a constant factor, but no set is stored.',
        code: {
          java: r`class Solution {
    public boolean isHappy(int n) {
        int slow = n, fast = next(n);
        while (fast != 1 && slow != fast) {
            slow = next(slow);
            fast = next(next(fast));
        }
        return fast == 1;
    }

    private int next(int n) {
        int s = 0;
        while (n > 0) { int d = n % 10; s += d * d; n /= 10; }
        return s;
    }
}`,
          cpp: r`class Solution {
    int next(int n) {
        int s = 0;
        while (n > 0) { int d = n % 10; s += d * d; n /= 10; }
        return s;
    }
public:
    bool isHappy(int n) {
        int slow = n, fast = next(n);
        while (fast != 1 && slow != fast) {
            slow = next(slow);
            fast = next(next(fast));
        }
        return fast == 1;
    }
};`,
          python: r`class Solution:
    def isHappy(self, n: int) -> bool:
        def nxt(x):
            s = 0
            while x:
                x, d = divmod(x, 10)
                s += d * d
            return s
        slow, fast = n, nxt(n)
        while fast != 1 and slow != fast:
            slow = nxt(slow)
            fast = nxt(nxt(fast))
        return fast == 1`,
          javascript: r`var isHappy = function(n) {
    const next = (n) => { let s = 0; while (n > 0) { const d = n % 10; s += d * d; n = Math.floor(n / 10); } return s; };
    let slow = n, fast = next(n);
    while (fast !== 1 && slow !== fast) {
        slow = next(slow);
        fast = next(next(fast));
    }
    return fast === 1;
};`,
        },
      },
    ],
  },

  'palindrome-linked-list': {
    pattern: 'Fast and slow pointers to find the middle, then reverse the second half',
    approaches: [
      {
        level: 'Brute force', name: 'Copy the values into an array',
        idea: 'A singly linked list cannot be read backwards, but an array can. Copy the values and check them with two pointers.',
        steps: [
          'Walk the list and append each value to an array.',
          'Compare `a[i]` with `a[n − 1 − i]` moving inwards; return false on a mismatch.',
          'Return true.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Two linear passes; the array holds all n values.',
        code: {
          java: r`class Solution {
    public boolean isPalindrome(ListNode head) {
        List<Integer> vals = new ArrayList<>();
        for (ListNode p = head; p != null; p = p.next) vals.add(p.val);
        for (int i = 0, j = vals.size() - 1; i < j; i++, j--)
            if (!vals.get(i).equals(vals.get(j))) return false;
        return true;
    }
}`,
          cpp: r`class Solution {
public:
    bool isPalindrome(ListNode* head) {
        vector<int> vals;
        for (ListNode* p = head; p; p = p->next) vals.push_back(p->val);
        for (int i = 0, j = (int) vals.size() - 1; i < j; i++, j--)
            if (vals[i] != vals[j]) return false;
        return true;
    }
};`,
          python: r`class Solution:
    def isPalindrome(self, head: Optional[ListNode]) -> bool:
        vals = []
        while head:
            vals.append(head.val)
            head = head.next
        return vals == vals[::-1]`,
          javascript: r`var isPalindrome = function(head) {
    const vals = [];
    for (let p = head; p; p = p.next) vals.push(p.val);
    for (let i = 0, j = vals.length - 1; i < j; i++, j--)
        if (vals[i] !== vals[j]) return false;
    return true;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Reverse the second half in place and compare',
        idea: 'Find the middle with slow and fast pointers, reverse the second half, and walk both halves together comparing values. Reverse the second half back afterwards so the input is left unchanged.',
        steps: [
          'Move `slow` one step and `fast` two steps until `fast` cannot move; `slow` is the start of the second half (the middle node of an odd list belongs to it, which is harmless).',
          'Reverse the list starting at `slow`; call its new head `tail`.',
          'Walk `p` from `head` and `q` from `tail` while `q` is not null, comparing values; remember any mismatch.',
          'Reverse the second half again to restore the list, then return the result.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Finding the middle, two reversals and the comparison are each O(n). Only a few pointers are used.',
        code: {
          java: r`class Solution {
    public boolean isPalindrome(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        ListNode tail = reverse(slow);
        boolean ok = true;
        for (ListNode p = head, q = tail; q != null; p = p.next, q = q.next)
            if (p.val != q.val) { ok = false; break; }
        reverse(tail);
        return ok;
    }

    private ListNode reverse(ListNode node) {
        ListNode prev = null;
        while (node != null) {
            ListNode next = node.next;
            node.next = prev;
            prev = node;
            node = next;
        }
        return prev;
    }
}`,
          cpp: r`class Solution {
    ListNode* reverse(ListNode* node) {
        ListNode* prev = nullptr;
        while (node) {
            ListNode* next = node->next;
            node->next = prev;
            prev = node;
            node = next;
        }
        return prev;
    }
public:
    bool isPalindrome(ListNode* head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        ListNode* tail = reverse(slow);
        bool ok = true;
        for (ListNode *p = head, *q = tail; q; p = p->next, q = q->next)
            if (p->val != q->val) { ok = false; break; }
        reverse(tail);
        return ok;
    }
};`,
          python: r`class Solution:
    def isPalindrome(self, head: Optional[ListNode]) -> bool:
        def reverse(node):
            prev = None
            while node:
                node.next, prev, node = prev, node, node.next
            return prev
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        tail = reverse(slow)
        ok, p, q = True, head, tail
        while q:
            if p.val != q.val:
                ok = False
                break
            p, q = p.next, q.next
        reverse(tail)
        return ok`,
          javascript: r`var isPalindrome = function(head) {
    const reverse = (node) => {
        let prev = null;
        while (node) {
            const next = node.next;
            node.next = prev;
            prev = node;
            node = next;
        }
        return prev;
    };
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    const tail = reverse(slow);
    let ok = true;
    for (let p = head, q = tail; q; p = p.next, q = q.next)
        if (p.val !== q.val) { ok = false; break; }
    reverse(tail);
    return ok;
};`,
        },
      },
    ],
  },

  'remove-nth-node-from-end-of-list': {
    pattern: 'Two pointers with a fixed gap (lead pointer n steps ahead) + dummy head',
    approaches: [
      {
        level: 'Brute force', name: 'Count the length, then remove in a second pass',
        idea: 'The n-th node from the end is node `L − n` from the start (0-based), where `L` is the length. Count `L`, then walk to the node just before it and unlink.',
        steps: [
          'Count the nodes: `L`.',
          'Put a dummy node in front of `head` and walk `L − n` steps from the dummy; you are now just before the node to remove.',
          'Skip it: `prev.next = prev.next.next`.',
          'Return `dummy.next` (this handles removing the head).',
        ],
        time: 'O(L)', space: 'O(1)',
        why: 'Two passes over the list with a counter and a pointer.',
        code: {
          java: r`class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        int len = 0;
        for (ListNode p = head; p != null; p = p.next) len++;
        ListNode dummy = new ListNode(0, head), prev = dummy;
        for (int i = 0; i < len - n; i++) prev = prev.next;
        prev.next = prev.next.next;
        return dummy.next;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        int len = 0;
        for (ListNode* p = head; p; p = p->next) len++;
        ListNode dummy(0, head);
        ListNode* prev = &dummy;
        for (int i = 0; i < len - n; i++) prev = prev->next;
        prev->next = prev->next->next;
        return dummy.next;
    }
};`,
          python: r`class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        length, p = 0, head
        while p:
            length += 1
            p = p.next
        dummy = ListNode(0, head)
        prev = dummy
        for _ in range(length - n):
            prev = prev.next
        prev.next = prev.next.next
        return dummy.next`,
          javascript: r`var removeNthFromEnd = function(head, n) {
    let len = 0;
    for (let p = head; p; p = p.next) len++;
    const dummy = new ListNode(0, head);
    let prev = dummy;
    for (let i = 0; i < len - n; i++) prev = prev.next;
    prev.next = prev.next.next;
    return dummy.next;
};`,
        },
      },
      {
        level: 'Optimal', name: 'One pass with a lead pointer n steps ahead',
        idea: 'Start two pointers at a dummy node and move the lead pointer `n` steps ahead. Then move both together; when the lead reaches the last node, the trailing pointer is just before the node to remove.',
        steps: [
          'Create `dummy` pointing to `head`; set `lead = trail = dummy`.',
          'Move `lead` forward `n` times.',
          'While `lead.next` is not null, move both `lead` and `trail` one step.',
          'Unlink `trail.next` and return `dummy.next`.',
        ],
        time: 'O(L)', space: 'O(1)',
        why: 'The lead pointer crosses the list once. The gap of exactly n nodes means `trail` stops n + 1 nodes before the end, right before the target.',
        code: {
          java: r`class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0, head), lead = dummy, trail = dummy;
        for (int i = 0; i < n; i++) lead = lead.next;
        while (lead.next != null) {
            lead = lead.next;
            trail = trail.next;
        }
        trail.next = trail.next.next;
        return dummy.next;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode dummy(0, head);
        ListNode *lead = &dummy, *trail = &dummy;
        for (int i = 0; i < n; i++) lead = lead->next;
        while (lead->next) {
            lead = lead->next;
            trail = trail->next;
        }
        trail->next = trail->next->next;
        return dummy.next;
    }
};`,
          python: r`class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        lead = trail = dummy
        for _ in range(n):
            lead = lead.next
        while lead.next:
            lead, trail = lead.next, trail.next
        trail.next = trail.next.next
        return dummy.next`,
          javascript: r`var removeNthFromEnd = function(head, n) {
    const dummy = new ListNode(0, head);
    let lead = dummy, trail = dummy;
    for (let i = 0; i < n; i++) lead = lead.next;
    while (lead.next) {
        lead = lead.next;
        trail = trail.next;
    }
    trail.next = trail.next.next;
    return dummy.next;
};`,
        },
      },
    ],
  },

  'linked-list-cycle-ii': {
    pattern: "Floyd's cycle detection, then a second walk to find the cycle's start",
    approaches: [
      {
        level: 'Brute force', name: 'The first node visited twice',
        idea: 'Walk the list storing nodes in a hash set. The first node found already in the set is where the cycle begins.',
        steps: [
          'Create an empty set.',
          'Walk from `head`; if the current node is in the set, return it; otherwise add it.',
          'If the walk reaches null, return null.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Every node is visited once before the first repeat; the set can hold all n nodes.',
        code: {
          java: r`class Solution {
    public ListNode detectCycle(ListNode head) {
        Set<ListNode> seen = new HashSet<>();
        for (ListNode p = head; p != null; p = p.next)
            if (!seen.add(p)) return p;
        return null;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* detectCycle(ListNode* head) {
        unordered_set<ListNode*> seen;
        for (ListNode* p = head; p; p = p->next)
            if (!seen.insert(p).second) return p;
        return nullptr;
    }
};`,
          python: r`class Solution:
    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        seen = set()
        while head:
            if head in seen:
                return head
            seen.add(head)
            head = head.next
        return None`,
          javascript: r`var detectCycle = function(head) {
    const seen = new Set();
    for (let p = head; p; p = p.next) {
        if (seen.has(p)) return p;
        seen.add(p);
    }
    return null;
};`,
        },
      },
      {
        level: 'Optimal', name: "Floyd's meeting point, then restart one pointer from the head",
        idea: 'Let `a` be the distance from the head to the cycle start and `c` the cycle length. When slow and fast meet, slow has walked some `d` steps and fast `2d`, so `d` is a multiple of `c`. Walking `a` more steps from the meeting point therefore lands on the cycle start — exactly where a pointer from the head arrives after `a` steps.',
        steps: [
          'Run slow (one step) and fast (two steps) from `head` until they meet; if fast reaches null, return null.',
          'Move one pointer back to `head`, leave the other at the meeting point.',
          'Move both one step at a time until they are the same node.',
          'Return that node: the start of the cycle.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Both phases take at most about n steps. Only two pointers are used and the list is not modified.',
        code: {
          java: r`class Solution {
    public ListNode detectCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                ListNode p = head;
                while (p != slow) { p = p.next; slow = slow.next; }
                return p;
            }
        }
        return null;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* detectCycle(ListNode* head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) {
                ListNode* p = head;
                while (p != slow) { p = p->next; slow = slow->next; }
                return p;
            }
        }
        return nullptr;
    }
};`,
          python: r`class Solution:
    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                p = head
                while p is not slow:
                    p, slow = p.next, slow.next
                return p
        return None`,
          javascript: r`var detectCycle = function(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) {
            let p = head;
            while (p !== slow) { p = p.next; slow = slow.next; }
            return p;
        }
    }
    return null;
};`,
        },
      },
    ],
  },

  'reorder-list': {
    pattern: 'Find the middle (fast/slow), reverse the second half, merge the halves alternately',
    approaches: [
      {
        level: 'Brute force', name: 'Array of nodes and two pointers',
        idea: 'Store the nodes in an array, then relink them by taking from the front and the back alternately.',
        steps: [
          'Copy every node into an array `a`.',
          'With `i = 0`, `j = n − 1`: while `i < j`, set `a[i].next = a[j]`, move `i` right; if `i == j` stop; set `a[j].next = a[i]`, move `j` left.',
          'Set `a[i].next = null` to end the list.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One pass to copy and one to relink; the array holds n node references.',
        code: {
          java: r`class Solution {
    public void reorderList(ListNode head) {
        List<ListNode> a = new ArrayList<>();
        for (ListNode p = head; p != null; p = p.next) a.add(p);
        int i = 0, j = a.size() - 1;
        while (i < j) {
            a.get(i).next = a.get(j);
            i++;
            if (i == j) break;
            a.get(j).next = a.get(i);
            j--;
        }
        a.get(i).next = null;
    }
}`,
          cpp: r`class Solution {
public:
    void reorderList(ListNode* head) {
        vector<ListNode*> a;
        for (ListNode* p = head; p; p = p->next) a.push_back(p);
        int i = 0, j = (int) a.size() - 1;
        while (i < j) {
            a[i]->next = a[j];
            i++;
            if (i == j) break;
            a[j]->next = a[i];
            j--;
        }
        a[i]->next = nullptr;
    }
};`,
          python: r`class Solution:
    def reorderList(self, head: Optional[ListNode]) -> None:
        a = []
        while head:
            a.append(head)
            head = head.next
        i, j = 0, len(a) - 1
        while i < j:
            a[i].next = a[j]
            i += 1
            if i == j:
                break
            a[j].next = a[i]
            j -= 1
        a[i].next = None`,
          javascript: r`var reorderList = function(head) {
    const a = [];
    for (let p = head; p; p = p.next) a.push(p);
    let i = 0, j = a.length - 1;
    while (i < j) {
        a[i].next = a[j];
        i++;
        if (i === j) break;
        a[j].next = a[i];
        j--;
    }
    a[i].next = null;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Middle, reverse, merge — all in place',
        idea: 'The new order interleaves the first half with the second half read backwards. So split at the middle, reverse the second half, and weave the two lists together.',
        steps: [
          'Find the end of the first half with slow/fast pointers (`fast` starts at `head`, loop while `fast.next` and `fast.next.next` exist), so the first half is never shorter.',
          'Cut the list after `slow`, and reverse the part that followed it.',
          'Merge: take one node from the first half, then one from the reversed second half, until the second half runs out.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Each of the three phases is one linear pass; only a few pointers are used.',
        code: {
          java: r`class Solution {
    public void reorderList(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast.next != null && fast.next.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        ListNode second = null, cur = slow.next;
        slow.next = null;
        while (cur != null) {
            ListNode next = cur.next;
            cur.next = second;
            second = cur;
            cur = next;
        }
        ListNode first = head;
        while (second != null) {
            ListNode n1 = first.next, n2 = second.next;
            first.next = second;
            second.next = n1;
            first = n1;
            second = n2;
        }
    }
}`,
          cpp: r`class Solution {
public:
    void reorderList(ListNode* head) {
        ListNode *slow = head, *fast = head;
        while (fast->next && fast->next->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        ListNode *second = nullptr, *cur = slow->next;
        slow->next = nullptr;
        while (cur) {
            ListNode* next = cur->next;
            cur->next = second;
            second = cur;
            cur = next;
        }
        ListNode* first = head;
        while (second) {
            ListNode *n1 = first->next, *n2 = second->next;
            first->next = second;
            second->next = n1;
            first = n1;
            second = n2;
        }
    }
};`,
          python: r`class Solution:
    def reorderList(self, head: Optional[ListNode]) -> None:
        slow = fast = head
        while fast.next and fast.next.next:
            slow = slow.next
            fast = fast.next.next
        second, cur = None, slow.next
        slow.next = None
        while cur:
            cur.next, second, cur = second, cur, cur.next
        first = head
        while second:
            n1, n2 = first.next, second.next
            first.next = second
            second.next = n1
            first, second = n1, n2`,
          javascript: r`var reorderList = function(head) {
    let slow = head, fast = head;
    while (fast.next && fast.next.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    let second = null, cur = slow.next;
    slow.next = null;
    while (cur) {
        const next = cur.next;
        cur.next = second;
        second = cur;
        cur = next;
    }
    let first = head;
    while (second) {
        const n1 = first.next, n2 = second.next;
        first.next = second;
        second.next = n1;
        first = n1;
        second = n2;
    }
};`,
        },
      },
    ],
  },

  'find-the-duplicate-number': {
    pattern: "Floyd's cycle detection on index → value links (array as a linked list)",
    approaches: [
      {
        level: 'Brute force', name: 'Compare every pair',
        idea: 'The repeated value is the one that two different positions share.',
        steps: [
          'For each `i` and each `j > i`, compare `nums[i]` and `nums[j]`.',
          'The first equal pair gives the duplicate: return `nums[i]`.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'About n²/2 comparisons. It respects the rules (no changes, O(1) space) but is too slow for n = 10⁵.',
        code: {
          java: r`class Solution {
    public int findDuplicate(int[] nums) {
        for (int i = 0; i < nums.length; i++)
            for (int j = i + 1; j < nums.length; j++)
                if (nums[i] == nums[j]) return nums[i];
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        int n = nums.size();
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                if (nums[i] == nums[j]) return nums[i];
        return -1;
    }
};`,
          python: r`class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        n = len(nums)
        for i in range(n):
            for j in range(i + 1, n):
                if nums[i] == nums[j]:
                    return nums[i]
        return -1`,
          javascript: r`var findDuplicate = function(nums) {
    for (let i = 0; i < nums.length; i++)
        for (let j = i + 1; j < nums.length; j++)
            if (nums[i] === nums[j]) return nums[i];
    return -1;
};`,
        },
      },
      {
        level: 'Better', name: 'Hash set (or a seen array)',
        idea: 'Remember every value seen; the first value seen twice is the duplicate.',
        steps: [
          'Keep a boolean array `seen` of size n + 1 (values are 1..n).',
          'For each value: if `seen[x]`, return `x`; otherwise mark it.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One pass, but the extra array breaks the O(1) space rule.',
        code: {
          java: r`class Solution {
    public int findDuplicate(int[] nums) {
        boolean[] seen = new boolean[nums.length];
        for (int x : nums) {
            if (seen[x]) return x;
            seen[x] = true;
        }
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        vector<bool> seen(nums.size(), false);
        for (int x : nums) {
            if (seen[x]) return x;
            seen[x] = true;
        }
        return -1;
    }
};`,
          python: r`class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        seen = set()
        for x in nums:
            if x in seen:
                return x
            seen.add(x)
        return -1`,
          javascript: r`var findDuplicate = function(nums) {
    const seen = new Array(nums.length).fill(false);
    for (const x of nums) {
        if (seen[x]) return x;
        seen[x] = true;
    }
    return -1;
};`,
        },
      },
      {
        level: 'Better', name: 'Binary search on the value (pigeonhole counting)',
        idea: 'For a guess `mid`, count how many values are `<= mid`. Without a duplicate at or below `mid` that count is at most `mid`; if it is larger, the duplicate is in `1..mid`. This halves the value range each time.',
        steps: [
          'Set `lo = 1`, `hi = n` (n = `nums.length − 1`).',
          'While `lo < hi`: `mid = (lo + hi) / 2`; count values `<= mid`.',
          'If the count is greater than `mid`, set `hi = mid`; otherwise `lo = mid + 1`.',
          'Return `lo`.',
        ],
        time: 'O(n log n)', space: 'O(1)',
        why: 'log n rounds, each counting over the whole array. No extra memory and the array is not changed.',
        code: {
          java: r`class Solution {
    public int findDuplicate(int[] nums) {
        int lo = 1, hi = nums.length - 1;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1, count = 0;
            for (int x : nums) if (x <= mid) count++;
            if (count > mid) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}`,
          cpp: r`class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        int lo = 1, hi = (int) nums.size() - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2, count = 0;
            for (int x : nums) if (x <= mid) count++;
            if (count > mid) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
};`,
          python: r`class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        lo, hi = 1, len(nums) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if sum(x <= mid for x in nums) > mid:
                hi = mid
            else:
                lo = mid + 1
        return lo`,
          javascript: r`var findDuplicate = function(nums) {
    let lo = 1, hi = nums.length - 1;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        let count = 0;
        for (const x of nums) if (x <= mid) count++;
        if (count > mid) hi = mid; else lo = mid + 1;
    }
    return lo;
};`,
        },
      },
      {
        level: 'Optimal', name: "Floyd's cycle detection on i → nums[i]",
        idea: 'Read the array as a linked list where index `i` points to index `nums[i]`. Every value is in 1..n, so nothing points back to index 0: the walk from 0 must eventually enter a cycle. The duplicate value is pointed to by two different indices, so it is exactly where the path joins the cycle — the cycle\'s entrance.',
        steps: [
          'Start `slow` and `fast` at index 0; move `slow = nums[slow]` and `fast = nums[nums[fast]]` until they meet.',
          'Reset `slow = 0`.',
          'Move both one step at a time (`slow = nums[slow]`, `fast = nums[fast]`) until they are equal.',
          'Return that value: the entrance of the cycle, i.e. the duplicate.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'The same argument as Linked List Cycle II: both phases take O(n) steps, two integers of state, and the array is only read.',
        code: {
          java: r`class Solution {
    public int findDuplicate(int[] nums) {
        int slow = 0, fast = 0;
        do {
            slow = nums[slow];
            fast = nums[nums[fast]];
        } while (slow != fast);
        slow = 0;
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[fast];
        }
        return slow;
    }
}`,
          cpp: r`class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        int slow = 0, fast = 0;
        do {
            slow = nums[slow];
            fast = nums[nums[fast]];
        } while (slow != fast);
        slow = 0;
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[fast];
        }
        return slow;
    }
};`,
          python: r`class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        slow = fast = 0
        while True:
            slow = nums[slow]
            fast = nums[nums[fast]]
            if slow == fast:
                break
        slow = 0
        while slow != fast:
            slow = nums[slow]
            fast = nums[fast]
        return slow`,
          javascript: r`var findDuplicate = function(nums) {
    let slow = 0, fast = 0;
    do {
        slow = nums[slow];
        fast = nums[nums[fast]];
    } while (slow !== fast);
    slow = 0;
    while (slow !== fast) {
        slow = nums[slow];
        fast = nums[fast];
    }
    return slow;
};`,
        },
      },
    ],
  },
};
