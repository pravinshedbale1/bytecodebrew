// Design a Notification Service — the interview-sized version from the top of the lesson.
// Run: java lld-java/notification-service/NotificationServiceInterview.java
import java.util.*;
import java.util.concurrent.*;

public class NotificationServiceInterview {
    public static void main(String[] args) {
        var sent = new ArrayList<String>();
        int[] smsFailuresLeft = {2};
        Map<Channel, Sender> senders = Map.of(
                Channel.EMAIL, (user, msg) -> sent.add("email:" + user),
                Channel.SMS, (user, msg) -> { if (smsFailuresLeft[0]-- > 0) throw new RuntimeException("provider down"); sent.add("sms:" + user); },
                Channel.PUSH, (user, msg) -> { throw new RuntimeException("always down"); });
        var service = new NotificationService(senders, 3);

        check(service.send(new Notification("n1", "asha", Channel.EMAIL, "Welcome")) == Status.SENT, "sent");
        check(service.send(new Notification("n1", "asha", Channel.EMAIL, "Welcome")) == Status.DUPLICATE, "same id is sent once");
        check(sent.equals(List.of("email:asha")), "only one email went out");
        check(service.send(new Notification("n2", "asha", Channel.SMS, "OTP 4821")) == Status.SENT, "retries until the provider recovers");
        check(service.send(new Notification("n3", "asha", Channel.PUSH, "Hi")) == Status.FAILED, "gives up after max attempts");
        service.optOut("ravi", Channel.EMAIL);
        check(service.send(new Notification("n4", "ravi", Channel.EMAIL, "Offer")) == Status.SKIPPED, "respects opt-out");
        check(service.send(new Notification("n5", "ravi", Channel.SMS, "OTP")) == Status.SENT, "opt-out is per channel");
        done("notification-service");
    }

    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
enum Channel { EMAIL, SMS, PUSH }
enum Status { SENT, DUPLICATE, SKIPPED, FAILED }

record Notification(String id, String userId, Channel channel, String message) { }

interface Sender { void send(String userId, String message); }    // one per channel; wraps a provider (Adapter)

class NotificationService {
    private final Map<Channel, Sender> senders;
    private final int maxAttempts;
    private final Set<String> seenIds = ConcurrentHashMap.newKeySet();           // idempotency
    private final Map<String, Set<Channel>> optedOut = new ConcurrentHashMap<>();

    NotificationService(Map<Channel, Sender> senders, int maxAttempts) { this.senders = senders; this.maxAttempts = maxAttempts; }

    void optOut(String userId, Channel channel) {
        optedOut.computeIfAbsent(userId, id -> ConcurrentHashMap.newKeySet()).add(channel);
    }

    Status send(Notification n) {
        if (!seenIds.add(n.id())) return Status.DUPLICATE;                       // a retried request is sent once
        if (optedOut.getOrDefault(n.userId(), Set.of()).contains(n.channel())) return Status.SKIPPED;
        Sender sender = senders.get(n.channel());
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                sender.send(n.userId(), n.message());
                return Status.SENT;
            } catch (RuntimeException e) {
                // try again; a real system waits longer each time (back-off)
            }
        }
        return Status.FAILED;                                                    // the full design keeps it in a dead-letter list
    }
}
