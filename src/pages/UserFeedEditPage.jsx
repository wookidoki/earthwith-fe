// src/pages/UserFeedEditPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Image, Type, AlignLeft, Save, Hash, ChevronLeft } from 'lucide-react';

const UserFeedEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const post = location.state?.post;   // 🔥 EcoFeedPage에서 넘긴 데이터
  

  // 혹시 새로고침 등으로 state가 없는 경우 대비
  useEffect(() => {
    if (!post) {
      alert('수정할 게시글 정보를 찾을 수 없습니다.');
      navigate('/feed');
    }
  }, [post, navigate]);

  // 폼 상태 (초기값에 기존 글 내용 채워 넣기)
  const [selectedCategory, setSelectedCategory] = useState(
    post ? `#${post.categoryCode}` : null   // C1 → #C1
  );
  const [title, setTitle] = useState(post?.title ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [tags, setTags] = useState(
    post?.tags && post.tags.length > 0 ? post.tags.join(' ') : ''
  );
  const [files, setFiles] = useState([]); // 새로 선택한 파일만 여기 들어감
  const [previewUrls, setPreviewUrls] = useState([]);  // 🔥 추가

  // 기존 이미지 경로 (있으면 미리 보여주기용)
  const [existingImageUrl] = useState(post?.imageUrl ?? null);

  const fileInputRef = useRef(null);

  const categories = {
    '#C1': '인증',
    '#C2': '참여',
    '#C3': '후기',
    '#C4': '자유',
  };

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
  const selected = Array.from(e.target.files || []);
  setFiles(selected);

  const urls = selected.map((file) => URL.createObjectURL(file));
  setPreviewUrls(urls);   // 🔥 새 파일 선택 시 미리보기 교체
};

  // 🔥 수정 요청 (PUT /feeds/{boardNo})
  const handleSubmit = async () => {
    if (!selectedCategory) return alert('카테고리를 선택해주세요.');
    if (!title.trim()) return alert('제목을 입력해주세요.');
    if (!content.trim()) return alert('내용을 입력해주세요.');

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('boardTitle', title);
      formData.append('boardContent', content);
      formData.append(
        'boardCategory',
        selectedCategory.replace('#', '') // "#C1" → "C1"
      );

      // 태그는 나중에 백엔드 연결 시 추가
      // formData.append('tags', tags);

      // ⚠️ 파일은 "새로 선택했을 때만" append
      //    → 아무것도 안 보낼 경우, 서버 쪽 files=null 이라 기존 첨부 유지 가능
      if (files.length > 0) {
        files.forEach((file) => {
          formData.append('files', file);
        });
      }

      const boardNo = post.boardNo ?? post.id;

      const res = await fetch(`http://44.246.37.8:8080/feeds/${boardNo}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(`수정 실패: ${msg}`);
      }

      alert('게시글이 수정되었습니다.');
      navigate('/feed');
    } catch (err) {
      console.error(err);
      alert('게시글 수정 중 오류가 발생했습니다.');
    }
  };

  // post 없으면 렌더링 막기 (위 useEffect에서 안내 후 이동)
  if (!post) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* 상단 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">피드 글 수정</h1>
              <p className="text-gray-500 text-sm mt-1">
                수정 후 다시 공유해보세요.
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-200 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" /> 수정 완료
          </button>
        </div>

        <div className="space-y-6">
          {/* 카테고리 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              카테고리 (필수)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(categories).map(([key, value]) => (
                <label
                  key={key}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCategory === key
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={key}
                    checked={selectedCategory === key}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium text-gray-700">{value}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
              <Type className="w-4 h-4 mr-2 text-emerald-500" /> 제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-bold border-b border-gray-200 py-2 focus:outline-none focus:border-emerald-500 transition-colors placeholder-gray-300"
              placeholder="제목을 입력하세요"
            />
          </div>

          {/* 내용 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[300px] flex flex-col">
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
              <AlignLeft className="w-4 h-4 mr-2 text-emerald-500" /> 내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-1 resize-none border-none focus:ring-0 text-gray-700 leading-relaxed placeholder-gray-300"
              placeholder="내용을 작성해주세요..."
            ></textarea>
          </div>

          {/* 이미지 & 첨부파일 박스 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
              <Image className="w-4 h-4 mr-2 text-emerald-500" /> 사진 첨부
            </label>

            {/* 기존 이미지 미리 보기 (있다면) */}
            {existingImageUrl && files.length === 0 && (
              <div className="mb-3">
                <span className="text-xs text-gray-500">
                  현재 등록된 이미지
                </span>
                <div className="mt-1 w-full max-h-48 overflow-hidden rounded-lg border">
                  <img
                    src={existingImageUrl}
                    alt="기존 이미지"
                    className="w-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* 🔥 새로 선택한 파일이 있으면 그걸 보여주기 */}
            {previewUrls.length > 0 && (
            <div className="mb-3">
                <span className="text-xs text-gray-500">새로 선택한 이미지 미리보기</span>
                <div className="mt-1 w-full max-h-48 overflow-hidden rounded-lg border">
                <img
                    src={previewUrls[0]}
                    alt="새 이미지 미리보기"
                    className="w-full object-cover"
                />
                </div>
            </div>
            )}


            <div
              onClick={handleFileClick}
              className={`w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                files.length > 0
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                  : 'border-gray-300 bg-gray-50 text-gray-400 hover:border-emerald-400 hover:text-emerald-500'
              }`}
            >
              <Upload className="w-8 h-8 mb-2" />
              {files.length === 0 ? (
                <span className="text-xs">
                  클릭하여 새로운 이미지를 업로드 (선택 사항)
                </span>
              ) : (
                <>
                  <span className="text-xs font-semibold">
                    선택된 파일 {files.length}개
                  </span>
                  <span className="text-[11px] mt-1">
                    다시 클릭하면 다른 파일을 선택할 수 있어요
                  </span>
                </>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            {files.length > 0 && (
              <ul className="mt-3 space-y-1 max-h-24 overflow-y-auto text-xs text-gray-600">
                {files.map((file, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span className="truncate max-w-[80%]">{file.name}</span>
                    <span className="ml-2 text-[10px] text-gray-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 태그 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
              <Hash className="w-4 h-4 mr-2 text-emerald-500" /> 태그
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border-gray-200 rounded-lg py-2 px-4 focus:outline-none focus:border-emerald-500 placeholder-gray-400"
              placeholder="#태그1 #태그2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFeedEditPage;
