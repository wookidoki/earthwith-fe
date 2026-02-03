import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { getCategoryStyle } from './useBoardList'; // 이 import는 외부 파일에 정의된 함수를 가져옵니다.

const API_BASE_URL = 'http://44.246.37.8:8080';
const PROFILE_BASE_URL = "http://44.246.37.8:8080";

// [헬퍼 함수] 프로필 이미지 URL 처리 헬퍼
const resolveProfileImageUrl = (raw) => {
    if (!raw) return `${PROFILE_BASE_URL}/uploads/default_profile.jpg`;
    if (raw.startsWith('http')) return raw;
    if (raw.startsWith('/')) return `${PROFILE_BASE_URL}${raw}`;
    return `${PROFILE_BASE_URL}/uploads/${raw}`;
};


export const useBoardDetail = (id) => {
    const navigate = useNavigate();
    const { auth } = useAuth(); 
    
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    
    const [newComment, setNewComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const getCategoryInfoFromCode = getCategoryStyle; // 외부 import된 함수를 사용


    // 댓글 목록 조회 함수
    const fetchComments = useCallback(async () => {
        if (!id) return;
        try {
            const res = await fetch(`${API_BASE_URL}/comments?boardNo=${id}`);
            if (!res.ok) throw new Error('댓글을 불러오지 못했습니다.');

            const data = await res.json();
            setComments(data.map(c => ({
                ...c, 
                memberImage: resolveProfileImageUrl(c.memberImage),
                regDate: c.regDate
            })));
        } catch (err) { console.error('댓글 조회 실패:', err); }
    }, [id]);


    // 게시글 상세 조회
    const fetchBoardDetail = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/boards/${id}`, { headers });

            if (!response.ok) {
                if (response.status === 404) throw new Error('게시글을 찾을 수 없습니다.');
                throw new Error('서버 통신 오류');
            }

            const data = await response.json();
            const style = getCategoryInfoFromCode(data.boardCategory);
            
            setPost({
                id: data.boardNo,
                boardNo: data.boardNo,
                title: data.boardTitle,
                category: data.boardCategory,
                categoryName: data.categoryName || style.label,
                content: data.boardContent,
                author: data.memberName,
                boardWriter: data.boardWriter,
                memberImage: resolveProfileImageUrl(data.memberImage),
                views: data.viewCount,
                date: data.regDate,
                img: data.attachmentPath || null,
                likes: data.likeCount ?? 0,
                isLiked: typeof data.isLiked === 'boolean' ? data.isLiked : !!data.liked,
                isBookmarked: data.bookmarked ?? false,
            });

            if (data.commentList) { 
                setComments(data.commentList.map(c => ({
                    ...c,
                    memberImage: resolveProfileImageUrl(c.memberImage),
                    regDate: c.regDate
                })));
            } else { 
                fetchComments(); 
            }

        } catch (err) { console.error("상세 조회 실패:", err); setError(err.message); } finally { setLoading(false); }
    }, [id, token, fetchComments]); 


    // [기능] 좋아요 토글
    const handleLikeToggle = useCallback(async () => {
        if (!token) { window.alert('로그인 후 이용 가능합니다.'); return; }
        try {
            const res = await fetch(`${API_BASE_URL}/boards/${id}/like`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('좋아요 요청 실패');
            
            await fetchBoardDetail(); 
            window.alert('좋아요 상태가 변경되었습니다.'); 
        } catch (error) {
            console.error('좋아요 처리 중 에러:', error);
        }
    }, [id, token, fetchBoardDetail]);

    // [기능] 북마크 토글
    const handleBookmarkToggle = useCallback(async () => {
        if (!token) { window.alert('로그인 후 이용 가능합니다.'); return; }
        try {
            const res = await fetch(`${API_BASE_URL}/boards/${id}/bookmark`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({}),
            });
            if (!res.ok) throw new Error('북마크 요청 실패');

            await fetchBoardDetail();
            window.alert('저장 상태가 변경되었습니다.');

        } catch (error) {
            console.error('북마크 처리 중 에러:', error);
        }
    }, [id, token, fetchBoardDetail]);

    // [기능] 게시글 신고
    const handleReportSubmit = useCallback(async (reason, content) => {
        if (!token) { window.alert('로그인이 필요합니다.'); return; }
        try {
            const res = await fetch(`${API_BASE_URL}/boards/${id}/reports`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    refBno: id,
                    refRcno: reason,
                    reportContent: content.trim(),
                }),
            });
            if (!res.ok) throw new Error("신고 처리 실패");
            window.alert('신고가 접수되었습니다.');
        } catch (err) {
            console.error('신고 에러:', err);
            window.alert('신고 처리 중 오류 발생');
        }
    }, [id, token]);

    // [기능] 게시글 삭제
    const deletePost = useCallback(async () => {
        if (!token) { window.alert('로그인 후 이용 가능한 기능입니다.'); return; }
        if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?\n삭제된 글은 복구할 수 없습니다.')) return; 

        try {
            const res = await fetch(`${API_BASE_URL}/boards/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!res.ok) throw new Error('삭제 권한이 없거나 실패했습니다.');

            window.alert('게시글이 삭제되었습니다.');
            navigate('/board');
        } catch (err) {
            console.error('Delete failed:', err);
            window.alert('삭제에 실패했습니다. 본인이 작성한 글인지 확인해주세요.');
        }
    }, [id, token, navigate]);

    // [기능] 댓글 등록/수정
    const handleCommentSubmit = useCallback(async () => {
        const content = newComment.trim();
        if (!content) return;

        if (!token) { window.alert('로그인이 필요합니다.'); return; }

        const isEdit = !!editingCommentId;
        const url = isEdit ? `${API_BASE_URL}/comments/${editingCommentId}` : `${API_BASE_URL}/comments`;
        const method = isEdit ? 'PUT' : 'POST';
        const bodyData = isEdit ? { commentContent: content } : { refBno: id, commentContent: content };

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(bodyData),
            });
            if (!res.ok) throw new Error('댓글 처리 실패');

            setNewComment('');
            setEditingCommentId(null);
            fetchComments(); 
        } catch (err) {
            console.error(isEdit ? '댓글 수정 에러:' : '댓글 등록 에러:', err);
        }
    }, [id, token, newComment, editingCommentId, fetchComments]);

    // [기능] 댓글 삭제
    const handleDeleteComment = useCallback(async (commentId) => {
        if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('댓글 삭제 실패');

            fetchComments(); 
        } catch (e) {
            console.error('댓글 삭제 에러:', e);
        }
    }, [token, fetchComments]);
    
    // [기능] 댓글 신고
    const handleCommentReportSubmit = useCallback(async (commentId, reason, content) => {
        if (!reason) { window.alert('신고 사유를 선택해주세요.'); return; }
        if (!content?.trim()) { window.alert('신고 내용을 입력해주세요.'); return; }
        if (!token) { window.alert('로그인이 필요합니다.'); return; }

        try {
            const res = await fetch(`${API_BASE_URL}/comments/${commentId}/reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ refRcno: reason, reportContent: content.trim() }),
            });

            if (!res.ok) throw new Error('댓글 신고 처리 실패');
            window.alert('댓글 신고가 접수되었습니다.');
        } catch (err) {
            console.error('댓글 신고 에러:', err);
            window.alert('댓글 신고 처리 중 오류 발생');
        }
    }, [token]);

    // 댓글 수정 모드 진입 (UI 상태 관리)
    const handleCommentEditInit = useCallback((commentId, currentText) => {
        setEditingCommentId(commentId);
        setNewComment(currentText);
    }, []);

    // 댓글 수정 취소 (UI 상태 관리)
    const handleCommentEditCancel = useCallback(() => {
        setEditingCommentId(null);
        setNewComment('');
    }, []);


    useEffect(() => {
        fetchBoardDetail();
    }, [fetchBoardDetail]);


    return { 
        post, 
        comments, 
        loading, 
        error, 
        newComment, setNewComment, editingCommentId,
        isAdmin: auth?.role === 'ROLE_ADMIN', 
        actions: { 
            deletePost, 
            handleLikeToggle, 
            handleBookmarkToggle, 
            handleReportSubmit,
            handleCommentSubmit, 
            handleCommentEditInit, 
            handleCommentEditCancel, 
            handleDeleteComment, 
            handleCommentReportSubmit
        } 
    };
};