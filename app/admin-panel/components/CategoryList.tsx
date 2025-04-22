// /app/categories/components/CategoriesList.tsx
import { Edit, Trash } from 'lucide-react';
import Button from './Button';
import { Category } from '@prisma/client';


interface Props {
  categories: Category[];
  onEdit(id: string): void;
  onDelete(id: string,name:string): void;
}

export default function CategoriesList({ categories, onEdit, onDelete }: Props) {
  if (categories.length === 0) return <p>لاتوجد فئات لديك .</p>;

  return (
    <ul className="space-y-2">
      {categories.map(cat => (
        <li key={cat.id} className="flex justify-between p-4 border rounded-lg">
          <span>{cat.name}</span>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onEdit(cat.id)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="destructive" onClick={() => onDelete(cat.id,cat.name)}>
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
