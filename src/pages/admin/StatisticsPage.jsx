import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Zap, Clock } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, trend, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition">
    <div className={`flex items-center justify-between mb-4 ${color} p-2 rounded-lg`}>
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      <Icon className={`w-6 h-6 ${color.split(' ')[1]}`} />
    </div>
    <p className="text-3xl font-extrabold text-gray-900 mb-1">{value}</p>
    <p className="text-sm font-semibold">{trend}</p>
  </div>
);

const StatisticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://34.218.225.105:8080/api/stats/dashboard');
        
        if (response.ok) {
          const data = await response.json();
          setStats([
            { 
              icon: Users, 
              title: '신규 회원', 
              value: `${data.newUsers}명`, 
              trend: `+${data.newUsers} (오늘)`, 
              color: 'bg-blue-100 text-blue-600' 
            },
            { 
              icon: Zap, 
              title: '오늘 트래픽', 
              value: `${data.todayTraffic}건`, 
              trend: `+${data.todayTraffic} (오늘)`, 
              color: 'bg-emerald-100 text-emerald-600' 
            },
            { 
              icon: TrendingUp, 
              title: '발급 포인트', 
              value: `${data.todayPointIssued}P`, 
              trend: `+${data.todayPointIssued}P (오늘)`, 
              color: 'bg-purple-100 text-purple-600' 
            },
            { 
              icon: Clock, 
              title: '총 포인트', 
              value: `${(data.totalPointSum / 1000000).toFixed(1)}M P`, 
              trend: `${data.totalPointSum.toLocaleString()}P`, 
              color: 'bg-orange-100 text-orange-600' 
            },
          ]);
        }
      } catch (e) {
        console.error('통계 조회 중 에러:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="w-full max-w-7xl mx-auto py-10">
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-gray-800 border-l-4 border-blue-500 pl-4 flex items-center">
            <TrendingUp className="w-7 h-7 mr-2 text-blue-500" /> 서비스 통계 대시보드
          </h1>
        </header>
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats && stats.map((stat, index) => <StatCard key={index} {...stat} />)}
        </section>
        <section className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-lg h-64 flex items-center justify-center text-gray-400">차트 영역</div>
        </section>
      </div>
    </div>
  );
};

export default StatisticsPage;