import  Card from '@/app/admin-panel/components/card/Card';
import  CardContent from '@/app/admin-panel/components/card/CardContent';
import  CardHeader from '@/app/admin-panel/components/card/CardHeader';
import CardTitle  from '@/app/admin-panel/components/card/CardTitle';
export const OrdersSkeleton = () => (
  <div className="p-6 space-y-8">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl p-4">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="h-96">
            <CardHeader>
              <CardTitle>
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);