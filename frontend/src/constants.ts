import type { User } from './api';

export const CATEGORIES = [
  'Preparo e correção de solo',
  'Terra Pronta',
  'Distribuição de sementes',
  'Plantio e apoio à produção agrícola',
  'Máquinas e implementos',
  'Barreiros e pequenos mananciais',
  'Abastecimento e recursos hídricos',
  'Manutenção de estradas rurais',
  'Assistência técnica',
  'Apoio à pecuária',
  'Produção de leite',
  'Apoio à comercialização',
  'PAA e PNAE',
  'CAF',
  'CCIR',
  'ITR',
  'Serviços relacionados à UMC',
  'Programas de incentivo à agricultura familiar',
  'Outras necessidades',
];

export const STATUS_OPTIONS = ['Pendente', 'Em análise', 'Programada', 'Em execução', 'Concluída', 'Indeferida'];
export const PRIORITY_OPTIONS = ['Baixa', 'Média', 'Alta', 'Urgente'];
export const CHART_COLORS = ['#d99a37', '#528b68', '#5c91b8', '#a28ac4', '#3d7955', '#b96d64'];

export const ROLE_LABELS: Record<User['role'], string> = {
  admin: 'Administrador',
  staff: 'Equipe da Secretaria',
  farmer: 'Agricultor',
};

export const osmUrl = (lat: number, lon: number) =>
  `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;
