
import { ResourceType, ResourceInfo } from './types';

export const RESOURCES: Record<ResourceType, ResourceInfo> = {
  [ResourceType.TABLETS]: {
    id: ResourceType.TABLETS,
    name: 'Tablets',
    icon: 'fa-tablet-screen-button',
    maxQuantity: 40,
    description: 'Carrinho com tablets para uso em sala.',
    color: 'blue'
  },
  [ResourceType.DATA_SHOW]: {
    id: ResourceType.DATA_SHOW,
    name: 'Data Show',
    icon: 'fa-video',
    maxQuantity: 1,
    description: 'Projetor multimídia portátil.',
    color: 'purple'
  },
  [ResourceType.LOUSA_SALA_17]: {
    id: ResourceType.LOUSA_SALA_17,
    name: 'Lousa Digital - Sala 17',
    icon: 'fa-chalkboard-user',
    maxQuantity: 1,
    description: 'Sala multimídia com lousa interativa.',
    color: 'emerald'
  }
};

export const TIME_SLOTS = [
  '07:30', '08:20', '09:10', '10:00', '10:20', '11:10', '12:00',
  '13:00', '13:50', '14:40', '15:30', '15:50', '16:40', '17:30'
];
