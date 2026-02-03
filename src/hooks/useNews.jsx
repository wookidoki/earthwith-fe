import { useState, useEffect, useMemo } from 'react';

const API_BASE_URL = 'http://44.246.37.8:8080';

export const useNews = () => {
  const [newsData, setNewsData] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 

  const fetchNews = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const queryParam = query || '환경';
      const response = await fetch(`${API_BASE_URL}/api/news?query=${queryParam}`);
      
      if (!response.ok) {
        throw new Error('서버 통신 실패');
      }
      
      const data = await response.json();
      setNewsData(data);
    } catch (err) {
      console.error("뉴스 로딩 실패:", err);
      setError('뉴스를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews('환경');
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchNews(searchTerm);
    }
  };

  const { featuredNews, listNews } = useMemo(() => {
    if (!newsData || newsData.length === 0) return { featuredNews: [], listNews: [] };

    const sortedNews = [...newsData].sort((a, b) => b.views - a.views);
    return { 
      featuredNews: sortedNews.slice(0, 3), 
      listNews: sortedNews.slice(3) 
    };
  }, [newsData]);

  return {
    newsData, searchTerm, setSearchTerm, loading, error,
    featuredNews, listNews,
    handleSearch 
  };
};