import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileHeader from './ProfileHeader';
import TabMenu from './TabMenu';
import ActivitySection from './ActivitySection';
import AccountSettings from './AccountSettings';
import { useAuth } from '../context/AuthContext';

const MyProfilePage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('activity');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    posts: 0,
    comments: 0,
    likes: 0,
    bookmarks: 0
  });

  useEffect(() => {
    // ⭐ 로그인 체크 추가
    const memberNo = localStorage.getItem('memberNo');
    const token = localStorage.getItem('token');
    
    if (!auth.isAuthenticated && !memberNo && !token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    console.log('===== MyProfilePage 디버깅 =====');
    console.log('auth 객체:', auth);
    console.log('auth.isAuthenticated:', auth.isAuthenticated);
    console.log('auth.memberNo:', auth.memberNo);
    console.log('localStorage.memberNo:', memberNo);
    
    // 방법 1: auth에서 직접 가져오기
    if (auth.isAuthenticated && auth.memberNo) {
      const userData = {
        memberNo: auth.memberNo,
        memberName: auth.memberName,
        email: auth.email,
        phone: auth.phone,
        memberPoint: auth.memberPoint,
        memberImage: auth.memberImage,
        enrollDate: auth.enrollDate
      };
      
      console.log('✅ auth에서 사용자 데이터 설정:', userData);
      setUser(userData);
    } 
    // 방법 2: localStorage에서 가져오기 (백업)
    else if (memberNo) {
      const userData = {
        memberNo: memberNo,
        memberName: localStorage.getItem('memberName') || '사용자',
        email: localStorage.getItem('email') || 'email@example.com',
        phone: localStorage.getItem('phone') || '010-0000-0000',
        memberPoint: parseInt(localStorage.getItem('memberPoint')) || 0,
        memberImage: localStorage.getItem('memberImage'),
        enrollDate: localStorage.getItem('enrollDate') || '2024.01.15'
      };
      
      console.log('✅ localStorage에서 사용자 데이터 설정:', userData);
      setUser(userData);
    } else {
      // ⭐ memberNo가 없으면 로그인 페이지로 리다이렉트
      console.error('❌ memberNo를 찾을 수 없습니다. 로그인 페이지로 이동합니다.');
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    
    fetchUserStats();
  }, [auth, navigate]);

  const fetchUserStats = async () => {
    try {
      const memberNo = auth.memberNo || localStorage.getItem('memberNo');
      
      if (!memberNo) {
        console.error('통계 로드 실패: memberNo가 없습니다.');
        return;
      }

      console.log('📊 통계 로드 중... memberNo:', memberNo);
      
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

      console.log('✅ 통계 로드 완료:', newStats);
      setStats(newStats);
    } catch (error) {
      console.error('❌ 통계 로드 실패:', error);
    }
  };

  useEffect(() => {
    console.log('👤 user 상태 업데이트:', user);
  }, [user]);

  // ⭐ 로딩 중일 때 표시
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-gray-500 mt-4">로딩 중...</p>
        </div>
      </div>
    );
  }

return (
  <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-28">
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ⭐ setUser props 전달 */}
      <ProfileHeader user={user} stats={stats} setUser={setUser} />
      
      <TabMenu activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {activeTab === 'activity' && <ActivitySection stats={stats} setStats={setStats} />}
        {activeTab === 'settings' && <AccountSettings currentUser={user} />}
      </div>
    </div>
  </div>
);
};

export default MyProfilePage;