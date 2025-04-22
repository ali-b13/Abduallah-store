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
      className="bg-white  rounded-xl shadow-sm"
    >
      <div className="h-64 xs:h-80 sm:h-96">
        <Bar 
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  font: {
                    family: 'Tajawal',
                    size: window.innerWidth < 640 ? 10 : 12
                  }
                }
              }
            },
            scales: {
              x: {
                ticks: {
                  font: {
                    family: 'Tajawal',
                    size:12
                  }
                }
              },
              y: {
                beginAtZero: true,
                ticks: {
                  font: {
                    family: 'Tajawal',
                    size:12
                  },
                  callback: (value) => {
                    if (typeof value === 'number') {
                      return window.innerWidth < 640 ? 
                        `$${value / 1000}k` : 
                        value.toLocaleString('ar-SA');
                    }
                    return value;
                  }
                }
              }
            },
            
          }}
        />
      </div>
    </motion.div>
  );
}

export default SalesChart;