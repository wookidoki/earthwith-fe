import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Heart, MessageSquare, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const memberNo = localStorage.getItem('memberNo');
    const token = localStorage.getItem('token');

    // memberNo가 없으면 경고
    if (!memberNo) {
      console.error('memberNo가 없습니다. 로그인이 필요합니다.');
      // 로그인 페이지로 리다이렉트 (선택사항)
      // navigate('/login');
      return;
    }
    
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const memberNo = localStorage.getItem('memberNo');
      
      // memberNo 체크
      if (!memberNo) {
        console.error('memberNo가 없습니다.');
        setLoading(false);
        return;
      }
      
      console.log('API 요청:', `http://34.218.225.105:8080/api/members/posts?memberNo=${memberNo}&page=${currentPage}`);
      
      const response = await fetch(
        `http://34.218.225.105:8080/api/members/posts?memberNo=${memberNo}&page=${currentPage}`
      );
      
      console.log('API 응답 상태:', response.status);
      
      const data = await response.json();
      console.log('받은 데이터:', data);
      
      // null 필터링
      const filteredList = (data.list || []).filter(item => item !== null);
      setPosts(filteredList);
      setPageInfo(data.pageInfo);
    } catch (error) {
      console.error('게시글 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (boardNo) => {
    navigate(`/board-detail/${boardNo}`);
  };

  const formatDate = (dateString) => {
    return dateString || '날짜 없음';
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-gray-500 mt-4">로딩 중...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">작성한 게시글이 없습니다.</p>
          <p className="text-gray-400 text-sm mt-2">첫 번째 게시글을 작성해보세요!</p>
        </div>
      ) : (
        <>
          {/* 게시글 리스트 */}
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.boardNo}
                onClick={() => handlePostClick(post.boardNo)}
                className="p-5 rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer bg-white">
                
                {/* 제목 */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-emerald-600 transition-colors">
                  {post.boardTitle}
                </h3>
                
                {/* 내용 미리보기 */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {post.boardContent}
                </p>
                
                {/* 메타 정보 */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.regDate)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.viewCount || 0}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-red-500">
                      <Heart className="w-4 h-4" />
                      <span>{post.likeCount || 0}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-blue-500">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.commentCount || 0}</span>
                    </span>
                  </div>
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
                        ? 'bg-emerald-500 text-white shadow-md'
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

export default PostList;