import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://34.218.225.105:8080/api';

export const useRanking = (isLoggedIn) => {
  const [personalRankList, setPersonalRankList] = useState([]);
  const [myRankInfo, setMyRankInfo] = useState({ rank: 0, totalUsers: 0 });
  const [localRankList, setLocalRankList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }

    const fetchPersonalRankList = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/stats/ranking`);
        if (!response.ok) {
          throw new Error('랭킹 데이터를 불러오는데 실패했습니다.');
        }
        const result = await response.json();
        setPersonalRankList(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonalRankList();
  }, [isLoggedIn]);

  return { personalRankList, myRankInfo, localRankList, isLoading, error };
};