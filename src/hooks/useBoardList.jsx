import { useState, useEffect } from 'react';
import { 
  Sun, Car, Coffee, ShoppingBag, 
  Info, HeartHandshake, Megaphone, ShoppingCart, 
  FileText, MoreHorizontal 
} from 'lucide-react';

const API_BASE_URL = 'http://34.218.225.105:8080/api';

// 카테고리 설정
const CATEGORY_CONFIG = {
  'A1': { name: '에너지', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-100' },
  'A2': { name: '자동차', icon: Car, color: 'text-blue-600', bg: 'bg-blue-100' },
  'A3': { name: '일상생활', icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-100' },
  'A4': { name: '녹색소비', icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-100' },
  'AN': { name: '기타', icon: MoreHorizontal, color: 'text-gray-500', bg: 'bg-gray-100' },
  'B1': { name: '정보', icon: Info, color: 'text-indigo-500', bg: 'bg-indigo-100' },
  'B2': { name: '봉사모집', icon: HeartHandshake, color: 'text-rose-500', bg: 'bg-rose-100' },
  'B3': { name: '홍보', icon: Megaphone, color: 'text-purple-500', bg: 'bg-purple-100' },
  'B4': { name: '공동구매', icon: ShoppingCart, color: 'text-teal-600', bg: 'bg-teal-100' },
  'BN': { name: '기타', icon: MoreHorizontal, color: 'text-gray-500', bg: 'bg-gray-100' },
  'DEFAULT': { name: '일반', icon: FileText, color: 'text-gray-500', bg: 'bg-gray-100' }
};

export const getCategoryStyle = (code) => {
  return CATEGORY_CONFIG[code] || CATEGORY_CONFIG['DEFAULT'];
};

const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/uploads/${path}`;
};

export const useBoardList = (pageFilter) => {
  const [listPosts, setListPosts] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryCode, setSelectedCategoryCode] = useState('ALL'); 

  const transformData = (data) => {
    if (!data) return [];
    return data.map(item => {
      const config = getCategoryStyle(item.boardCategory);
      
      const safeImage = resolveImageUrl(item.attachmentPath) 
        || `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(item.boardTitle?.substring(0,4))}`;

      return {
        id: item.boardNo,
        title: item.boardTitle,
        categoryCode: item.boardCategory,
        categoryName: config.name, 
        date: item.regDate,
        views: item.viewCount,
        likeCount: item.likeCount || 0,
        icon: config.icon,
        color: config.color,
        bg: config.bg,
        img: safeImage
      };
    });
  };

  useEffect(() => {
    const fetchBoards = async () => {
      setLoading(true);
      try {
        // [수정 핵심] 값이 없으면 파라미터를 아예 보내지 않음
        const params = new URLSearchParams();
        params.append('page', currentPage);
        
        if (pageFilter) {
            params.append('type', pageFilter);
        }

        if (selectedCategoryCode && selectedCategoryCode !== 'ALL' && selectedCategoryCode !== '') {
            params.append('category', selectedCategoryCode);
        }

        if (searchTerm && searchTerm.trim() !== '') {
            params.append('keyword', searchTerm);
        }

        const response = await fetch(`${API_BASE_URL}/boards?${params.toString()}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`데이터 로딩 실패 (${response.status}): ${errorText}`);
        }
        
        const result = await response.json();
        const data = result.data;

        setTopPosts(transformData(data.topPosts));
        setListPosts(transformData(data.list));
        setPageInfo(data.pi);

      } catch (error) {
        console.error("게시판 로드 에러:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [currentPage, pageFilter, selectedCategoryCode, searchTerm]);

  const getCategoryList = () => {
    const base = [{ code: 'ALL', name: '전체' }];
    const targets = pageFilter === 'A' 
      ? ['A1', 'A2', 'A3', 'A4', 'AN'] 
      : ['B1', 'B2', 'B3', 'B4', 'BN'];

    return base.concat(targets.map(code => ({
      code: code,
      name: CATEGORY_CONFIG[code].name
    })));
  };

  return { 
    topPosts, 
    filteredListPosts: listPosts, 
    pageInfo, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    selectedCategoryCode, 
    setSelectedCategoryCode,
    categoryList: getCategoryList(),
    setCurrentPage 
  };
};