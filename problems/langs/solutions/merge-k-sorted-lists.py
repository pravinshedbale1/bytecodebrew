class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        heap = [(l.val, i, l) for i, l in enumerate(lists) if l]
        heapq.heapify(heap)
        dummy = tail = ListNode()
        while heap:
            _, i, n = heapq.heappop(heap)
            tail.next = tail = n
            if n.next:
                heapq.heappush(heap, (n.next.val, i, n.next))
        return dummy.next
