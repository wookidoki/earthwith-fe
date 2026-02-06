import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const PointHistory = ({ currentUser }) => {
  const [filter, setFilter] = useState('all'); // all, earned, spent
  const [pointHistory, setPointHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);
  const [summary, setSummary] = useState({
    current: 0,
    earned: 0,
    spent: 0
  });

  useEffect(() => {
    fetchPointHistory();
    fetchPointSummary();
  }, [currentPage, filter]);

  const fetchPointSummary = async () => {
    // 포인트 요약 정보 가져오기
    setSummary({
      current: currentUser?.memberPoint || 1250,
      earned: 350,
      spent: 100
    });
  };

  const fetchPointHistory = async () => {
    try {
      const memberNo = localStorage.getItem('memberNo');
      const response = await fetch(
        `http://34.218.225.105:8080/api/members/points?memberNo=${memberNo}&page=${currentPage}&filter=${filter}`
      );
      const data = await response.json();
      
      setPointHistory(data.list || []);
      setPageInfo(data.pageInfo);
    } catch (error) {
      console.error('포인트 내역 로드 실패:', error);
      // 임시 데이터
      setPointHistory([
        { id: 1, description: '게시글 작성', type: 'earned', amount: 50, date: '2024.12.01' },
        { id: 2, description: '댓글 작성', type: 'earned', amount: 10, date: '2024.11.30' },
        { id: 3, description: '프로필 꾸미기', type: 'spent', amount: 100, date: '2024.11.29' },
        { id: 4, description: '출석 체크', type: 'earned', amount: 5, date: '2024.11.28' }
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* 포인트 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
          <p className="text-sm text-emerald-700 font-medium mb-1">현재 포인트</p>
          <p className="text-3xl font-bold text-emerald-600">{summary.current.toLocaleString()}P</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium mb-1 flex items-center space-x-1">
            <TrendingUp className="w-4 h-4" />
            <span>이번 달 획득</span>
          </p>
          <p className="text-3xl font-bold text-blue-600">+{summary.earned.toLocaleString()}P</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
          <p className="text-sm text-orange-700 font-medium mb-1 flex items-center space-x-1">
            <TrendingDown className="w-4 h-4" />
            <span>이번 달 사용</span>
          </p>
          <p className="text-3xl font-bold text-orange-600">-{summary.spent.toLocaleString()}P</p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex items-center space-x-2">
        <Filter className="w-5 h-5 text-gray-400" />
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>
          전체
        </button>
        <button
          onClick={() => setFilter('earned')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'earned'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>
          획득
        </button>
        <button
          onClick={() => setFilter('spent')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'spent'
              ? 'bg-orange-100 text-orange-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>
          사용
        </button>
      </div>

      {/* 포인트 내역 리스트 */}
      <div className="space-y-3">
        {pointHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">포인트 내역이 없습니다.</p>
          </div>
        ) : (
          pointHistory.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow bg-white">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{item.description}</h4>
                <p className="text-sm text-gray-500 mt-1">{item.date}</p>
              </div>
              <div
                className={`text-xl font-bold ${
                  item.type === 'earned' ? 'text-blue-600' : 'text-orange-600'
                }`}>
                {item.type === 'earned' ? '+' : '-'}{item.amount.toLocaleString()}P
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이징 */}
      {pageInfo && pageInfo.maxPage > 0 && (
        <div className="flex justify-center items-center space-x-2 pt-4">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            이전
          </button>

          {[...Array(pageInfo.endPage - pageInfo.startPage + 1)].map((_, i) => {
            const pageNum = pageInfo.startPage + i;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === pageNum
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === pageInfo.maxPage}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            다음
          </button>
          <button
            onClick={() => setCurrentPage(pageInfo.maxPage)}
            disabled={currentPage === pageInfo.maxPage}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PointHistory;