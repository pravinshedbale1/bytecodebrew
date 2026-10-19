var reverseList = function(head) {
    let prev = null;
    while (head) { const n = head.next; head.next = prev; prev = head; head = n; }
    return prev;
};
