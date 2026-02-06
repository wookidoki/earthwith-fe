import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  XCircle,
  CheckCircle,
  List,
  Users,
} from "lucide-react";

import ErrorModal from "../admin/ErrorModal";
import MemberManagement from "./MemberManagement";

const ITEMS_PER_PAGE = 5;
const API_BASE = "http://34.218.225.105:8080/api/admin";

/* =======================================================================
   📌 공통 테이블 컴포넌트
======================================================================= */
const ItemTable = ({ items, currentPage, setCurrentPage, totalPages, onRowClick }) => {
  return (
    <div className="overflow-x-auto shadow-lg rounded-xl">
      <table className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-emerald-50">
          <tr>
            {["번호", "제목/내용", "작성자", "작성일", "신고", "상태"].map((e) => (
              <th
                key={e}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                {e}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr
              key={item.boardNo || item.commentNo}
              className="hover:bg-yellow-50 transition duration-150 cursor-pointer"
              onClick={() => onRowClick(item)}
            >
              <td className="px-6 py-4">{item.boardNo || item.commentNo}</td>
              <td className="px-6 py-4 font-semibold max-w-xs truncate">
                {item.boardTitle || item.commentContent}
              </td>
              <td className="px-6 py-4">{item.memberId}</td>
              <td className="px-6 py-4">{item.regDate}</td>
              <td className="px-6 py-4">
                {(item.boardReportCount > 0 || item.commentReportCount > 0) ? (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>{item.boardReportCount || item.commentReportCount}</div>
                  </div>
                ) : (
                  <CheckCircle className="w-5 h-5 text-gray-300" />
                )}
              </td>
              <td className="px-6 py-4">
                {item.status === "Y" ? (
                  <span className="text-green-600 font-bold">활성</span>
                ) : (
                  <span className="text-red-500 font-bold">삭제됨</span>
                )}
              </td>
            </tr>
          ))}

          {items.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center py-10 text-gray-500">
                조회된 항목이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center items-center py-4 bg-white rounded-b-xl">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="p-2 mx-1 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="px-4">{currentPage} / {totalPages}</span>

        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="p-2 mx-1 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

/* =======================================================================
   📌 상세 모달
======================================================================= */
const ItemDetailModal = ({ item, onClose, onActionComplete, onError }) => {
  if (!item) return null;

  const accessToken = localStorage.getItem("accessToken");

  const sendRequest = async (method, url, body = null) => {
    try {
      const config = {
        method,
        url,
        headers: { Authorization: `Bearer ${accessToken}` },
        data: body,
      };
      await axios(config);

      onActionComplete();
      onClose();
    } catch (e) {
      const msg = e.response?.data?.message || "처리 중 오류가 발생했습니다.";
      onError?.(msg);   // 💥 alert → ErrorModal로 전달
    }
  };

  const handleConfirmReport = () => {
    if (item.type === "board") {
      sendRequest("put", `${API_BASE}/boards/report/${item.board.boardNo}`);
    } else {
      sendRequest("put", `${API_BASE}/comments/report/${item.comment.commentNo}`);
    }
  };

  const handleDelete = () => {
    if (item.type === "board") {
      sendRequest("delete", `${API_BASE}/boards/${item.board.boardNo}`);
    } else {
      sendRequest("delete", `${API_BASE}/comments/${item.comment.commentNo}`);
    }
  };

  const handleRestore = () => {
    if (item.type === "board") {
      sendRequest("put", `${API_BASE}/boards/${item.board.boardNo}`);
    } else {
      sendRequest("put", `${API_BASE}/comments/${item.comment.commentNo}`);
    }
  };

  /* 게시글 상세 */
  if (item.type === "board") {
    const board = item.board;
    const attachments = item.attachments || [];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fadeIn">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <List className="w-5 h-5 mr-2 text-emerald-600" /> 게시글 상세
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-3">
            <p><strong>번호:</strong> {board.boardNo}</p>
            <p><strong>제목:</strong> {board.boardTitle}</p>
            <p><strong>작성자:</strong> {board.memberId}</p>
            <p><strong>작성일:</strong> {board.regDate}</p>
            <p><strong>상태:</strong>
              {board.status === "Y" ? (
                <span className="text-green-600 font-bold">활성</span>
              ) : (
                <span className="text-red-500 font-bold">삭제됨</span>
              )}
            </p>
            <p><strong>신고 수:</strong> {board.boardReportCount}</p>

            <div>
              <strong>내용:</strong>
              <div className="mt-2 whitespace-pre-wrap border rounded p-3 bg-gray-50">
                {board.boardContent}
              </div>
            </div>

            {attachments.length > 0 && (
              <div>
                <strong className="block mt-3 mb-2">첨부파일</strong>
                <div className="flex flex-wrap gap-3">
                  {attachments.map((a, idx) => (
                    <img
                      key={idx}
                      src={a.attachmentPath}
                      alt={`attachment-${idx}`}
                      className="w-32 h-32 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={handleConfirmReport}
                className="bg-emerald-500 text-white py-2 px-4 rounded-lg"
              >
                신고확인
              </button>

              <button
                onClick={handleDelete}
                className="bg-red-500 text-white py-2 px-4 rounded-lg"
              >
                삭제하기
              </button>

              <button
                onClick={handleRestore}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg"
              >
                복원하기
              </button>
            </div>

            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* 댓글 상세 */
  const comment = item.comment;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <List className="w-5 h-5 mr-2 text-emerald-600" /> 댓글 상세
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3">
          <p><strong>번호:</strong> {comment.commentNo}</p>
          <p><strong>작성자:</strong> {comment.memberId}</p>
          <p><strong>작성일:</strong> {comment.regDate}</p>
          <p><strong>상태:</strong>
            {comment.status === "Y" ? (
              <span className="text-green-600 font-bold">활성</span>
            ) : (
              <span className="text-red-500 font-bold">삭제됨</span>
            )}
          </p>
          <p><strong>신고 수:</strong> {comment.commentReportCount}</p>

          <div>
            <strong>내용:</strong>
            <div className="mt-2 whitespace-pre-wrap border rounded p-3 bg-gray-50">
              {comment.commentContent}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={handleConfirmReport}
              className="bg-emerald-500 text-white py-2 px-4 rounded-lg"
            >
              신고확인
            </button>

            <button
              onClick={handleDelete}
              className="bg-red-500 text-white py-2 px-4 rounded-lg"
            >
              삭제하기
            </button>

            <button
              onClick={handleRestore}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg"
            >
              복원하기
            </button>
          </div>

          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

/* =======================================================================
   📌 메인 페이지 (게시글 + 댓글 + 회원관리)
======================================================================= */
const BoardManagementPage = () => {
  const [selectedType, setSelectedType] = useState("POST_ALL");
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const getApiUrl = () => {
    switch (selectedType) {
      case "POST_ALL":
        return `${API_BASE}/boards`;
      case "POST_REPORTED":
        return `${API_BASE}/boards/reported`;
      case "REVIEW_ALL":
        return `${API_BASE}/comments`;
      case "REVIEW_REPORTED":
        return `${API_BASE}/comments/reported`;
      default:
        return `${API_BASE}/boards`;
    }
  };

  /* 리스트 조회 */
  const fetchData = async (page = currentPage) => {
    try {
      const res = await axios.get(getApiUrl(), {
        params: { page: page - 1 },
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      const { content, totalCount } = res.data;
      setItems(content || []);
      setTotalPages(Math.max(1, Math.ceil((totalCount || 0) / ITEMS_PER_PAGE)));
    } catch (e) {
      const msg = e.response?.data?.message || "데이터 조회 중 오류가 발생했습니다.";
      setErrorMessage(msg);
      setItems([]);
    }
  };

  /* 상세 조회 */
  const handleRowClick = async (row) => {
    try {
      if (row.boardNo) {
        const res = await axios.get(`${API_BASE}/boards/${row.boardNo}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });

        const body = res.data || {};
        setSelectedItem({
          type: "board",
          board: body.board,
          attachments: body.attachment || [],
        });
      } else if (row.commentNo) {
        const res = await axios.get(`${API_BASE}/comments/${row.commentNo}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });

        setSelectedItem({
          type: "comment",
          comment: res.data,
        });
      }
    } catch (e) {
      const msg = e.response?.data?.message || "상세 조회 중 오류가 발생했습니다.";
      setErrorMessage(msg);
    }
  };

  // 탭 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
    fetchData(1);
  }, [selectedType]);

  // 페이지 변경 시 조회
  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-12 py-10">

        {/* 제목 */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 border-l-4 border-emerald-500 pl-4 flex items-center">
            <List className="w-7 h-7 mr-2 text-emerald-500" /> 게시글 및 댓글 관리
          </h1>
        </header>

        {/* 필터 섹션 */}
        <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setSelectedType("POST_ALL")}
              className={`py-2 px-4 rounded-lg font-semibold transition ${selectedType === "POST_ALL" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
            >
              게시글 전체조회
            </button>

            <button
              onClick={() => setSelectedType("POST_REPORTED")}
              className={`py-2 px-4 rounded-lg font-semibold transition ${selectedType === "POST_REPORTED" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
            >
              신고된 게시글 조회
            </button>

            <button
              onClick={() => setSelectedType("REVIEW_ALL")}
              className={`py-2 px-4 rounded-lg font-semibold transition ${selectedType === "REVIEW_ALL" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
            >
              댓글 전체조회
            </button>

            <button
              onClick={() => setSelectedType("REVIEW_REPORTED")}
              className={`py-2 px-4 rounded-lg font-semibold transition ${selectedType === "REVIEW_REPORTED" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
            >
              신고된 댓글 조회
            </button>
          </div>
        </section>

        {/* 리스트 섹션 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {selectedType === "POST_ALL" && "게시글 전체 목록"}
            {selectedType === "POST_REPORTED" && "신고된 게시글 목록"}
            {selectedType === "REVIEW_ALL" && "댓글 전체 목록"}
            {selectedType === "REVIEW_REPORTED" && "신고된 댓글 목록"}
          </h2>

          <ItemTable
            items={items}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            onRowClick={handleRowClick}
          />
        </section>

        {/* 상세 모달 */}
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onActionComplete={() => fetchData(currentPage)}
          onError={(msg) => setErrorMessage(msg)}   // ErrorModal로 에러 전달
        />

        {/* 에러 모달 */}
        <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />

        {/* 회원관리 */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-gray-800 border-l-4 border-blue-500 pl-4 flex items-center mb-6">
            <Users className="w-7 h-7 mr-2 text-blue-500" /> 회원 관리
          </h2>

          <MemberManagement />
        </section>
      </div>
    </div>
  );
};

export default BoardManagementPage;
