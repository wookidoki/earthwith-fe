import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Eye, Heart, MessageSquare, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const BookmarkList = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookmarks();
  }, [currentPage]);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const memberNo = localStorage.getItem('memberNo');
      const response = await fetch(
        `http://44.246.37.8:8080/members/bookmarks?memberNo=${memberNo}&page=${currentPage}`
      );
      const data = await response.json();
      
      setBookmarks(data.list || []);
      setPageInfo(data.pageInfo);
    } catch (error) {
      console.error('즐겨찾기 목록 로드 실패:', error);
      // 임시 데이터 (테스트용)
      setBookmarks([
        {
          boardNo: 1,
          title: '비건 레시피 모음',
          content: '간단하게 만들 수 있는 비건 요리 레시피를 소개합니다.',
          regDate: '2024.12.01',
          viewCount: 420,
          likeCount: 78,
          commentCount: 23
        },
        {
          boardNo: 2,
          title: '친환경 쇼핑 가이드',
          content: '친환경 제품을 구매할 수 있는 쇼핑몰과 팁을 정리했습니다.',
          regDate: '2024.11.30',
          viewCount: 350,
          likeCount: 62,
          commentCount: 18
        },
        {
          boardNo: 3,
          title: '플라스틱 프리 생활',
          content: '플라스틱 없이 생활하는 방법과 대체재를 소개합니다.',
          regDate: '2024.11.29',
          viewCount: 280,
          likeCount: 51,
          commentCount: 14
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkClick = (boardNo) => {
    navigate(`/board-detail/${boardNo}`);
  };

  const formatDate = (dateString) => {
    return dateString || '날짜 없음';
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
          <p className="text-gray-500 mt-4">로딩 중...</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center">
            <Bookmark className="w-8 h-8 text-amber-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">즐겨찾기한 게시글이 없습니다.</p>
          <p className="text-gray-400 text-sm mt-2">나중에 다시 보고 싶은 게시글을 즐겨찾기하세요!</p>
        </div>
      ) : (
        <>
          {/* 즐겨찾기 리스트 */}
          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.boardNo}
                onClick={() => handleBookmarkClick(bookmark.boardNo)}
                className="p-5 rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer bg-white group">
                
                {/* 즐겨찾기 배지 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 px-3 py-1 bg-amber-50 rounded-full">
                      <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-semibold text-amber-600">즐겨찾기</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(bookmark.regDate)}</span>
                  </div>
                </div>
                
                {/* 제목 */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                  {bookmark.title}
                </h3>
                
                {/* 내용 미리보기 */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {bookmark.content}
                </p>
                
                {/* 메타 정보 */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{bookmark.viewCount || 0}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-red-500">
                      <Heart className="w-4 h-4" />
                      <span>{bookmark.likeCount || 0}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-blue-500">
                      <MessageSquare className="w-4 h-4" />
                      <span>{bookmark.commentCount || 0}</span>
                    </span>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmarkClick(bookmark.boardNo);
                    }}
                    className="text-amber-600 hover:text-amber-700 font-medium text-xs flex items-center space-x-1 px-3 py-1 rounded-full hover:bg-amber-50 transition-all">
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
                        ? 'bg-amber-500 text-white shadow-md'
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

export default BookmarkList;