-- Checks for schema.sql: every constraint rejects the bad write it exists to stop,
-- and the queries shown in the lesson return the right answers.
\set ON_ERROR_STOP on

CREATE TEMP TABLE results (name TEXT, ok BOOLEAN);

-- Runs a statement that must fail with the given SQLSTATE (23505 unique, 23514 check, 23P01 exclusion, 23503 FK).
CREATE FUNCTION pg_temp.expect_error(label TEXT, stmt TEXT, state TEXT) RETURNS void AS $$
BEGIN
    BEGIN
        EXECUTE stmt;
        INSERT INTO results VALUES (label || ' (no error raised)', false);
    EXCEPTION WHEN others THEN
        INSERT INTO results VALUES (label || ' [' || SQLSTATE || ']', SQLSTATE = state);
    END;
END $$ LANGUAGE plpgsql;

CREATE FUNCTION pg_temp.expect(label TEXT, cond BOOLEAN) RETURNS void AS $$
BEGIN INSERT INTO results VALUES (label, coalesce(cond, false)); END $$ LANGUAGE plpgsql;

-- ---------- movie booking ----------
INSERT INTO movie (title, runtime_min) VALUES ('Interstellar', 169);
INSERT INTO theatre (name, city) VALUES ('PVR Forum', 'Bengaluru');
INSERT INTO screen (theatre_id, name) VALUES (1, 'Audi 1');
INSERT INTO seat (screen_id, row_label, seat_no, seat_type)
    SELECT 1, 'A', n, 'REGULAR' FROM generate_series(1, 10) n;
INSERT INTO show (movie_id, screen_id, starts_at) VALUES (1, 1, '2026-10-15 18:00+05:30');
INSERT INTO show_seat (show_id, seat_id, price_paise) SELECT 1, id, 25000 FROM seat;

SELECT pg_temp.expect_error('seat numbers unique per screen row',
    $$INSERT INTO seat (screen_id, row_label, seat_no, seat_type) VALUES (1, 'A', 1, 'REGULAR')$$, '23505');
SELECT pg_temp.expect_error('HELD requires an owner and expiry',
    $$UPDATE show_seat SET status = 'HELD' WHERE show_id = 1 AND seat_id = 1$$, '23514');

-- The hold is ONE conditional UPDATE; success means "rows changed = seats requested".
DO $$
DECLARE n INT;
BEGIN
    UPDATE show_seat SET status = 'HELD', held_by = 101, hold_expires_at = now() + interval '5 minutes', version = version + 1
     WHERE show_id = 1 AND seat_id IN (1, 2)
       AND (status = 'AVAILABLE' OR (status = 'HELD' AND hold_expires_at < now()));
    GET DIAGNOSTICS n = ROW_COUNT;
    PERFORM pg_temp.expect('user 101 holds seats 1 and 2', n = 2);

    -- user 202 wants seats 2 and 3: only seat 3 is free → 1 row → must roll back
    BEGIN
        UPDATE show_seat SET status = 'HELD', held_by = 202, hold_expires_at = now() + interval '5 minutes', version = version + 1
         WHERE show_id = 1 AND seat_id IN (2, 3)
           AND (status = 'AVAILABLE' OR (status = 'HELD' AND hold_expires_at < now()));
        GET DIAGNOSTICS n = ROW_COUNT;
        IF n <> 2 THEN RAISE EXCEPTION 'partial hold' USING ERRCODE = 'P0001'; END IF;
    EXCEPTION WHEN SQLSTATE 'P0001' THEN
        PERFORM pg_temp.expect('partial hold rolled back (seat 3 not left held)',
            (SELECT status FROM show_seat WHERE show_id = 1 AND seat_id = 3) = 'AVAILABLE');
    END;

    -- an expired hold can be taken over
    UPDATE show_seat SET hold_expires_at = now() - interval '1 second' WHERE show_id = 1 AND seat_id = 2;
    UPDATE show_seat SET status = 'HELD', held_by = 202, hold_expires_at = now() + interval '5 minutes', version = version + 1
     WHERE show_id = 1 AND seat_id = 2
       AND (status = 'AVAILABLE' OR (status = 'HELD' AND hold_expires_at < now()));
    GET DIAGNOSTICS n = ROW_COUNT;
    PERFORM pg_temp.expect('expired hold taken over', n = 1);

    -- confirm only if still held by me
    INSERT INTO booking (id, user_id, show_id, status, amount_paise) VALUES (1, 101, 1, 'CONFIRMED', 25000);
    UPDATE show_seat SET status = 'BOOKED', booking_id = 1, held_by = NULL, hold_expires_at = NULL, version = version + 1
     WHERE show_id = 1 AND seat_id = 2 AND status = 'HELD' AND held_by = 101 AND hold_expires_at > now();
    GET DIAGNOSTICS n = ROW_COUNT;
    PERFORM pg_temp.expect('user 101 can no longer confirm seat 2 (lost it after expiry)', n = 0);
