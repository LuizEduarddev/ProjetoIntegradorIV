-- +goose Up
-- +goose StatementBegin
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  role       TEXT NOT NULL,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_user_role CHECK (role IN ('admin', 'waiter', 'kitchen'))
);

INSERT INTO users (id, name, email, password, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin User',   'admin',   'Oidudu2235.', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'Waiter User',  'waiter',  'Oidudu2235.', 'waiter'),
  ('33333333-3333-3333-3333-333333333333', 'Kitchen User', 'kitchen', 'Oidudu2235.', 'kitchen');

CREATE TABLE tables (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number     INT UNIQUE NOT NULL,
  status     TEXT NOT NULL DEFAULT 'free',
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_table_status CHECK (status IN ('free', 'occupied', 'waiting', 'closed'))
);

INSERT INTO tables (id, number, status) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 'free'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, 'free'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 'free'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 4, 'free'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 5, 'free'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 6, 'free');

CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category    TEXT,
  available   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO products (id, name, description, price, category, available) VALUES
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'X-Burger',     'Beef burger with cheese and lettuce',        25.90, 'food',     TRUE),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'X-Bacon',      'Beef burger with bacon and cheddar',         29.90, 'food',     TRUE),
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'Fries',        'Crispy salted french fries',                 12.00, 'food',     TRUE),
  ('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'Onion Rings',  'Battered and fried onion rings',             14.00, 'food',     TRUE),
  ('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', 'Caesar Salad', 'Romaine lettuce, croutons, caesar dressing', 18.00, 'food',     TRUE),
  ('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6', 'Coke 350ml',   'Chilled Coca-Cola can',                       7.00, 'beverage', TRUE),
  ('a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7', 'Orange Juice', 'Freshly squeezed orange juice',               9.00, 'beverage', TRUE),
  ('b8b8b8b8-b8b8-b8b8-b8b8-b8b8b8b8b8b8', 'Water 500ml',  'Still mineral water',                         4.00, 'beverage', TRUE),
  ('c9c9c9c9-c9c9-c9c9-c9c9-c9c9c9c9c9c9', 'Beer 600ml',   'Draft-style lager bottle',                   12.00, 'beverage', TRUE),
  ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'Ice Cream',    'Two scoops vanilla or chocolate',            10.00, 'dessert',  TRUE);

CREATE TABLE orders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id   UUID NOT NULL REFERENCES tables(id),
  waiter_id  UUID NOT NULL REFERENCES users(id),
  status     TEXT NOT NULL DEFAULT 'open',
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_order_status CHECK (status IN ('open', 'sent', 'closed', 'cancelled'))
);

CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id),
  quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price  NUMERIC(10,2) NOT NULL,
  notes       TEXT,
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_item_status CHECK (status IN ('pending', 'preparing', 'ready'))
);

CREATE INDEX idx_orders_table_id   ON orders(table_id);
CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_orders_waiter_id  ON orders(waiter_id);
CREATE INDEX idx_order_items_order  ON order_items(order_id);
CREATE INDEX idx_order_items_status ON order_items(status);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_order_items_status;
DROP INDEX IF EXISTS idx_order_items_order;
DROP INDEX IF EXISTS idx_orders_waiter_id;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_table_id;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS tables;
DROP TABLE IF EXISTS users;
-- +goose StatementEnd