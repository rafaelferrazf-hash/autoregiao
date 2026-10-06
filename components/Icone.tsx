import {
  IconAdjustmentsHorizontal, IconAlertTriangle, IconArrowBackUp, IconBell, IconBrandWhatsapp, IconBuildingStore,
  IconCalendar, IconCamera, IconCar, IconChartBar, IconCheck, IconCircleCheck, IconCircleX, IconClock, IconConfetti,
  IconCopy, IconCrown, IconCurrencyReal, IconDeviceMobile, IconEye, IconFlag, IconGasStation, IconGift, IconLink,
  IconLogout, IconManualGearbox, IconMapPin, IconMotorbike, IconNavigation, IconPalette, IconPencil, IconPhone,
  IconPlus, IconRocket, IconSearch, IconShare, IconShieldCheck, IconStar, IconStarFilled, IconTicket, IconTrash,
  IconTrendingDown, IconTrophy, IconTruck, IconUser, IconUsers, IconX, IconQrcode, IconGauge, IconHourglass, IconInfoCircle, IconPlayerPause, IconPlayerPlay, IconDoor,
  type Icon,
} from "@tabler/icons-react";
import type { CSSProperties } from "react";

// Ícones do site (Tabler, traço fino). Substituem os emojis: mesmo desenho em qualquer aparelho.
// Tamanho padrão acompanha a fonte do texto ao redor; cor padrão = cor do texto.
const ICONES = {
  ajustes: IconAdjustmentsHorizontal, atencao: IconAlertTriangle, estorno: IconArrowBackUp, sino: IconBell,
  whatsapp: IconBrandWhatsapp, loja: IconBuildingStore, calendario: IconCalendar, camera: IconCamera, carro: IconCar,
  grafico: IconChartBar, check: IconCheck, ok: IconCircleCheck, erro: IconCircleX, relogio: IconClock, festa: IconConfetti,
  copiar: IconCopy, coroa: IconCrown, real: IconCurrencyReal, celular: IconDeviceMobile, olho: IconEye, bandeira: IconFlag,
  combustivel: IconGasStation, presente: IconGift, link: IconLink, sair: IconLogout, cambio: IconManualGearbox,
  local: IconMapPin, moto: IconMotorbike, navegar: IconNavigation, cor: IconPalette, editar: IconPencil, telefone: IconPhone,
  mais: IconPlus, foguete: IconRocket, buscar: IconSearch, compartilhar: IconShare, escudo: IconShieldCheck,
  estrela: IconStar, estrelaCheia: IconStarFilled, cupom: IconTicket, lixeira: IconTrash, abaixo: IconTrendingDown,
  trofeu: IconTrophy, utilitario: IconTruck, usuario: IconUser, usuarios: IconUsers, fechar: IconX, qrcode: IconQrcode,
  km: IconGauge, ampulheta: IconHourglass, info: IconInfoCircle,
  pausar: IconPlayerPause, reativar: IconPlayerPlay, porta: IconDoor,
} satisfies Record<string, Icon>;

export type NomeIcone = keyof typeof ICONES;

export default function Icone({ nome, tamanho = "1.15em", cor, style, traco = 1.8 }: {
  nome: NomeIcone; tamanho?: number | string; cor?: string; style?: CSSProperties; traco?: number;
}) {
  const C = ICONES[nome];
  return <C size={tamanho} stroke={traco} color={cor ?? "currentColor"} aria-hidden="true"
    style={{ display: "inline-block", verticalAlign: "-0.18em", flexShrink: 0, ...style }} />;
}
