var mergeKLists = function(lists) {
    const pq = new PriorityQueue((a, b) => a.val - b.val);
    for (const l of lists) if (l) pq.enqueue(l);
    const dummy = new ListNode();
    let t = dummy;
    while (!pq.isEmpty()) {
        const n = pq.dequeue();
        t.next = n; t = n;
        if (n.next) pq.enqueue(n.next);
    }
    return dummy.next;
};
