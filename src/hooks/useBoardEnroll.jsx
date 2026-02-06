import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import axios from 'axios';

const API_BASE_URL = 'http://34.218.225.105:8080/api';

export const useBoardEnroll = () => { 
    const navigate = useNavigate();
    const { isAdmin, isLoggedIn } = useAuth(); 

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [file, setFile] = useState(null); 
    const [isLoading, setIsLoading] = useState(false);

    // [핵심] DB 값과 일치하도록 '#' 제거
    const adminCategoryIds = useMemo(() => ['A1', 'A2', 'A3', 'A4', 'A5'], []);

    const handleCategoryChange = useCallback((e) => {
        const newCategory = e.target.value;
        if (!isAdmin && adminCategoryIds.includes(newCategory)) {
            alert('일반 사용자는 관리자 전용 카테고리를 선택할 수 없습니다.');
            return;
        }
        setSelectedCategory(newCategory);
    }, [isAdmin, adminCategoryIds]);

    const handleFileChange = useCallback((e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    }, []);

    const handleSubmit = useCallback(async (isUpdate = false, boardNo = null) => {
        if (!isLoggedIn) {
             alert('로그인이 필요합니다.');
             return;
        }
        if (!title.trim() || !content.trim() || !selectedCategory) {
            alert('필수 정보를 모두 입력해주세요.');
            return;
        }
        
        setIsLoading(true);

        try {
            // [핵심] 요청 직전 토큰 가져오기
            const token = localStorage.getItem('accessToken');
            const memberId = localStorage.getItem('memberId');

            const formData = new FormData();
            const boardData = {
                boardTitle: title,
                boardContent: content,
                boardCategory: selectedCategory,
                boardWriter: memberId,
                ...(isUpdate && { boardNo: boardNo }) 
            };

            formData.append('board', new Blob([JSON.stringify(boardData)], { type: 'application/json' }));
            
            if (file) {
                formData.append('file', file);
            }

            // [수정] Content-Type 제거 (Axios가 자동으로 boundary를 포함하여 설정함)
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            if (isUpdate) {
                await axios.put(`${API_BASE_URL}/boards/${boardNo}`, formData, config);
                alert('게시글이 수정되었습니다.');
            } else {
                await axios.post(`${API_BASE_URL}/boards`, formData, config);
                alert('게시글이 등록되었습니다.');
            }
            
            navigate('/board'); 

        } catch (error) {
            console.error('Submit Error:', error);
            const status = error.response?.status;
            if (status === 403) {
                alert('권한이 없습니다. (로그아웃 후 다시 시도해보세요)');
            } else {
                alert(`오류 발생: ${status || '알 수 없음'}`);
            }
        } finally {
            setIsLoading(false);
        }
    }, [title, content, selectedCategory, file, isLoggedIn, navigate]);

    const handleDelete = useCallback(async (boardNo) => {
        if (!isLoggedIn) return;
        if (!window.confirm('정말로 삭제하시겠습니까?')) return;
        
        setIsLoading(true);

        try {
            const token = localStorage.getItem('accessToken');
            
            await axios.delete(`${API_BASE_URL}/boards/${boardNo}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            alert('삭제되었습니다.');
            navigate('/board');
        } catch (error) {
            console.error(error);
            alert('삭제 실패');
        } finally {
            setIsLoading(false);
        }
    }, [isLoggedIn, navigate]);

    return {
        title, setTitle,
        content, setContent,
        selectedCategory, setSelectedCategory,
        handleCategoryChange,
        file, handleFileChange,
        handleSubmit,
        handleDelete,
        isLoading,
        isAdmin,
        adminCategoryIds
    };
};