END $$;

-- ---------- parking ----------
INSERT INTO parking_spot (floor, number, size) VALUES (0, 1, 'MEDIUM'), (0, 2, 'MEDIUM');
INSERT INTO parking_ticket (spot_id, plate, entry_at) VALUES (1, 'KA01AB1234', now());
SELECT pg_temp.expect_error('spot already has an active ticket',
    $$INSERT INTO parking_ticket (spot_id, plate, entry_at) VALUES (1, 'KA02CD5678', now())$$, '23505');
SELECT pg_temp.expect_error('plate already parked',
    $$INSERT INTO parking_ticket (spot_id, plate, entry_at) VALUES (2, 'KA01AB1234', now())$$, '23505');
UPDATE parking_ticket SET exit_at = now(), fee_paise = 8000 WHERE spot_id = 1 AND exit_at IS NULL;
INSERT INTO parking_ticket (spot_id, plate, entry_at) VALUES (1, 'KA01AB1234', now());
SELECT pg_temp.expect('closed tickets don''t block the spot or the plate',
    (SELECT count(*) FROM parking_ticket WHERE spot_id = 1) = 2);
SELECT pg_temp.expect_error('exit and fee go together',
    $$UPDATE parking_ticket SET exit_at = now() WHERE exit_at IS NULL$$, '23514');

-- ---------- hotel ----------
INSERT INTO room (number, type) VALUES ('101', 'DELUXE'), ('102', 'DELUXE');
INSERT INTO room_booking (room_id, guest_id, stay, status) VALUES (1, 1, '[2026-10-10,2026-10-12)', 'CONFIRMED');
SELECT pg_temp.expect_error('overlapping stay in the same room',
    $$INSERT INTO room_booking (room_id, guest_id, stay, status) VALUES (1, 2, '[2026-10-11,2026-10-13)', 'CONFIRMED')$$, '23P01');
INSERT INTO room_booking (room_id, guest_id, stay, status) VALUES (1, 3, '[2026-10-12,2026-10-13)', 'CONFIRMED');
SELECT pg_temp.expect('checkout day is free for the next guest (half-open)', true);
INSERT INTO room_booking (room_id, guest_id, stay, status) VALUES (1, 4, '[2026-10-10,2026-10-12)', 'CANCELLED');
SELECT pg_temp.expect('cancelled bookings are ignored by the constraint', true);
SELECT pg_temp.expect('free deluxe rooms for the 11th',
    (SELECT array_agg(r.number ORDER BY r.number) FROM room r
      WHERE r.type = 'DELUXE'
        AND NOT EXISTS (SELECT 1 FROM room_booking b
                         WHERE b.room_id = r.id AND b.status = 'CONFIRMED'
                           AND b.stay && daterange('2026-10-11', '2026-10-12'))) = ARRAY['102']);

-- ---------- wallet ----------
INSERT INTO account (owner, kyc_tier, allow_negative) VALUES ('~bank-settlement', 'FULL', true);
INSERT INTO account (owner, kyc_tier) VALUES ('asha', 'FULL'), ('ravi', 'MIN');

-- transfer(): locks both rows in id order, checks, writes two ledger legs + balances, all in one transaction.
CREATE FUNCTION pg_temp.transfer(p_from BIGINT, p_to BIGINT, p_amount BIGINT, p_key TEXT, p_type TEXT DEFAULT 'TRANSFER')
RETURNS BIGINT AS $$
DECLARE t BIGINT;
BEGIN
    SELECT id INTO t FROM wallet_txn WHERE idempotency_key = p_key;
    IF FOUND THEN RETURN t; END IF;                                   -- retry: return the original
    PERFORM 1 FROM account WHERE id IN (p_from, p_to) ORDER BY id FOR UPDATE;   -- ordered row locks
    INSERT INTO wallet_txn (idempotency_key, type, amount_paise) VALUES (p_key, p_type, p_amount) RETURNING id INTO t;
    INSERT INTO ledger_entry (txn_id, account_id, amount_paise) VALUES (t, p_from, -p_amount), (t, p_to, p_amount);
    UPDATE account SET balance_paise = balance_paise - p_amount WHERE id = p_from;   -- CHECK rejects overdraft
    UPDATE account SET balance_paise = balance_paise + p_amount WHERE id = p_to;
    RETURN t;
