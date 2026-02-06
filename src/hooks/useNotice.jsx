import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://34.218.225.105:8080/api/admin/notices';

export const useNotice = () => {
  // 초기값 빈 배열로 안전하게 설정
  const [notices, setNotices] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 1. 공지사항 목록 조회
  const fetchNotices = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(API_BASE_URL, {
        params: { page: page - 1 },
        headers: { "Authorization": `Bearer ${token}` }
      });

      // ResponseData 래퍼에서 data 추출 후 안전하게 파싱
      const wrapper = response.data;
      const data = wrapper.data || wrapper;
      let safeContent = [];
      let safeCount = 0;

      if (data.content && Array.isArray(data.content)) {
          safeContent = data.content;
          safeCount = data.totalCount;
      } else if (Array.isArray(data)) {
          safeContent = data;
          safeCount = data.length;
      }

      setNotices(safeContent);
      setTotalCount(safeCount);

    } catch (error) {
      console.error("공지사항 목록 조회 실패:", error);
      setNotices([]); // 에러 시 빈 배열
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. 공지사항 상세 조회
  const fetchNoticeDetail = async (boardNo) => {
    const token = localStorage.getItem("accessToken");
    const response = await axios.get(`${API_BASE_URL}/${boardNo}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return response.data.data || response.data;
  };

  // 3. 공지사항 등록 (FormData)
  const createNotice = async (noticeData, files) => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(noticeData)], { type: "application/json" });
    formData.append("notice", jsonBlob);

    if (files && files.length > 0) {
      Array.from(files).forEach(file => formData.append("files", file));
    }

    const token = localStorage.getItem("accessToken");
    await axios.post(API_BASE_URL, formData, {
      headers: { "Authorization": `Bearer ${token}` }
    });
  };

  // 4. 공지사항 수정 (FormData)
  const updateNotice = async (boardNo, noticeData, files) => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(noticeData)], { type: "application/json" });
    formData.append("notice", jsonBlob);

    if (files && files.length > 0) {
      Array.from(files).forEach(file => formData.append("files", file));
    }

    const token = localStorage.getItem("accessToken");
    await axios.put(`${API_BASE_URL}/${boardNo}`, formData, {
      headers: { "Authorization": `Bearer ${token}` }
    });
  };

  // 5. 공지사항 삭제
  const deleteNotice = async (boardNo) => {
    const token = localStorage.getItem("accessToken");
    await axios.delete(`${API_BASE_URL}/${boardNo}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
  };

  // loading 변수 포함해서 리턴
  return {
    notices,
    totalCount,
    loading,
    fetchNotices,
    fetchNoticeDetail,
    createNotice,
    updateNotice,
    deleteNotice
  };
};