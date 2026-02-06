import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://34.218.225.105:8080/api';

export const useRegister = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    userid: '',
    password: '',
    confirmPassword: '',
    phone: '',
    email: '',
    refRno: '', // 지역 코드
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [validation, setValidation] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 이미지 미리보기 메모리 해제
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidation(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. 유효성 검사
    const errors = {};
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    if (!formData.refRno) {
      errors.refRno = '지역을 선택해주세요.';
    }

    if (Object.keys(errors).length > 0) {
      setValidation(errors);
      return;
    }

    setIsLoading(true);
    setValidation({});

    // 2. FormData 생성 (이미지 파일 전송용)
    const submitData = new FormData();
    submitData.append('memberName', formData.name);
    submitData.append('memberId', formData.userid);
    submitData.append('memberPwd', formData.password);
    submitData.append('phone', formData.phone);
    submitData.append('email', formData.email);
    submitData.append('refRno', formData.refRno);
    
    if (profileImageFile) {
      submitData.append('profileImg', profileImageFile);
    }

    // 3. 백엔드 API 호출
    try {
      // Content-Type은 axios가 FormData를 보고 자동으로 설정함
      const response = await axios.post(`${API_BASE_URL}/members`, submitData);

      if (response.status === 200 || response.status === 201) {
        alert('회원가입이 완료되었습니다! 로그인해주세요.');
        navigate('/login');
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      
      // 백엔드 에러 메시지 처리
      const errorMsg = error.response?.data?.message || error.response?.data || '회원가입 중 오류가 발생했습니다.';
      
      // 만약 백엔드가 필드별 에러(errors 배열)를 준다면 처리
      if (error.response?.data?.errors) {
         const serverErrors = {};
         error.response.data.errors.forEach(err => {
             serverErrors[err.field] = err.defaultMessage;
         });
         setValidation(serverErrors);
         alert('입력 정보를 다시 확인해주세요.');
      } else {
         setValidation(prev => ({ ...prev, apiError: errorMsg }));
         alert(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData, validation, isLoading, previewUrl,
    handleChange, handleImageChange, handleSubmit
  };
};