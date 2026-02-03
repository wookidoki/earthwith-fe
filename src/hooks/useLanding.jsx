import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://44.246.37.8:8080';

export const useLanding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  const [stats, setStats] = useState([
    { number: "0", label: "함께하는 환경 지킴이" },   // 1. 회원 수
    { number: "0", label: "누적된 챌린지 기록" },     // 2. 게시글 수
    { number: "0", label: "실천된 에코 액션" },       // 3. 액션 합계
    { number: "0", label: "우리가 심은 나무 효과" }   // 4. 나무 환산
  ]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    const sliderTimer = setInterval(() => setCurrentSlide(prev => (prev + 1) % 3), 4000);

    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/stats/landing`);
        if (!response.ok) throw new Error('서버 통신 실패');
        
        const data = await response.json();

        setStats([
          { number: data.memberCount?.toLocaleString() || "0", label: "함께하는 환경 지킴이" },
          { number: data.totalPosts?.toLocaleString() || "0", label: "누적된 챌린지 기록" },
          { number: data.ecoActions?.toLocaleString() || "0", label: "실천된 에코 액션" },
          { number: (data.treeEffect?.toLocaleString() || "0") + "그루", label: "우리가 심은 나무 효과" }
        ]);

      } catch (e) {
        console.error("통계 로드 실패:", e);
      }
    };
    
    fetchStats();

    // 클린업
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(sliderTimer);
    };
  }, []);

  return { scrollY, currentSlide, setCurrentSlide, isVisible, stats };
};

export default useLanding;