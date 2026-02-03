# 프로젝트 리팩토링 가이드

## 📋 완료된 리팩토링 작업

### 1. ✅ API 클라이언트 중앙화
- **파일**: `src/config/index.js`, `src/utils/api.js`
- **변경사항**:
  - 하드코딩된 `http://localhost:8081`을 config로 중앙화
  - Axios 인스턴스 생성 및 인터셉터 설정
  - FormData 전용 API 클라이언트 분리

### 2. ✅ 공용 유틸리티 함수 분리
- **파일**: `src/utils/imageUrl.js`, `src/utils/auth.js`, `src/utils/validation.js`
- **변경사항**:
  - 중복된 이미지 URL 처리 함수 통합
  - 인증 관련 함수 분리
  - 폼 검증 함수 표준화

### 3. ✅ 메모리 누수 수정
- **파일**: `src/pages/UserFeedEnrollPage.jsx`, `src/pages/UserFeedEditPage.jsx`
- **변경사항**:
  - `URL.createObjectURL` cleanup 추가
  - useEffect로 언마운트 시 메모리 정리

### 4. ✅ 차트 시각화 구현
- **파일**: `src/components/charts/*`, `src/pages/admin/StatisticsPage.jsx`
- **라이브러리**: Recharts
- **추가된 차트**:
  - 사용자 증가 추이 (Line Chart)
  - 카테고리별 게시글 분포 (Pie Chart)
  - 포인트 발급 추이 (Bar Chart)
  - 탄소 절감량 추이 (Area Chart)

### 5. ✅ 에러 처리 표준화
- **파일**: `src/utils/toast.js`, `src/components/error/ErrorBoundary.jsx`
- **라이브러리**: react-hot-toast
- **변경사항**:
  - Toast 알림 시스템 구축
  - Error Boundary 구현
  - API 에러 자동 처리

### 6. ✅ 파일 업로드 검증 강화
- **파일**: `src/utils/imageUrl.js`
- **검증 항목**:
  - 파일 크기 (최대 5MB)
  - 파일 타입 (MIME 타입)
  - 파일 확장자
  - 파일 개수 제한

---

## 🔄 리팩토링 패턴 가이드

### 패턴 1: Fetch → Axios 변경

**Before (기존 코드):**
```javascript
const token = localStorage.getItem('accessToken');
const res = await fetch('http://localhost:8081/feeds', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});

if (!res.ok) {
  throw new Error('요청 실패');
}

const data = await res.json();
```

**After (리팩토링 후):**
```javascript
import { postFormData } from '../utils/api';
import { API_ENDPOINTS } from '../config';

const data = await postFormData(API_ENDPOINTS.FEEDS, formData);
```

**설명**:
- 토큰은 Axios 인터셉터에서 자동 추가
- API_BASE_URL은 config에서 자동 관리
- 에러 처리는 인터셉터에서 표준화

---

### 패턴 2: Alert → Toast 변경

**Before:**
```javascript
if (!title.trim()) {
  alert('제목을 입력해주세요.');
  return;
}

try {
  // API 호출
  alert('성공했습니다!');
} catch (error) {
  alert('오류가 발생했습니다.');
}
```

**After:**
```javascript
import { showSuccess, showError, showApiError } from '../utils/toast';

if (!title.trim()) {
  showError('제목을 입력해주세요.');
  return;
}

try {
  // API 호출
  showSuccess('성공했습니다!');
} catch (error) {
  showApiError(error); // API 에러 자동 파싱
}
```

---

### 패턴 3: LocalStorage → Auth Utils

**Before:**
```javascript
const token = localStorage.getItem('accessToken');
if (!token) {
  alert('로그인이 필요합니다.');
  return;
}

const memberId = localStorage.getItem('memberId');
const memberNo = localStorage.getItem('memberNo');
```

**After:**
```javascript
import { requireAuth, getCurrentUser } from '../utils/auth';

if (!requireAuth()) {
  return; // 자동으로 로그인 알림 + 리다이렉트
}

const { memberId, memberNo } = getCurrentUser();
```

---

### 패턴 4: 이미지 URL 처리

**Before:**
```javascript
const PROFILE_BASE_URL = "http://localhost:8081";

const resolveProfileImageUrl = (raw) => {
  if (!raw) return `${PROFILE_BASE_URL}/uploads/default_profile.jpg`;
  if (raw.startsWith('http')) return raw;
  if (raw.startsWith('/')) return `${PROFILE_BASE_URL}${raw}`;
  return `${PROFILE_BASE_URL}/uploads/${raw}`;
};
```

**After:**
```javascript
import { resolveProfileImageUrl } from '../utils/imageUrl';

const profileUrl = resolveProfileImageUrl(memberImage);
```

---

### 패턴 5: 파일 업로드 검증

