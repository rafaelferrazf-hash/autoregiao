-- Fase 13: anúncios de DEMONSTRAÇÃO (para apresentar o app), na loja Auto Paulista.
-- Ficam marcados (veiculos.demonstracao = true): fora do Google, do sitemap e dos e-mails de alerta.
-- Fotos com licença livre (Wikimedia Commons), guardadas no próprio site em /demo/.
-- O valor da FIPE de cada um é preenchido pelo site na rotina diária (12h UTC).
--
-- PARA APAGAR TODOS ANTES DO LANÇAMENTO, rodar só esta linha:
--   delete from public.veiculos where demonstracao = true;

alter table public.veiculos add column if not exists demonstracao boolean not null default false;

with loja as (
  select id, usuario_id, coalesce(whatsapp, telefone) as telefone, cidade, nome
  from public.lojas where id = '9c29ad84-1ab6-4e16-8c72-a5916185cabc'
)
insert into public.veiculos (
  nome, tipo, marca, modelo, versao, ano, km, cambio, combustivel, cor, portas, carroceria,
  preco, aceita_troca, opcionais, descricao, fotos, ativo, status,
  fipe_tipo, fipe_marca, fipe_modelo, fipe_ano, fipe_nome, demonstracao, criado_em,
  usuario_id, loja_id, nome_contato, telefone, cidade
)
select d.*, loja.usuario_id, loja.id, loja.nome, loja.telefone, loja.cidade
from loja, (values
  ('Chevrolet Onix Hatch LT 1.0 8V FlexPower 5p Mec. 2019', 'carro', 'Chevrolet', 'Onix', 'Onix Hatch LT 1.0 8V FlexPower 5p Mec.', '2019', '78000', 'Manual', 'Flex', 'Branco', '4 portas', 'Hatch', 51000, true, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS', 'Central multimídia']::text[], 'Onix LT bem conservado, revisões em dia, pneus bons. Carro econômico, ideal para o dia a dia.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: Matti Blume (CC BY-SA 4.0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/onix-1.jpg']::text[], true, 'ativo', 'cars', '23', '6232', '2019-5', 'Chevrolet Onix Hatch LT 1.0 8V FlexPower 5p Mec. 2019 Flex', true, now() - interval '2 days'),
  ('Chevrolet Onix SED. Plus Prem. 1.0 12V TB Flex Aut 2023', 'carro', 'Chevrolet', 'Onix', 'Onix SED. Plus Prem. 1.0 12V TB Flex Aut', '2023', '21000', 'Automático', 'Flex', 'Branco', '4 portas', 'Sedã', 77100, true, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS', 'Central multimídia', 'Bluetooth', 'Câmera de ré', 'Sensor de estacionamento', 'Rodas de liga', 'Bancos de couro', 'Controle de tração', 'Piloto automático', 'Ar digital']::text[], 'Onix Plus Premier turbo automático, único dono, todas as revisões na concessionária. Wi-Fi nativo e partida sem chave.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: Just a Man (CC BY 4.0); Just a Man (CC BY 4.0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/onixplus-1.jpg', 'https://www.autoregiao.com.br/demo/onixplus-2.jpg']::text[], true, 'ativo', 'cars', '23', '8823', '2023-5', 'Chevrolet Onix SED. Plus Prem. 1.0 12V TB Flex Aut 2023 Flex', true, now() - interval '3 days'),
  ('Hyundai HB20 Comfort 1.0 Flex 12V Mec. 2023', 'carro', 'Hyundai', 'HB20', 'HB20 Comfort 1.0 Flex 12V Mec.', '2023', '32000', 'Manual', 'Flex', 'Cinza', '4 portas', 'Hatch', 65000, false, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS', 'Bluetooth']::text[], 'HB20 Comfort muito econômico, manual e chave reserva. Pronto para transferir.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: Just a Man (CC BY 4.0); Just a Man (CC BY 4.0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/hb20-1.jpg', 'https://www.autoregiao.com.br/demo/hb20-2.jpg']::text[], true, 'ativo', 'cars', '26', '9906', '2023-5', 'Hyundai HB20 Comfort 1.0 Flex 12V Mec. 2023 Flex', true, now() - interval '4 days'),
  ('Fiat Strada Freedom 1.3 Flex 8V CD 2023', 'carro', 'Fiat', 'Strada', 'Strada Freedom 1.3 Flex 8V CD', '2023', '18000', 'Manual', 'Flex', 'Prata', '4 portas', 'Picape', 96300, false, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS', 'Central multimídia', 'Bluetooth', 'Câmera de ré', 'Sensor de estacionamento', 'Rodas de liga']::text[], 'Strada Freedom cabine dupla, protetor de caçamba e capota marítima. Ótima para trabalho e família.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: NaBUru38 (CC BY-SA 4.0); NaBUru38 (CC BY-SA 4.0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/strada-1.jpg', 'https://www.autoregiao.com.br/demo/strada-2.jpg']::text[], true, 'ativo', 'cars', '21', '9111', '2023-5', 'Fiat Strada Freedom 1.3 Flex 8V CD 2023 Flex', true, now() - interval '5 days'),
  ('Toyota Hilux CD SRV 4x4 2.8 TDI Diesel Aut. 2021', 'carro', 'Toyota', 'Hilux', 'Hilux CD SRV 4x4 2.8 TDI Diesel Aut.', '2021', '96000', 'Automático', 'Diesel', 'Prata', '4 portas', 'Picape', 189400, true, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS', 'Central multimídia', 'Bluetooth', 'Câmera de ré', 'Sensor de estacionamento', 'Rodas de liga', 'Bancos de couro', 'Controle de tração', 'Piloto automático', 'Ar digital']::text[], 'Hilux SRV 4x4 diesel automática, revisada, pneus novos. Caminhonete pronta para qualquer estrada da região.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: Chanokchon (CC BY-SA 4.0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/hilux-1.jpg']::text[], true, 'ativo', 'cars', '56', '7406', '2021-3', 'Toyota Hilux CD SRV 4x4 2.8 TDI Diesel Aut. 2021 Diesel', true, now() - interval '6 days'),
  ('Fiat Toro Volcano 2.0 16V 4x4 TB Diesel Aut. 2021', 'carro', 'Fiat', 'Toro', 'Toro Volcano 2.0 16V 4x4 TB Diesel Aut.', '2021', '84000', 'Automático', 'Diesel', 'Prata', '4 portas', 'Picape', 108500, true, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS', 'Central multimídia', 'Bluetooth', 'Câmera de ré', 'Sensor de estacionamento', 'Rodas de liga', 'Bancos de couro', 'Controle de tração', 'Piloto automático', 'Ar digital']::text[], 'Toro Volcano 4x4 diesel, couro, multimídia com Android Auto/CarPlay. Muito bem cuidada.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: NaBUru38 (CC BY-SA 4.0); NaBUru38 (CC BY-SA 4.0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/toro-1.jpg', 'https://www.autoregiao.com.br/demo/toro-2.jpg']::text[], true, 'ativo', 'cars', '21', '7479', '2021-3', 'Fiat Toro Volcano 2.0 16V 4x4 TB Diesel Aut. 2021 Diesel', true, now() - interval '7 days'),
  ('Jeep Compass Long. T270 1.3 TB 4x2 Flex Aut. 2022', 'carro', 'Jeep', 'Compass', 'Compass Long. T270 1.3 TB 4x2 Flex Aut.', '2022', '41000', 'Automático', 'Flex', 'Branco', '4 portas', 'SUV', 116100, false, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS', 'Central multimídia', 'Bluetooth', 'Câmera de ré', 'Sensor de estacionamento', 'Rodas de liga', 'Bancos de couro', 'Controle de tração', 'Piloto automático', 'Ar digital']::text[], 'Compass Longitude T270 turbo flex, teto solar não, mas tudo o mais que você precisa. IPVA pago.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: Alexander Migl (CC BY-SA 4.0); Alexander Migl (CC BY-SA 4.0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/compass-1.jpg', 'https://www.autoregiao.com.br/demo/compass-2.jpg']::text[], true, 'ativo', 'cars', '29', '9457', '2022-5', 'Jeep Compass Long. T270 1.3 TB 4x2 Flex Aut. 2022 Flex', true, now() - interval '8 days'),
  ('Hyundai Creta Limited 1.0 TB 12V Flex Aut. 2023', 'carro', 'Hyundai', 'Creta', 'Creta Limited 1.0 TB 12V Flex Aut.', '2023', '15000', 'Automático', 'Flex', 'Cinza', '4 portas', 'SUV', 111000, false, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS', 'Central multimídia', 'Bluetooth', 'Câmera de ré', 'Sensor de estacionamento', 'Rodas de liga', 'Bancos de couro', 'Controle de tração', 'Piloto automático', 'Ar digital']::text[], 'Creta Limited turbo, seminovo com garantia de fábrica. Painel digital e central multimídia.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: Andra Febrian (CC BY-SA 4.0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/creta-1.jpg']::text[], true, 'ativo', 'cars', '26', '9602', '2023-5', 'Hyundai Creta Limited 1.0 TB 12V Flex Aut. 2023 Flex', true, now() - interval '9 days'),
  ('Volkswagen Polo Highline 200 TSI 1.0 Flex 12V Aut. 2020', 'carro', 'Volkswagen', 'Polo', 'Polo Highline 200 TSI 1.0 Flex 12V Aut.', '2020', '52000', 'Automático', 'Flex', 'Branco', '4 portas', 'Hatch', 79100, true, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS', 'Central multimídia', 'Bluetooth', 'Câmera de ré', 'Sensor de estacionamento', 'Rodas de liga', 'Bancos de couro', 'Controle de tração', 'Piloto automático', 'Ar digital']::text[], 'Polo Highline 200 TSI, painel digital, muito econômico na estrada. Laudo cautelar aprovado.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: Dinkun Chen (CC BY-SA 4.0); Dinkun Chen (CC BY-SA 4.0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/polo-1.jpg', 'https://www.autoregiao.com.br/demo/polo-2.jpg']::text[], true, 'ativo', 'cars', '59', '8069', '2020-5', 'Volkswagen Polo Highline 200 TSI 1.0 Flex 12V Aut. 2020 Flex', true, now() - interval '10 days'),
  ('Toyota Corolla XEi 2.0 Flex 16V Aut. 2021', 'carro', 'Toyota', 'Corolla', 'Corolla XEi 2.0 Flex 16V Aut.', '2021', '58000', 'Automático', 'Flex', 'Prata', '4 portas', 'Sedã', 112100, true, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS', 'Central multimídia', 'Bluetooth', 'Câmera de ré', 'Sensor de estacionamento', 'Rodas de liga', 'Bancos de couro', 'Controle de tração', 'Piloto automático', 'Ar digital']::text[], 'Corolla XEi 2.0, carro de família, sempre na garagem. Revisões Toyota em dia.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: LuvsMG481 (CC BY-SA 4.0); LuvsMG481 (CC BY-SA 4.0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/corolla-1.jpg', 'https://www.autoregiao.com.br/demo/corolla-2.jpg']::text[], true, 'ativo', 'cars', '56', '5194', '2021-5', 'Toyota Corolla XEi 2.0 Flex 16V Aut. 2021 Flex', true, now() - interval '11 days'),
  ('Nissan Kicks Advance 1.6 16V Flex Aut. 2022', 'carro', 'Nissan', 'Kicks', 'Kicks Advance 1.6 16V Flex Aut.', '2022', '38000', 'Automático', 'Flex', 'Branco', '4 portas', 'SUV', 91100, false, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS', 'Central multimídia', 'Bluetooth', 'Câmera de ré', 'Sensor de estacionamento', 'Rodas de liga', 'Piloto automático']::text[], 'Kicks Advance CVT, confortável e econômico. Pneus novos e manual do proprietário.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: Dinkun Chen (CC BY-SA 4.0); Dinkun Chen (CC BY-SA 4.0); Dinkun Chen (CC BY-SA 4.0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/kicks-1.jpg', 'https://www.autoregiao.com.br/demo/kicks-2.jpg', 'https://www.autoregiao.com.br/demo/kicks-3.jpg']::text[], true, 'ativo', 'cars', '43', '9335', '2022-5', 'Nissan Kicks Advance 1.6 16V Flex Aut. 2022 Flex', true, now() - interval '12 days'),
  ('Chevrolet S10 Pick-Up LTZ 2.8 TDI 4x4 CD Dies.Aut 2020', 'carro', 'Chevrolet', 'S10', 'S10 Pick-Up LTZ 2.8 TDI 4x4 CD Dies.Aut', '2020', '112000', 'Automático', 'Diesel', 'Prata', '4 portas', 'Picape', 145400, true, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS', 'Central multimídia', 'Bluetooth', 'Câmera de ré', 'Sensor de estacionamento', 'Rodas de liga', 'Bancos de couro', 'Controle de tração', 'Piloto automático', 'Ar digital']::text[], 'S10 LTZ 4x4 diesel automática, engate e santo antônio. Revisada para viagem.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: RL GNZLZ from Chile (CC BY-SA 2.0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/s10-1.jpg']::text[], true, 'ativo', 'cars', '23', '5896', '2020-3', 'Chevrolet S10 Pick-Up LTZ 2.8 TDI 4x4 CD Dies.Aut 2020 Diesel', true, now() - interval '13 days'),
  ('Chevrolet Tracker Premier 1.2 Turbo 12V Flex Aut. 2022', 'carro', 'Chevrolet', 'Tracker', 'Tracker Premier 1.2 Turbo 12V Flex Aut.', '2022', '29000', 'Automático', 'Flex', 'Azul', '4 portas', 'SUV', 102200, false, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS', 'Central multimídia', 'Bluetooth', 'Câmera de ré', 'Sensor de estacionamento', 'Rodas de liga', 'Bancos de couro', 'Controle de tração', 'Piloto automático', 'Ar digital']::text[], 'Tracker Premier turbo, teto panorâmico, Wi-Fi e alerta de ponto cego. Impecável.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: Autosdeprimera (CC BY 3.0); Autosdeprimera (CC BY 3.0); Autosdeprimera (CC BY 3.0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/tracker-1.jpg', 'https://www.autoregiao.com.br/demo/tracker-2.jpg', 'https://www.autoregiao.com.br/demo/tracker-3.jpg']::text[], true, 'ativo', 'cars', '23', '9048', '2022-5', 'Chevrolet Tracker Premier 1.2 Turbo 12V Flex Aut. 2022 Flex', true, now() - interval '14 days'),
  ('Volkswagen T-Cross Comfor. 200 TSI 1.0 Flex 5p Aut. 2021', 'carro', 'Volkswagen', 'T-Cross', 'T-Cross Comfor. 200 TSI 1.0 Flex 5p Aut.', '2021', '47000', 'Automático', 'Flex', 'Cinza', '4 portas', 'SUV', 94000, true, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS', 'Central multimídia', 'Bluetooth', 'Câmera de ré', 'Sensor de estacionamento', 'Rodas de liga', 'Piloto automático']::text[], 'T-Cross Comfortline 200 TSI, ótimo espaço interno e porta-malas. Revisões em dia.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: Alexander Migl (CC BY-SA 4.0); Alexander Migl (CC BY-SA 4.0); Alexander Migl (CC BY-SA 4.0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/tcross-1.jpg', 'https://www.autoregiao.com.br/demo/tcross-2.jpg', 'https://www.autoregiao.com.br/demo/tcross-3.jpg']::text[], true, 'ativo', 'cars', '59', '10374', '2021-5', 'Volkswagen T-Cross Comfor. 200 TSI 1.0 Flex 5p Aut. 2021 Flex', true, now() - interval '15 days'),
  ('Fiat Argo Drive 1.0 6V Flex 2022', 'carro', 'Fiat', 'Argo', 'Argo Drive 1.0 6V Flex', '2022', '36000', 'Manual', 'Flex', 'Vermelho', '4 portas', 'Hatch', 61100, false, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS', 'Central multimídia', 'Bluetooth', 'Câmera de ré', 'Sensor de estacionamento', 'Rodas de liga']::text[], 'Argo Drive 1.0, econômico e bem equipado. Ideal como primeiro carro.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: JasonVogel (CC BY-SA 4.0); JasonVogel (CC BY-SA 4.0); Heduardo55 (CC0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/argo-1.jpg', 'https://www.autoregiao.com.br/demo/argo-2.jpg', 'https://www.autoregiao.com.br/demo/argo-3.jpg']::text[], true, 'ativo', 'cars', '21', '7965', '2022-5', 'Fiat Argo Drive 1.0 6V Flex 2022 Flex', true, now() - interval '16 days'),
  ('Renault Kwid Zen 1.0 Flex 12V 5p Mec. 2023', 'carro', 'Renault', 'Kwid', 'Kwid Zen 1.0 Flex 12V 5p Mec.', '2023', '12000', 'Manual', 'Flex', 'Branco', '4 portas', 'Hatch', 48500, false, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS', 'Central multimídia']::text[], 'Kwid Zen praticamente zero, baixa quilometragem. Muito econômico.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: NaBUru38 (CC BY-SA 4.0); NaBUru38 (CC BY-SA 4.0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/kwid-1.jpg', 'https://www.autoregiao.com.br/demo/kwid-2.jpg']::text[], true, 'ativo', 'cars', '48', '8023', '2023-5', 'Renault Kwid Zen 1.0 Flex 12V 5p Mec. 2023 Flex', true, now() - interval '17 days'),
  ('Honda HR-V EXL 1.8 Flexone 16V 5p Aut. 2019', 'carro', 'Honda', 'HR-V', 'HR-V EXL 1.8 Flexone 16V 5p Aut.', '2019', '69000', 'Automático', 'Flex', 'Branco', '4 portas', 'SUV', 98600, true, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS', 'Central multimídia', 'Bluetooth', 'Câmera de ré', 'Sensor de estacionamento', 'Rodas de liga', 'Bancos de couro', 'Controle de tração', 'Piloto automático', 'Ar digital']::text[], 'HR-V EXL, couro, câmera multivisão e bancos mágicos. Muito confortável.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: Vauxford (CC BY-SA 4.0); オーバードライブ83 (CC BY-SA 4.0); Vauxford (CC BY-SA 4.0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/hrv-1.jpg', 'https://www.autoregiao.com.br/demo/hrv-2.jpg', 'https://www.autoregiao.com.br/demo/hrv-3.jpg']::text[], true, 'ativo', 'cars', '25', '7151', '2019-5', 'Honda HR-V EXL 1.8 Flexone 16V 5p Aut. 2019 Flex', true, now() - interval '18 days'),
  ('Volkswagen Saveiro Robust 1.6 Total Flex 16V CD 2023', 'carro', 'Volkswagen', 'Saveiro', 'Saveiro Robust 1.6 Total Flex 16V CD', '2023', '26000', 'Manual', 'Flex', 'Branco', '4 portas', 'Picape', 74900, false, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS', 'Bluetooth']::text[], 'Saveiro Robust cabine dupla, pronta para o trabalho. Caçamba com protetor.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: Just a Man (CC BY 4.0); Just a Man (CC BY 4.0); Just a Man (CC BY 4.0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/saveiro-1.jpg', 'https://www.autoregiao.com.br/demo/saveiro-2.jpg', 'https://www.autoregiao.com.br/demo/saveiro-3.jpg']::text[], true, 'ativo', 'cars', '59', '10142', '2023-5', 'Volkswagen Saveiro Robust 1.6 Total Flex 16V CD 2023 Flex', true, now() - interval '19 days'),
  ('Ford Ranger XLS 2.2 4x4 CD Diesel Aut. 2019', 'carro', 'Ford', 'Ranger', 'Ranger XLS 2.2 4x4 CD Diesel Aut.', '2019', '121000', 'Automático', 'Diesel', 'Vermelho', '4 portas', 'Picape', 118000, true, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS', 'Central multimídia', 'Bluetooth', 'Câmera de ré', 'Sensor de estacionamento', 'Rodas de liga', 'Bancos de couro', 'Controle de tração', 'Piloto automático', 'Ar digital']::text[], 'Ranger XLS 4x4 diesel automática, forte e confiável. Revisões feitas na Ford.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: RL GNZLZ (CC BY-SA 2.0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/ranger-1.jpg']::text[], true, 'ativo', 'cars', '22', '7590', '2019-3', 'Ford Ranger XLS 2.2 4x4 CD Diesel Aut. 2019 Diesel', true, now() - interval '20 days'),
  ('Fiat Mobi Like 1.0 Fire Flex 5p. 2022', 'carro', 'Fiat', 'Mobi', 'Mobi Like 1.0 Fire Flex 5p.', '2022', '33000', 'Manual', 'Flex', 'Vermelho', '4 portas', 'Hatch', 50000, false, array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Alarme', 'Airbag', 'ABS']::text[], 'Mobi Like, compacto e econômico, ótimo para a cidade. Chave reserva e manual.

Anúncio de demonstração — veículo ilustrativo, não está à venda.
Fotos: NaBUru38 (CC BY-SA 4.0); NaBUru38 (CC BY-SA 4.0); NaBUru38 (CC BY-SA 4.0), via Wikimedia Commons.', array['https://www.autoregiao.com.br/demo/mobi-1.jpg', 'https://www.autoregiao.com.br/demo/mobi-2.jpg', 'https://www.autoregiao.com.br/demo/mobi-3.jpg']::text[], true, 'ativo', 'cars', '21', '7540', '2022-5', 'Fiat Mobi Like 1.0 Fire Flex 5p. 2022 Flex', true, now() - interval '21 days')
) as d (
  nome, tipo, marca, modelo, versao, ano, km, cambio, combustivel, cor, portas, carroceria,
  preco, aceita_troca, opcionais, descricao, fotos, ativo, status,
  fipe_tipo, fipe_marca, fipe_modelo, fipe_ano, fipe_nome, demonstracao, criado_em
);

-- Conferência: deve mostrar 20.
select count(*) as anuncios_de_demonstracao from public.veiculos where demonstracao = true;
