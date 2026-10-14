-- Schema Design for LLD — the DDL used in the lesson (PostgreSQL 15).
-- Verified by verify.sh together with checks.sql.

CREATE EXTENSION IF NOT EXISTS btree_gist;     -- lets GiST exclusion constraints use plain equality (room_id WITH =)

-- ============================================================
-- 1. Movie booking: availability per (show, seat)
-- ============================================================
CREATE TABLE movie (
    id          BIGSERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    runtime_min INT  NOT NULL CHECK (runtime_min > 0)
);

CREATE TABLE theatre (
    id   BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL
);

CREATE TABLE screen (
    id         BIGSERIAL PRIMARY KEY,
    theatre_id BIGINT NOT NULL REFERENCES theatre(id) ON DELETE CASCADE,   -- composition: screens die with the theatre
    name       TEXT   NOT NULL,
    UNIQUE (theatre_id, name)
);

CREATE TABLE seat (
    id        BIGSERIAL PRIMARY KEY,
    screen_id BIGINT NOT NULL REFERENCES screen(id) ON DELETE CASCADE,
    row_label TEXT   NOT NULL,
    seat_no   INT    NOT NULL,
    seat_type TEXT   NOT NULL CHECK (seat_type IN ('REGULAR', 'PREMIUM', 'RECLINER')),
    UNIQUE (screen_id, row_label, seat_no)
);

CREATE TABLE show (
    id        BIGSERIAL PRIMARY KEY,
    movie_id  BIGINT      NOT NULL REFERENCES movie(id),
    screen_id BIGINT      NOT NULL REFERENCES screen(id),
    starts_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX show_by_movie_and_time ON show (movie_id, starts_at);            -- "shows of this movie from today"

CREATE TABLE booking (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT      NOT NULL,
    show_id      BIGINT      NOT NULL REFERENCES show(id),
    status       TEXT        NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED')),
    amount_paise BIGINT      NOT NULL CHECK (amount_paise >= 0),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per seat per show: the unit of contention.
CREATE TABLE show_seat (
    show_id         BIGINT NOT NULL REFERENCES show(id) ON DELETE CASCADE,
    seat_id         BIGINT NOT NULL REFERENCES seat(id),
    status          TEXT   NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'HELD', 'BOOKED')),
    held_by         BIGINT,
    hold_expires_at TIMESTAMPTZ,
    booking_id      BIGINT REFERENCES booking(id),
    price_paise     BIGINT NOT NULL CHECK (price_paise >= 0),
    version         INT    NOT NULL DEFAULT 0,
    PRIMARY KEY (show_id, seat_id),
    -- the row's state and its columns must agree
    CHECK ((status = 'HELD')   = (held_by IS NOT NULL AND hold_expires_at IS NOT NULL)),
    CHECK ((status = 'BOOKED') = (booking_id IS NOT NULL))
);

-- ============================================================
-- 2. Parking lot: at most one active ticket per spot and per plate
-- ============================================================
CREATE TABLE parking_spot (
    id        BIGSERIAL PRIMARY KEY,
    floor     INT  NOT NULL,
    number    INT  NOT NULL,
    size      TEXT NOT NULL CHECK (size IN ('SMALL', 'MEDIUM', 'LARGE')),
    UNIQUE (floor, number)
);

CREATE TABLE parking_ticket (
    id        BIGSERIAL PRIMARY KEY,
    spot_id   BIGINT      NOT NULL REFERENCES parking_spot(id),
    plate     TEXT        NOT NULL,
    entry_at  TIMESTAMPTZ NOT NULL,
    exit_at   TIMESTAMPTZ,
    fee_paise BIGINT,
    CHECK (exit_at IS NULL OR exit_at >= entry_at),
    CHECK ((exit_at IS NULL) = (fee_paise IS NULL))
);
-- Partial unique indexes: uniqueness only among rows that are still active.
CREATE UNIQUE INDEX one_active_ticket_per_spot  ON parking_ticket (spot_id) WHERE exit_at IS NULL;
CREATE UNIQUE INDEX one_active_ticket_per_plate ON parking_ticket (plate)   WHERE exit_at IS NULL;