**Before:**
```javascript
const handleFileChange = (e) => {
  const files = Array.from(e.target.files);
  setFiles(files);
  // 검증 없음
};
```

**After:**
```javascript
import { validateImageFiles } from '../utils/imageUrl';
import { showError } from '../utils/toast';

const handleFileChange = (e) => {
  const selected = Array.from(e.target.files);

  const validation = validateImageFiles(selected, 5); // 최대 5개
  if (!validation.valid) {
    showError(validation.error);
    return;
  }

  setFiles(selected);
};
```

---

## 📝 리팩토링이 필요한 주요 파일 목록

### 우선순위 높음 (즉시 리팩토링 권장)
1. **src/hooks/useEcoFeed.jsx** (622줄)
   - fetch → axios
   - alert → toast
   - localStorage → auth utils
   - resolveProfileImageUrl 중복 제거

2. **src/hooks/useBoardDetail.jsx** (281줄)
   - 동일한 패턴 적용

3. **src/hooks/useBoardList.jsx** (136줄)
   - 동일한 패턴 적용

4. **src/hooks/useBoardEnroll.jsx** (131줄)
   - 동일한 패턴 적용

### 우선순위 중간
5. **src/pages/admin/StatisticsPage.jsx**
   - fetch → axios (통계 API)

6. **src/context/AuthContext.jsx**
   - auth utils 통합 검토

### 우선순위 낮음
7. 기타 훅 파일들 (useLogin, useRegister, useComment 등)

---

## 🎯 리팩토링 체크리스트

각 파일을 리팩토링할 때 다음 항목을 확인하세요:

- [ ] `http://localhost:8081` 하드코딩 제거 → `API_BASE_URL` 또는 `API_ENDPOINTS` 사용
- [ ] `fetch` → `axios` (또는 `get`, `post`, `put`, `del`, `postFormData`)
- [ ] `alert()` → `showSuccess()`, `showError()`, `showApiError()`
- [ ] `localStorage.getItem('accessToken')` → `requireAuth()` 또는 `getAccessToken()`
- [ ] 중복된 `resolveProfileImageUrl` 함수 → `import`로 교체
- [ ] 파일 업로드 시 `validateImageFile` 또는 `validateImageFiles` 사용
- [ ] `URL.createObjectURL` 사용 시 cleanup 추가 (useEffect)
- [ ] 에러 처리 try-catch 표준화

---

## 🛠️ 환경 설정

### .env 파일 설정
프로덕션 배포 전에 `.env` 파일을 수정하세요:

```bash
# API Base URL (프로덕션 배포 시 변경 필수!)
VITE_API_BASE_URL=http://localhost:8081
VITE_PROFILE_BASE_URL=http://localhost:8081

# S3 Configuration (백엔드에서 S3 사용 시 설정)
# VITE_S3_BUCKET_NAME=your-bucket-name
# VITE_S3_REGION=ap-northeast-2
# VITE_CLOUDFRONT_URL=https://your-cloudfront-url.cloudfront.net
```

---

## 🚀 다음 단계

### 1. 백엔드 API 엔드포인트 확인
- `src/config/index.js`의 `API_ENDPOINTS` 객체가 실제 백엔드 API와 일치하는지 확인
- 필요 시 엔드포인트 추가/수정

### 2. 친환경 API 통합 (선택사항)
- 공개 환경 API 추가 (날씨, 공기질, 탄소 배출량 등)
- API 키를 `.env`에 추가
- 새로운 커스텀 훅 생성 (예: `useEnvironmentData.jsx`)

### 3. 디자인 시스템 구축
- Tailwind 설정 커스터마이징
- 공용 UI 컴포넌트 라이브러리 구축
  - Button, Input, Card, Modal 등
- 일관된 색상/폰트/간격 시스템

### 4. 성능 최적화
- React.memo, useMemo, useCallback 활용
- 이미지 lazy loading
- 코드 스플리팅

### 5. 테스트 코드 작성
- Jest + React Testing Library
- 주요 컴포넌트 단위 테스트
- API 모킹

---

## 💡 유용한 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 린트 체크
npm run lint

# 타입 체크 (TypeScript 도입 시)
npm run type-check
```

---

## 📚 참고 자료

- [Axios 문서](https://axios-http.com/)
- [React Hot Toast 문서](https://react-hot-toast.com/)
- [Recharts 문서](https://recharts.org/)
- [Tailwind CSS 문서](https://tailwindcss.com/)

---

## ✨ 리팩토링 예시 파일

완전히 리팩토링된 예시 파일:
- `src/pages/UserFeedEnrollPage.jsx`
- `src/pages/UserFeedEditPage.jsx`

이 파일들을 참고하여 동일한 패턴을 다른 파일에 적용하세요.

---

**작성일**: 2025-01-XX
**작성자**: Claude Sonnet 4.5
**프로젝트**: 친환경 커뮤니티 플랫폼
