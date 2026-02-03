import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // AuthContext 경로 확인 필요

const API_BASE_URL = 'http://44.246.37.8:8080'; // 서버 주소

export const useComment = () => {
  const { auth } = useAuth(); // 로그인 정보 가져오기
  const [loading, setLoading] = useState(false);

  // 헤더 설정 (토큰 포함)
  const getHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // 1. 댓글 작성
  const addComment = async (boardNo, content) => {
    if (!auth.isAuthenticated) {
      alert("로그인이 필요합니다.");
      return false;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/comments`, 
        { 
          refBno: Number(boardNo),
          commentContent: content 
        }, 
        { headers: getHeaders() }
      );
      return true;
    } catch (error) {
      alert(error.response?.data || "댓글 등록 실패");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 2. 댓글 수정
  const updateComment = async (commentNo, content) => {
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/comments/${commentNo}`, 
        { commentContent: content }, 
        { headers: getHeaders() }
      );
      alert("댓글이 수정되었습니다.");
      return true;
    } catch (error) {
      alert(error.response?.data || "댓글 수정 실패");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 3. 댓글 삭제
  const deleteComment = async (commentNo) => {
    if (!window.confirm("정말로 삭제하시겠습니까?")) return false;
    
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/comments/${commentNo}`, { headers: getHeaders() });
      alert("댓글이 삭제되었습니다.");
      return true;
    } catch (error) {
      alert(error.response?.data || "댓글 삭제 실패");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 4. 댓글 신고
  const reportComment = async (commentNo, reportData) => {
    setLoading(true);
    try {
      // reportData 예시: { refRcno: 1, reportContent: "욕설 사용" }
      await axios.post(`${API_BASE_URL}/comments/${commentNo}/reports`, 
        reportData, 
        { headers: getHeaders() }
      );
      alert("신고가 접수되었습니다.");
      return true;
    } catch (error) {
      alert(error.response?.data || "신고 처리에 실패했습니다.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, addComment, updateComment, deleteComment, reportComment };
};