END $$ LANGUAGE plpgsql;

SELECT pg_temp.transfer(1, 2, 500000, 'topup-1', 'TOP_UP');
SELECT pg_temp.transfer(2, 3, 120000, 'pay-1');
SELECT pg_temp.transfer(2, 3, 120000, 'pay-1');                           -- retried
SELECT pg_temp.expect('idempotent retry: one debit', (SELECT balance_paise FROM account WHERE owner = 'asha') = 380000);
SELECT pg_temp.expect_error('overdraft rejected by CHECK',
    $$SELECT pg_temp.transfer(3, 2, 999999999, 'pay-2')$$, '23514');
SELECT pg_temp.expect('failed transfer left no ledger rows', (SELECT count(*) FROM wallet_txn WHERE idempotency_key = 'pay-2') = 0);
SELECT pg_temp.expect_error('second refund of the same transaction',
    $$INSERT INTO wallet_txn (idempotency_key, type, amount_paise, reverses_txn_id) VALUES ('r1', 'REFUND', 1, 2), ('r2', 'REFUND', 1, 2)$$, '23505');
SELECT pg_temp.expect('every transaction''s legs sum to zero',
    NOT EXISTS (SELECT txn_id FROM ledger_entry GROUP BY txn_id HAVING sum(amount_paise) <> 0));
SELECT pg_temp.expect('balances equal the sum of ledger entries',
    NOT EXISTS (SELECT 1 FROM account a
                 WHERE a.balance_paise <> coalesce((SELECT sum(amount_paise) FROM ledger_entry e WHERE e.account_id = a.id), 0)));

-- ---------- splitwise ----------
INSERT INTO app_user (name) VALUES ('A'), ('B'), ('C');
INSERT INTO expense (paid_by, amount_paise, split_type) VALUES (1, 10000, 'EQUAL');
INSERT INTO expense_split VALUES (1, 1, 3334), (1, 2, 3333), (1, 3, 3333);
SELECT pg_temp.expect_error('a user appears once per expense',
    $$INSERT INTO expense_split VALUES (1, 2, 1)$$, '23505');
-- net balance per user = paid − owed
SELECT pg_temp.expect('net balances from SQL',
    (SELECT array_agg(net ORDER BY id) FROM (
        SELECT u.id,
               coalesce((SELECT sum(amount_paise) FROM expense e WHERE e.paid_by = u.id), 0)::BIGINT
             - coalesce((SELECT sum(amount_paise) FROM expense_split s WHERE s.user_id = u.id), 0)::BIGINT AS net
          FROM app_user u) x) = ARRAY[6666, -3333, -3333]::BIGINT[]);

-- ---------- payment methods (single-table inheritance) ----------
INSERT INTO payment_method (user_id, type, card_last4, card_expiry) VALUES (1, 'CARD', '4242', '2028-12-01');
INSERT INTO payment_method (user_id, type, upi_vpa) VALUES (1, 'UPI', 'asha@okbank');
SELECT pg_temp.expect_error('UPI row with card columns',
    $$INSERT INTO payment_method (user_id, type, upi_vpa, card_last4, card_expiry) VALUES (1, 'UPI', 'x@y', '1111', '2030-01-01')$$, '23514');
SELECT pg_temp.expect_error('CARD row without card columns',
    $$INSERT INTO payment_method (user_id, type) VALUES (1, 'CARD')$$, '23514');

-- ---------- report ----------
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT * FROM results LOOP
        RAISE NOTICE '% %', CASE WHEN r.ok THEN '✓' ELSE '✗' END, r.name;
    END LOOP;
    IF EXISTS (SELECT 1 FROM results WHERE NOT ok) THEN RAISE EXCEPTION 'schema checks failed'; END IF;
    RAISE NOTICE '✓ schema-design: % checks passed', (SELECT count(*) FROM results);
END $$;
