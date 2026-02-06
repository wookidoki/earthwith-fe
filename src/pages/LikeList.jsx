import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, MessageSquare, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const LikeList = () => {
  const [likes, setLikes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLikes();
  }, [currentPage]);

  const fetchLikes = async () => {
    setLoading(true);
    try {
      const memberNo = localStorage.getItem('memberNo');
      const response = await fetch(
        `http://34.218.225.105:8080/api/members/likes?memberNo=${memberNo}&page=${currentPage}`
      );
      const data = await response.json();
      
      setLikes(data.list || []);
      setPageInfo(data.pageInfo);
    } catch (error) {
      console.error('좋아요 목록 로드 실패:', error);
      // 임시 데이터 (테스트용)
      setLikes([
        {
          boardNo: 1,
          title: '친환경 생활 실천 방법',
          content: '일상에서 쉽게 실천할 수 있는 친환경 생활 팁들을 공유합니다.',
          regDate: '2024.12.01',
          viewCount: 250,
          likeCount: 45,
          commentCount: 12
        },
        {
          boardNo: 2,
          title: '제로웨이스트 챌린지',
          content: '한 달간 일회용품 사용을 줄이는 챌린지에 참여했습니다.',
          regDate: '2024.11.30',
          viewCount: 180,
          likeCount: 32,
          commentCount: 8
        },
        {
          boardNo: 3,
          title: '텀블러 사용의 중요성',
          content: '일회용 컵 대신 텀블러를 사용하면 환경에 얼마나 도움이 될까요?',
          regDate: '2024.11.29',
          viewCount: 320,
          likeCount: 58,
          commentCount: 15
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeClick = (boardNo) => {
    navigate(`/board-detail/${boardNo}`);
  };

  const formatDate = (dateString) => {
    return dateString || '날짜 없음';
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
          <p className="text-gray-500 mt-4">로딩 중...</p>
        </div>
      ) : likes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">좋아요한 게시글이 없습니다.</p>
          <p className="text-gray-400 text-sm mt-2">마음에 드는 게시글에 좋아요를 눌러보세요!</p>
        </div>
      ) : (
        <>
          {/* 좋아요 리스트 */}
          <div className="space-y-3">
            {likes.map((like) => (
              <div
                key={like.boardNo}
                onClick={() => handleLikeClick(like.boardNo)}
                className="p-5 rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-md transition-all cursor-pointer bg-white group">
                
                {/* 좋아요 배지 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 px-3 py-1 bg-red-50 rounded-full">
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      <span className="text-xs font-semibold text-red-600">좋아요</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(like.regDate)}</span>
                  </div>
                </div>
                
                {/* 제목 */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                  {like.title}
                </h3>
                
                {/* 내용 미리보기 */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {like.content}
                </p>
                
                {/* 메타 정보 */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{like.viewCount || 0}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-red-500">
                      <Heart className="w-4 h-4 fill-red-500" />
                      <span>{like.likeCount || 0}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-blue-500">
                      <MessageSquare className="w-4 h-4" />
                      <span>{like.commentCount || 0}</span>
                    </span>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikeClick(like.boardNo);
                    }}
                    className="text-red-500 hover:text-red-700 font-medium text-xs flex items-center space-x-1 px-3 py-1 rounded-full hover:bg-red-50 transition-all">
                    <span>게시글 보기</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 페이징 */}
          {pageInfo && pageInfo.maxPage > 0 && (
            <div className="flex justify-center items-center space-x-2 pt-6">
              {/* 처음 버튼 */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* 이전 버튼 */}
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                이전
              </button>

              {/* 페이지 번호 */}
              {[...Array(pageInfo.endPage - pageInfo.startPage + 1)].map((_, i) => {
                const pageNum = pageInfo.startPage + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === pageNum
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {pageNum}
                  </button>
                );
              })}

              {/* 다음 버튼 */}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pageInfo.maxPage}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                다음
              </button>

              {/* 끝 버튼 */}
              <button
                onClick={() => setCurrentPage(pageInfo.maxPage)}
                disabled={currentPage === pageInfo.maxPage}
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 페이지 정보 표시 */}
          {pageInfo && (
            <div className="text-center text-sm text-gray-500 pt-2">
              전체 {pageInfo.listCount}개 중 {((currentPage - 1) * pageInfo.boardLimit) + 1} - {Math.min(currentPage * pageInfo.boardLimit, pageInfo.listCount)}개
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LikeList;