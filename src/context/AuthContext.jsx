import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

export const AuthContext = createContext();

const API_BASE_URL = 'http://34.218.225.105:8080/api';

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [currentUser, setCurrentUser] = useState(null); 
  const navigate = useNavigate();

  const [auth, setAuth] = useState({
    memberNo: null,
    role: null,
    memberImage: null,
    phone: null,
    refRno: null,
    memberName: null,
    accessToken: null,
    enrollDate: null,
    email: null,
    refreshToken: null,
    memberId: null,
    memberPoint: null,
    isAuthenticated: false
  });

  // 앱 시작 시 로컬 스토리지에서 정보 복원
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedMemberNo = localStorage.getItem("memberNo");
    
    if (storedToken && storedMemberNo) {
      // 1. Auth 상태 복원
      setAuth({
        memberNo: storedMemberNo,
        role: localStorage.getItem("role"),
        memberImage: localStorage.getItem("memberImage"),
        phone: localStorage.getItem("phone"),
        refRno: localStorage.getItem("refRno"),
        memberName: localStorage.getItem("memberName"),
        accessToken: storedToken,
        enrollDate: localStorage.getItem("enrollDate"),
        email: localStorage.getItem("email"),
        refreshToken: localStorage.getItem("refreshToken"),
        memberId: localStorage.getItem("memberId"),
        memberPoint: localStorage.getItem("memberPoint"),
        isAuthenticated: true
      });

      // 2. CurrentUser 상태 복원
      setCurrentUser({
        memberNo: storedMemberNo,
        memberName: localStorage.getItem('memberName'),
        email: localStorage.getItem('email'),
        phone: localStorage.getItem('phone'),
        memberPoint: localStorage.getItem('memberPoint'),
        memberImage: localStorage.getItem('memberImage'),
        enrollDate: localStorage.getItem('enrollDate'),
        role: localStorage.getItem('role')
      });

      // 3. 로그인 및 관리자 상태 복원
      setIsLoggedIn(true);
      setIsAdmin(localStorage.getItem("role") === 'ROLE_ADMIN');
      
      // 4. Axios 기본 헤더 설정 (새로고침 시 유지)
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []); 

  // 로그인 처리
  const login = (
    memberNo, role, memberImage, phone, refRno,
    memberName, accessToken, enrollDate, email,
    refreshToken, memberId, memberPoint
  ) => {
    
    // Auth 객체 생성
    const userObj = {
      memberNo, role, memberImage, phone, refRno, memberName, accessToken, enrollDate, email, refreshToken, memberId, memberPoint,
      isAuthenticated: true,
    };

    // 상태 업데이트
    setAuth(userObj);
    setIsLoggedIn(true);
    setIsAdmin(role === 'ROLE_ADMIN'); 
    
    // Header UI용 CurrentUser 업데이트
    setCurrentUser({
      memberNo, memberId, memberName, role, memberPoint, email, phone, memberImage, enrollDate
    });

    // 로컬 스토리지 저장
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("memberId", memberId);
    localStorage.setItem("role", role);
    localStorage.setItem("memberNo", memberNo);
    localStorage.setItem("memberName", memberName);
    localStorage.setItem("email", email);
    localStorage.setItem("phone", phone);
    localStorage.setItem("memberPoint", memberPoint);
    localStorage.setItem("enrollDate", enrollDate);
    localStorage.setItem("memberImage", memberImage || "");
    localStorage.setItem("refRno", refRno || "");

    // Axios 헤더 설정
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  };

  // 로그아웃 처리
  const logout = async () => {
    const logoutId = localStorage.getItem("memberId");
    const logoutToken = localStorage.getItem("refreshToken");
    const accessToken = localStorage.getItem("accessToken");

    try {
      if (logoutId && logoutToken) {
        await axios.post(`${API_BASE_URL}/auth/logout`, 
          {
            memberId: logoutId,
            refreshToken: logoutToken
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`, 
              'Content-Type': 'application/json'
            }
          }
        );
        console.log("서버 로그아웃 성공");
      }
    } catch (error) {
      console.error("서버 로그아웃 오류 (클라이언트 초기화 진행):", error);
    } finally {
      // 서버 응답과 관계없이 클라이언트 상태 초기화
      setAuth({ 
        memberNo: null, role: null, memberImage: null, phone: null, refRno: null,
        memberName: null, accessToken: null, enrollDate: null, email: null,
        refreshToken: null, memberId: null, memberPoint: null, isAuthenticated: false 
      });
      
      setIsLoggedIn(false);
      setIsAdmin(false);
      setCurrentUser(null);
      
      localStorage.clear();
      delete axios.defaults.headers.common['Authorization']; 
      
      navigate("/main");
    }
  };

  // 테스트용 간편 로그인 핸들러
  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    navigate("/main");
  };
  
  const handleAdminLogin = () => {
    setIsLoggedIn(true);
    setIsAdmin(true);
    navigate("/main");
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      isAdmin, 
      currentUser, 
      auth, 
      login, 
      logout, 
      handleLogin, 
      handleAdminLogin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};