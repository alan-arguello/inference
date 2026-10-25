-- Registros de los formularios del sitio de SIS (proyecto Supabase "SIS", ref vfenkhnmcetmkgxnpanr).
create extension if not exists citext with schema extensions;

create table public.sis_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  nombre text not null check (char_length(btrim(nombre)) between 2 and 120),
  correo extensions.citext not null check (correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(correo) <= 254),
  empresa text not null check (char_length(btrim(empresa)) between 1 and 160),
  cargo text not null check (char_length(btrim(cargo)) between 1 and 160),
  pais text not null check (char_length(btrim(pais)) between 2 and 80),
  whatsapp text not null check (whatsapp ~ '^[+0-9 ()\-.]{7,25}$'),
  linkedin text not null check (char_length(btrim(linkedin)) between 5 and 300),
  retos text not null check (char_length(btrim(retos)) between 3 and 4000),
  aporte text check (aporte is null or char_length(aporte) <= 4000),
  estado text not null default 'nueva' check (estado in ('nueva', 'en_revision', 'aceptada', 'rechazada')),
  notas text,
  pagina text check (pagina is null or char_length(pagina) <= 300),
  referrer text check (referrer is null or char_length(referrer) <= 500),
  utm_source text check (utm_source is null or char_length(utm_source) <= 120),
  utm_medium text check (utm_medium is null or char_length(utm_medium) <= 120),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 120)
);
comment on table public.sis_applications is 'Aplicaciones a la comunidad SIS (formulario "Aplicar" de la página principal).';
create unique index sis_applications_correo_key on public.sis_applications (correo);
create index sis_applications_created_at_idx on public.sis_applications (created_at desc);
create index sis_applications_estado_idx on public.sis_applications (estado);

create table public.sv_reservations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  nombre text not null check (char_length(btrim(nombre)) between 2 and 120),
  correo extensions.citext not null check (correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(correo) <= 254),
  whatsapp text not null check (whatsapp ~ '^[+0-9 ()\-.]{7,25}$'),
  linkedin text not null check (char_length(btrim(linkedin)) between 5 and 300),
  proyecto text check (proyecto is null or char_length(proyecto) <= 4000),
  estado text not null default 'nueva' check (estado in ('nueva', 'contactada', 'pago_pendiente', 'pagada', 'cancelada')),
  precio_usd integer not null default 3500 check (precio_usd > 0),
  notas text,
  pagina text check (pagina is null or char_length(pagina) <= 300),
  referrer text check (referrer is null or char_length(referrer) <= 500),
  utm_source text check (utm_source is null or char_length(utm_source) <= 120),
  utm_medium text check (utm_medium is null or char_length(utm_medium) <= 120),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 120)
);
comment on table public.sv_reservations is 'Lugares apartados para Silicon Valley Immersion 2027 (formulario de /silicon-valley).';
create unique index sv_reservations_correo_key on public.sv_reservations (correo);
create index sv_reservations_created_at_idx on public.sv_reservations (created_at desc);
create index sv_reservations_estado_idx on public.sv_reservations (estado);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger sis_applications_set_updated_at before update on public.sis_applications
  for each row execute function public.set_updated_at();
create trigger sv_reservations_set_updated_at before update on public.sv_reservations
  for each row execute function public.set_updated_at();

-- El sitio público solo puede insertar. Con la llave pública nadie puede leer, editar ni borrar.
alter table public.sis_applications enable row level security;
alter table public.sv_reservations enable row level security;

revoke all on public.sis_applications from anon, authenticated;
revoke all on public.sv_reservations from anon, authenticated;
grant insert (nombre, correo, empresa, cargo, pais, whatsapp, linkedin, retos, aporte, pagina, referrer, utm_source, utm_medium, utm_campaign)
  on public.sis_applications to anon;
grant insert (nombre, correo, whatsapp, linkedin, proyecto, pagina, referrer, utm_source, utm_medium, utm_campaign)
  on public.sv_reservations to anon;

create policy "Sitio público puede enviar aplicaciones"
  on public.sis_applications for insert to anon
  with check (estado = 'nueva' and notas is null);

create policy "Sitio público puede apartar lugar"
  on public.sv_reservations for insert to anon
  with check (estado = 'nueva' and notas is null and precio_usd = 3500);
