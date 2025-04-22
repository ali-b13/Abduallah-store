// /app/banners/components/BannersList.tsx
import Image from 'next/image';
import { Edit, Trash } from 'lucide-react';
import Button from './Button';

interface Banner {
  id: string;
  title: string;
  image: string;
  link: string;
}
interface Props {
  banners: Banner[];
  onEdit(id: string): void;
  onDelete(id: string,name:string): void;
}

export default function BannersList({ banners, onEdit, onDelete }: Props) {
  if (banners.length === 0) return <p>لايوجد بانر لديك للان</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {banners.map(b => (
        <div key={b.id} className="border rounded-lg overflow-hidden">
          <div className="relative aspect-video bg-gray-100">
            {b.image && (
              <Image src={b.image} alt={b?.title||"بانر"} fill className="object-cover" />
            )}
          </div>
          <div className="p-4 space-y-2">
            {b.title&&<h3 className="font-semibold text-lg">{b.title}</h3>}
            <div className="flex items-center justify-between pt-4">
             {b.link&& <Button variant="outline">
                <a href={b.link}>link :{b.link} </a>
              </Button>}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onEdit(b.id)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" onClick={() => onDelete(b.id,b?.title||"البانر")}>
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
