-- Fase 10: alertas com aviso no celular (app de iPhone).
-- No app, a pessoa pode criar o alerta sem e-mail: o aviso vai por notificação para aquele aparelho
-- (token do serviço de notificações da Apple). Alerta tem e-mail OU token do aparelho.

alter table public.alertas add column if not exists push_token text;
alter table public.alertas alter column email drop not null;
alter table public.alertas drop constraint if exists alertas_email_check;
alter table public.alertas add constraint alertas_email_check
  check (email is null or char_length(email) between 5 and 200);
alter table public.alertas drop constraint if exists alertas_email_ou_push;
alter table public.alertas add constraint alertas_email_ou_push
  check (email is not null or (push_token is not null and char_length(push_token) between 32 and 200));

create index if not exists alertas_push on public.alertas (push_token) where push_token is not null;
