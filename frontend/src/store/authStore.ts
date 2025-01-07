import { useState, useEffect } from "react";
import { create } from "zustand";

// interface AuthState {
//   isLoggedIn: boolean;
//   login: () => void
//   logout: () => void
// }

const apiURL = import.meta.env.VITE_API_URL;

// const [isLoggedIn, setIsLoggedIn] = useState(false);
// const [userInfo, setUserInfo] = useState(null);

interface UserInfo {
  _id: string;
  email: string;
  username: string;
  nickname: string;
  tokenExp: number;
}

interface AuthStore {
  isLoggedIn: boolean;
  userInfo: UserInfo | null;
  accessToken: string | null;
  login: () => Promise<void>;
  verifyUser: () => Promise<void>;
  refreshTokenExp: () => Promise<void>;
}

const useAuthStore = create<AuthStore>((set, get) => ({
  isLoggedIn: false,
  userInfo: null,
  accessToken: null,
  login: async () => {
    try {
      const now = Math.floor(new Date().getTime() / 1000);
      // const expirationTime = Math.ceil(now + 2 * 60 * 60);
      const expirationTime = Math.ceil(now + 5 * 60);

      localStorage.setItem("isLoggedIn", "1");
      localStorage.setItem("expirationTime", expirationTime.toString());

      // 로그인 상태 업데이트
      set({ isLoggedIn: true });

      // 같은 스토어의 verifyUser, refreshTokenExp 액션 호출
      await get().verifyUser();
      await get().refreshTokenExp();
    } catch (error) {
      console.error("사용자 인증 오류:", error);
      set({ isLoggedIn: false });
    }
  },
  // logout: () => set({isLoggedIn: false}),
  verifyUser: async () => {
    try {
      const response = await fetch(`${apiURL}/accessToken`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("쿠키에 JWT 토큰 없음");
      }

      const resData = await response.json();

      console.log(resData);
      set({ isLoggedIn: true, userInfo: resData });
    } catch (error) {
      console.error("사용자 인증 오류:", error);
      set({ isLoggedIn: false, userInfo: null });
    }
  },

  refreshToken: async () => {
    try {
      const response = await fetch(`${apiURL}/refreshToken`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("쿠키에 JWT 토큰 없음");
      }

      const resData = await response.json();

      set({ accessToken: resData });

      const now = Math.floor(new Date().getTime() / 1000);
      // const expirationTime = Math.ceil(now + 2 * 60 * 60);
      const expirationTime = Math.ceil(now + 5 * 60);
      localStorage.setItem("isLoggedIn", "1");
      localStorage.setItem("expirationTime", expirationTime.toString());
    } catch (error) {
      console.error("사용자 인증 오류:", error);
    }
  },

  refreshTokenExp: async () => {
    try {
      const response = await fetch(`${apiURL}/refreshTokenExp`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("쿠키에 JWT 토큰 없음");
      }

      const resData = await response.json();

      localStorage.setItem("refreshTokenExp", resData.tokenExp);
    } catch (error) {
      console.error("사용자 인증 오류", error);
    }
  },
}));

// 전역 초기화 (클라이언트 환경에서만 실행되도록 보호)
if (typeof window !== "undefined") {
  useAuthStore.getState().verifyUser();
}

export default useAuthStore;
