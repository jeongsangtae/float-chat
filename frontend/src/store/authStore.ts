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

const useAuthStore = create((set) => ({
  isLoggedIn: false,
  userInfo: null,
  accessToken: null,
  // login: () => set({isLoggedIn: true}),
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
      const expirationTime = Math.ceil(now + 2 * 60 * 60);
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

export default useAuthStore;
