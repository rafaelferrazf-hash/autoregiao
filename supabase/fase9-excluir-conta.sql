-- Fase 9: "Excluir minha conta" dentro do site/app (exigência da App Store, regra 5.1.1(v)).
-- Chamada pelo próprio usuário logado (rota /api/conta/excluir). Apaga os dados dele; o login (auth.users)
-- e os arquivos do Storage são apagados em seguida pela rota, com a service key.
-- Se a loja tem pagamentos, a loja fica ANONIMIZADA (sem nome, contatos, endereço, logo) só para manter o
-- registro fiscal dos pagamentos, como diz /excluir-conta.

create or replace function public.excluir_minha_conta()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_loja uuid;
  v_tem_pagamento boolean := false;
  v_anuncios integer := 0;
begin
  if v_uid is null then
    raise exception 'sem_login';
  end if;

  select email into v_email from auth.users where id = v_uid;
  select id into v_loja from public.lojas where usuario_id = v_uid limit 1;

  -- Anúncios (as estatísticas em eventos_veiculo saem junto, por cascata).
  delete from public.veiculos
   where usuario_id = v_uid or (v_loja is not null and loja_id = v_loja);
  get diagnostics v_anuncios = row_count;

  -- Alertas de veículos do e-mail da conta.
  if v_email is not null then
    delete from public.alertas where lower(email) = lower(v_email);
  end if;

  -- Histórico de cupons usados (não é exigido por lei).
  begin
    delete from public.cupons_usados where usuario_id = v_uid or (v_loja is not null and loja_id = v_loja);
  exception when others then null;
  end;

  if v_loja is not null then
    select exists (select 1 from public.pagamentos where loja_id = v_loja) into v_tem_pagamento;
    if v_tem_pagamento then
      update public.lojas
         set nome = 'Loja removida', telefone = null, whatsapp = null, endereco = null,
             descricao = null, horario = null, logo_url = null, ativo = false
       where id = v_loja;
      -- Solta o vínculo com o login (se a coluna aceitar vazio), para o login poder ser apagado.
      begin
        update public.lojas set usuario_id = null where id = v_loja;
      exception when others then null;
      end;
    else
      delete from public.lojas where id = v_loja;
    end if;
  end if;

  return json_build_object('anuncios_apagados', v_anuncios, 'loja_mantida_por_pagamentos', v_tem_pagamento);
end;
$$;

revoke all on function public.excluir_minha_conta() from public, anon;
grant execute on function public.excluir_minha_conta() to authenticated;
