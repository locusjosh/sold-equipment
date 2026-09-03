import { SOLD_IDS } from '@/lib/demo/seedData';
import { SoldDetailClient } from './SoldDetailClient';

export function generateStaticParams() {
  return SOLD_IDS.map((id) => ({ id }));
}

export default function SoldDetailPage() {
  return <SoldDetailClient />;
}
