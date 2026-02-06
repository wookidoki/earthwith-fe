import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import axios from 'axios';

const API_BASE_URL = 'http://34.218.225.105:8080/api';

export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // 입력값 상태 관리 (객체로 통합)
  const [credentials, setCredentials] = useState({ 
    memberId: '', 
    memberPwd: '' 
  });
  
  // 에러 메시지 상태 관리
  const [errors, setErrors] = useState({ 
    id: '', 
    pwd: '' 
  });

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    // 입력 시 해당 필드의 에러 메시지 초기화
    setErrors(prev => ({ ...prev, id: '', pwd: '' }));
  };

  // 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { memberId, memberPwd } = credentials;
    const regexp = /^[a-zA-Z0-9]{2,40}$/;

    // 아이디 유효성 검사
    if (!regexp.test(memberId)) {
      setErrors(prev => ({ ...prev, id: "아이디 형식이 올바르지 않습니다." }));
      return;
    }

    // 비밀번호 유효성 검사 (원본 코드의 주석된 로직 참고하여 필요 시 활성화)
    // const regexpPwd = /^(?=.{6,20}$)(?=.*[a-z])(?=.*\d)[^\s]+$/;
    // if (!regexpPwd.test(memberPwd)) {
    //   setErrors(prev => ({ ...prev, pwd: "비밀번호 형식이 올바르지 않습니다." }));
    //   return;
    // }

    try {
      const result = await axios.post(`${API_BASE_URL}/auth/login`, {
        memberId,
        memberPwd
      });

      // 구조 분해 할당 (ResponseData 래퍼에서 data 추출)
      const {
        memberNo, role, memberImage, phone, refRno, memberName,
        accessToken, enrollDate, email, refreshToken, memberPoint
      } = result.data.data;
      
      // Context 로그인 함수 호출 (원본 코드와 동일한 12개 인자 순서 유지)
      login(
        memberNo, role, memberImage, phone, refRno, memberName, 
        accessToken, enrollDate, email, refreshToken, memberId, memberPoint
      );

      alert("로그인 성공");
      navigate("/main");

    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.["error-message"] || "로그인 실패";
      alert(errorMessage);
    }
  };

  return { credentials, errors, handleChange, handleSubmit };
};