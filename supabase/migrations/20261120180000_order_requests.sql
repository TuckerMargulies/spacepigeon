-- Order requests from spacepigeon.net. A request is not a purchase: nothing is charged.
--
-- Access: written and read only by the site's server functions with the service-role key
-- (api/_lib/db.js), after each request is verified (validated + rate-limited for the public
-- form; signed session + allow-list for admin). The anon and authenticated roles get no
-- privileges and no policies, so the public API can neither read nor write this table.

create table public.order_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (reference ~ '^SP-[A-Z2-9]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  product text not null check (product in ('SPH72', 'SPH42', 'PATCH')),
  quantity integer not null check (quantity between 1 and 10),
  unit_price_cents bigint check (unit_price_cents is null or unit_price_cents >= 0),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  shipping_address jsonb not null,
  notes text check (notes is null or char_length(notes) <= 1000),
  status text not null default 'new' check (status in ('new', 'contacted', 'fulfilled', 'cancelled'))
);

create index order_requests_created_at_idx on public.order_requests (created_at desc);

alter table public.order_requests enable row level security;

-- No policies for anon or authenticated: SELECT, INSERT, UPDATE and DELETE are all denied to them.
revoke all on table public.order_requests from anon, authenticated, service_role;
grant select, insert on table public.order_requests to service_role;
grant update (status, updated_at) on table public.order_requests to service_role;
-- DELETE is not granted to anyone: requests are kept; cancel instead.