-- ============================================================
-- 3. Hotel: no overlapping stays in the same room
-- ============================================================
CREATE TABLE room (
    id     BIGSERIAL PRIMARY KEY,
    number TEXT NOT NULL UNIQUE,
    type   TEXT NOT NULL CHECK (type IN ('DELUXE', 'SUITE'))
);

CREATE TABLE room_booking (
    id       BIGSERIAL PRIMARY KEY,
    room_id  BIGINT    NOT NULL REFERENCES room(id),
    guest_id BIGINT    NOT NULL,
    stay     DATERANGE NOT NULL CHECK (lower(stay) < upper(stay)),   -- '[2026-10-10,2026-10-12)': half-open by default
    status   TEXT      NOT NULL CHECK (status IN ('CONFIRMED', 'CANCELLED')),
    EXCLUDE USING gist (room_id WITH =, stay WITH &&) WHERE (status = 'CONFIRMED')
);

-- ============================================================
-- 4. Wallet: double-entry ledger with idempotency
-- ============================================================
CREATE TABLE account (
    id             BIGSERIAL PRIMARY KEY,
    owner          TEXT    NOT NULL UNIQUE,
    kyc_tier       TEXT    NOT NULL CHECK (kyc_tier IN ('MIN', 'FULL')),
    balance_paise  BIGINT  NOT NULL DEFAULT 0,
    allow_negative BOOLEAN NOT NULL DEFAULT false,                    -- only the bank settlement account
    frozen         BOOLEAN NOT NULL DEFAULT false,
    CHECK (allow_negative OR balance_paise >= 0)
);

CREATE TABLE wallet_txn (
    id              BIGSERIAL PRIMARY KEY,
    idempotency_key TEXT        NOT NULL UNIQUE,                        -- a retried request can't insert twice
    type            TEXT        NOT NULL CHECK (type IN ('TOP_UP', 'TRANSFER', 'REFUND')),
    amount_paise    BIGINT      NOT NULL CHECK (amount_paise > 0),
    reverses_txn_id BIGINT      UNIQUE REFERENCES wallet_txn(id),       -- at most one refund per transaction
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ledger_entry (
    id           BIGSERIAL PRIMARY KEY,
    txn_id       BIGINT NOT NULL REFERENCES wallet_txn(id),
    account_id   BIGINT NOT NULL REFERENCES account(id),
    amount_paise BIGINT NOT NULL CHECK (amount_paise <> 0)              -- negative = debit, positive = credit
);
CREATE INDEX ledger_by_account ON ledger_entry (account_id, id);      -- statements, newest last

-- ============================================================
-- 5. Splitwise: expenses and their splits
-- ============================================================
CREATE TABLE app_user (
    id   BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE expense (
    id           BIGSERIAL PRIMARY KEY,
    paid_by      BIGINT NOT NULL REFERENCES app_user(id),
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    split_type   TEXT   NOT NULL CHECK (split_type IN ('EQUAL', 'EXACT', 'PERCENT', 'SHARES')),
    description  TEXT
);

CREATE TABLE expense_split (
    expense_id   BIGINT NOT NULL REFERENCES expense(id) ON DELETE CASCADE,
    user_id      BIGINT NOT NULL REFERENCES app_user(id),
    amount_paise BIGINT NOT NULL CHECK (amount_paise >= 0),
    PRIMARY KEY (expense_id, user_id)                                   -- a user appears once per expense
);

-- ============================================================
-- 6. Inheritance: payment methods (single table, discriminator column)
-- ============================================================
CREATE TABLE payment_method (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES app_user(id),
    type        TEXT   NOT NULL CHECK (type IN ('CARD', 'UPI')),
    card_last4  CHAR(4),
    card_expiry DATE,
    upi_vpa     TEXT,
    -- each subtype's columns are present exactly when the row is of that subtype
    CHECK ((type = 'CARD') = (card_last4 IS NOT NULL AND card_expiry IS NOT NULL)),
    CHECK ((type = 'UPI')  = (upi_vpa IS NOT NULL))
);
