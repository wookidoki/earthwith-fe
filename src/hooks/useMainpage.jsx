import { useState, useEffect, useMemo } from 'react';

const API_BASE_URL = 'http://44.246.37.8:8080';

export const useMainPage = () => {
    const [mainStats, setMainStats] = useState([
        { number: "0", label: "총 환경지킴이" },
        { number: "0", label: "총 에코 활동" },
        { number: "0", label: "나무 심은 효과" },
        { number: "0", label: "총 게시글 수" }
    ]);
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState(null);

    const [newsData, setNewsData] = useState([]);
    const [newsLoading, setNewsLoading] = useState(true);
    const [newsError, setNewsError] = useState(null);

    
    useEffect(() => {
        const fetchMainPageData = async () => {
            setStatsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/stats/landing`); 
                if (!response.ok) throw new Error('서버 통신 실패: 통계');
                const data = await response.json();
                
                setMainStats([
                    { number: data.memberCount?.toLocaleString() || "0", label: "총 환경지킴이" },
                    { number: data.ecoActions?.toLocaleString() || "0", label: "총 에코 활동" },
                    { number: data.treeEffect?.toLocaleString() || "0", label: "나무 심은 효과" },
                    { number: data.totalPosts?.toLocaleString() || "0", label: "총 게시글 수" }
                ]);
                setStatsError(null);
            } catch (err) {
                console.error("통계 로딩 실패:", err);
                setStatsError('통계 데이터를 불러오는 데 실패했습니다.');
            } finally {
                setStatsLoading(false);
            }

            setNewsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/news?query=환경`);
                if (!response.ok) throw new Error('서버 통신 실패: 뉴스');
                const data = await response.json();
                setNewsData(data);
                setNewsError(null);
            } catch (err) {
                console.error("뉴스 로딩 실패:", err);
                setNewsError('뉴스를 불러올 수 없습니다.');
            } finally {
                setNewsLoading(false);
            }
        };

        fetchMainPageData();
    }, []);

    const { listNews } = useMemo(() => {
        if (!newsData || newsData.length === 0) return { listNews: [] };
        const sortedNews = [...newsData].sort((a, b) => b.views - a.views);
        return {
            listNews: sortedNews.slice(3, 8)
        };
    }, [newsData]);

    
    return {
        mainStats,
        statsLoading,
        statsError,
        listNews,
        newsLoading,
        newsError,
    };
};