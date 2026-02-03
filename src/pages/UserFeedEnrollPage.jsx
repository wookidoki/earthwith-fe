import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Image, Type, AlignLeft, Save, Hash, ChevronLeft } from 'lucide-react';

const UserFeedEnrollPage = () => {
  const navigate = useNavigate();

  // 폼 상태
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [files, setFiles] = useState([]);       // 🔥 파일 배열 상태
  const [previewUrls, setPreviewUrls] = useState([]);  // 🔥 이미지 미리보기 URL들

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

  // 🔥 선택된 파일로 미리보기 URL 생성
  const urls = selected.map((file) => URL.createObjectURL(file));
  setPreviewUrls(urls);
};

  // 실제 게시글 등록
  const handleSubmit = async () => {
    if (!selectedCategory) return alert("카테고리를 선택해주세요.");
    if (!title.trim()) return alert("제목을 입력해주세요.");
    if (!content.trim()) return alert("내용을 입력해주세요.");

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("boardTitle", title);
      formData.append("boardContent", content);
      formData.append("boardCategory", selectedCategory.replace("#", "")); // "#C1" → "C1"

      // TODO: 태그는 백엔드에 맞게 처리할 때 추가
      // formData.append("tags", tags);

      if (files.length > 0) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }

      const res = await fetch("http://44.246.37.8:8080/feeds", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`등록 실패: ${msg}`);
      }

      alert("게시글이 등록되었습니다.");
      navigate("/feed"); // 피드 페이지 경로에 맞게
    } catch (err) {
      console.error(err);
      alert("게시글 등록 중 오류가 발생했습니다.");
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-900">피드 글쓰기</h1>
              <p className="text-gray-500 text-sm mt-1">
                당신의 실천을 공유해주세요.
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-200 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" /> 게시하기
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
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
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

            <div
              onClick={handleFileClick}
              className={`w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                files.length > 0
                  ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                  : "border-gray-300 bg-gray-50 text-gray-400 hover:border-emerald-400 hover:text-emerald-500"
              }`}
            >
              <Upload className="w-8 h-8 mb-2" />
              {files.length === 0 ? (
                <span className="text-xs">클릭하여 이미지 업로드</span>
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

            {/* 실제 input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            {/* 선택된 파일 리스트 */}
            {files.length > 0 && (
              <ul className="mt-3 space-y-1 max-h-24 overflow-y-auto text-xs text-gray-600">
                {files.map((file, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between"
                  >
                    <span className="truncate max-w-[80%]">{file.name}</span>
                    <span className="ml-2 text-[10px] text-gray-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </li>
                ))}
              </ul>
            )}
              {/* 🔥 실제 이미지 미리보기 (첫 번째 이미지 크게 보여주기) */}
              {previewUrls.length > 0 && (
                <div className="mt-4 w-full max-h-64 overflow-hidden rounded-lg border">
                  <img
                    src={previewUrls[0]}       // 첫 번째 이미지
                    alt="미리보기"
                    className="w-full h-full object-cover"
                  />
                </div>
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

export default UserFeedEnrollPage;
