"use client"
// app/admin-panel/dashboard/page.tsx
import { Suspense, useEffect, useState } from 'react';
import StatsGrid, { StatsData } from '../components/StatsGrid';
import SalesChart from '../components/SalesChart';
import { SalesChartSkeleton } from '@/components/skeltons/SalesChartSkelton';
import { StatsGridSkeleton } from '@/components/skeltons/StatsGridSkelton';


const DashboardPage =  () => {
  const [statsData,setStatsData]=useState<StatsData|null>(null)
  const [salesData,setSalesData]=useState([])

  const getDashboardData=async()=>{
    const res = await fetch(`/api/admin/dashboard`, {
        method:"GET",
        headers:{
            'user-agent': 'Mozilla/.*',
            'accept': 'application/json',
            'content-type': 'application/json',
        },
        next: { tags: ['dashboard'] }
      });
      if(res.ok){
        const data=await res.json()
        setStatsData(data.statsData)
        setSalesData(data.salesData)
      }
  }
   useEffect(()=>{
    getDashboardData()
   },[])
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 ">لوحة التحكم الإدارية</h1>
      
      <Suspense fallback={<StatsGridSkeleton />}>
        <StatsGrid data={statsData} />
      </Suspense>

      <Suspense fallback={<SalesChartSkeleton />}>
        <SalesChart data={salesData} />
      </Suspense>
    </div>
  );
};

export default DashboardPage;



 