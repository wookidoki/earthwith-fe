import React, { useState, useEffect } from 'react';
import { FileText, MessageSquare, Heart, Bookmark } from 'lucide-react';
import PostList from './PostList';
import CommentList from './CommentList';
import LikeList from './LikeList';
import BookmarkList from './BookmarkList';

const ActivitySection = ({ stats, setStats }) => {
  const [activeMenu, setActiveMenu] = useState('posts');

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const memberNo = localStorage.getItem('memberNo');
      
      const [postsRes, commentsRes, likesRes, bookmarksRes] = await Promise.all([
        fetch(`http://34.218.225.105:8080/api/members/posts?memberNo=${memberNo}&page=1`),
        fetch(`http://34.218.225.105:8080/api/members/comments?memberNo=${memberNo}&page=1`),
        fetch(`http://34.218.225.105:8080/api/members/likes?memberNo=${memberNo}&page=1`),
        fetch(`http://34.218.225.105:8080/api/members/bookmarks?memberNo=${memberNo}&page=1`)
      ]);

      const [postsData, commentsData, likesData, bookmarksData] = await Promise.all([
        postsRes.json(),
        commentsRes.json(),
        likesRes.json(),
        bookmarksRes.json()
      ]);

      const newStats = {
        posts: postsData.pageInfo?.listCount || 0,
        comments: commentsData.pageInfo?.listCount || 0,
        likes: likesData.pageInfo?.listCount || 0,
        bookmarks: bookmarksData.pageInfo?.listCount || 0
      };

      if (setStats) {
        setStats(newStats);
      }
    } catch (error) {
      console.error('개수 로드 실패:', error);
    }
  };

  const menuItems = [
    { id: 'posts', icon: FileText, label: '내가 쓴 글', count: stats.posts, color: 'emerald' },
    { id: 'comments', icon: MessageSquare, label: '댓글', count: stats.comments, color: 'blue' },
    { id: 'likes', icon: Heart, label: '좋아요', count: stats.likes, color: 'red' },
    { id: 'bookmarks', icon: Bookmark, label: '즐겨찾기', count: stats.bookmarks, color: 'amber' }
  ];

  const getColorClasses = (color, isActive) => {
    const colors = {
      emerald: {
        bg: isActive ? 'bg-emerald-50' : 'bg-white',
        border: isActive ? 'border-emerald-500' : 'border-gray-200',
        text: isActive ? 'text-emerald-700' : 'text-gray-600',
        icon: isActive ? 'text-emerald-600' : 'text-gray-400'
      },
      blue: {
        bg: isActive ? 'bg-blue-50' : 'bg-white',
        border: isActive ? 'border-blue-500' : 'border-gray-200',
        text: isActive ? 'text-blue-700' : 'text-gray-600',
        icon: isActive ? 'text-blue-600' : 'text-gray-400'
      },
      red: {
        bg: isActive ? 'bg-red-50' : 'bg-white',
        border: isActive ? 'border-red-500' : 'border-gray-200',
        text: isActive ? 'text-red-700' : 'text-gray-600',
        icon: isActive ? 'text-red-600' : 'text-gray-400'
      },
      amber: {
        bg: isActive ? 'bg-amber-50' : 'bg-white',
        border: isActive ? 'border-amber-500' : 'border-gray-200',
        text: isActive ? 'text-amber-700' : 'text-gray-600',
        icon: isActive ? 'text-amber-600' : 'text-gray-400'
      }
    };
    return colors[color];
  };

  return (
    <div className="space-y-6">
      {/* 서브 메뉴 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          const colorClasses = getColorClasses(item.color, isActive);
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center space-y-2 ${
                colorClasses.bg
              } ${colorClasses.border} ${
                isActive ? 'shadow-md' : 'hover:border-gray-300 hover:shadow-sm'
              }`}>
              <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
              <div className="text-center">
                <p className={`text-sm font-medium ${colorClasses.text}`}>
                  {item.label}
                </p>
                <p className={`text-lg font-bold ${isActive ? colorClasses.text : 'text-gray-900'}`}>
                  {item.count}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 리스트 영역 */}
      <div className="border-t border-gray-100 pt-6">
        {activeMenu === 'posts' && <PostList />}
        {activeMenu === 'comments' && <CommentList />}
        {activeMenu === 'likes' && <LikeList />}
        {activeMenu === 'bookmarks' && <BookmarkList />}
      </div>
    </div>
  );
};

export default ActivitySection;