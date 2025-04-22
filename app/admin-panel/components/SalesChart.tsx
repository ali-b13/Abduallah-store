// components/admin/SalesChart.tsx
'use client';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { motion } from 'framer-motion';
import { SalesChartSkeleton } from '@/components/skeltons/SalesChartSkelton';

ChartJS.register(...registerables);

interface CurrencyData {
  sales: number;
  profit: number;
}

interface SalesDataItem {
  month: string;
  currencies: {
    SAR: CurrencyData;
    YER: CurrencyData;
  };
}

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string;
  borderWidth: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

function SalesChart({ data }: { data: SalesDataItem[] }) {
  if (!data.length) {
    return <SalesChartSkeleton />;
  }

  // Prepare dataset structure
  const chartData: ChartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'المبيعات (الريال السعودي)',
        data: data.map(d => d.currencies.SAR.sales),
        backgroundColor: '#3B82F6',
        borderWidth: 1,
      },
      {
        label: 'الأرباح (الريال السعودي)',
        data: data.map(d => d.currencies.SAR.profit),
        backgroundColor: '#10B981',
        borderWidth: 1,
      },
      {
        label: 'المبيعات (الريال اليمني)',
        data: data.map(d => d.currencies.YER.sales),
        backgroundColor: '#F59E0B',
        borderWidth: 1,
      },
      {
        label: 'الأرباح (الريال اليمني)',
        data: data.map(d => d.currencies.YER.profit),
        backgroundColor: '#EF4444',
        borderWidth: 1,
      }
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white p-6 rounded-xl shadow-sm"
    >
      <h3 className="text-lg font-semibold mb-4 text-right">أداء المبيعات السنوي</h3>
      <div className="h-96">
        <Bar 
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                rtl: true,
                position: 'top',
                labels: {
                  font: {
                    family: 'Tajawal'
                  }
                }
              }
            },
            scales: {
              x: {
                ticks: {
                  font: {
                    family: 'Tajawal'
                  }
                }
              },
              y: {
                beginAtZero: true,
                ticks: {
                  font: {
                    family: 'Tajawal'
                  }
                }
              }
            },
            layout: {
              padding: {
                right: 20
              }
            }
          }}
        />
      </div>
    </motion.div>
  );
}

export default SalesChart;