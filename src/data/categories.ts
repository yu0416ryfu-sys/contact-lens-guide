import type { CategoryInfo } from '../types/index';

export const categories: CategoryInfo[] = [
  {
    id: 'oneday',
    name: 'ワンデー',
    description: '毎日新しいレンズで清潔に。ケア用品不要で忙しい方に最適なタイプです。',
    icon: '☀️',
    textColor: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  {
    id: 'twoweek',
    name: '2週間使い捨て',
    description: 'コストと利便性のバランスが取れた定番タイプ。経済的に使えます。',
    icon: '📅',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'color',
    name: 'カラーコンタクト',
    description: '瞳の印象を変えるカラーレンズ。自然な発色から印象的なカラーまで。',
    icon: '✨',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'toric',
    name: '乱視用',
    description: '乱視矯正に特化した安定設計。ズレにくく快適な視界をキープします。',
    icon: '🎯',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'multifocal',
    name: '遠近両用',
    description: '老眼や近視の方向けの多焦点レンズ。遠くも近くも快適に見えます。',
    icon: '👁️',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
];

export function getCategoryInfo(id: string): CategoryInfo | undefined {
  return categories.find(c => c.id === id);
}
