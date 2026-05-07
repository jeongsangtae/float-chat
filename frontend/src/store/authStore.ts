import { create } from "zustand";
import { toast } from "react-toastify";

import useSocketStore from "./socketStore";

import { UserInfo, EditUserPasswordData, DeleteUserData } from "../types";

const apiURL = import.meta.env.VITE_API_URL;

interface SignupData {
  email: string;
  nickname: string;
  username: string;
  password: string;
  confirmPassword: string;
  avatarColor: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
  type?: string;
}

// type LoginResult = { success: true } | { success: false; message: string };

interface AuthStore {
  isLoggedIn: boolean;
  userInfo: UserInfo | null;
  intervalId: ReturnType<typeof setInterval> | null;
  accessToken: string | null;
  renewToken: () => void;
  pageAccess: () => void;
  signup: (signupData: SignupData) => Promise<AuthResult>;
  login: (loginData: LoginData) => Promise<AuthResult>;
  logout: () => Promise<void>;
  verifyUser: () => Promise<void>;
  refreshToken: () => Promise<void>;
  refreshTokenExp: () => Promise<void>;
  updateTheme: (theme: string) => Promise<void>;
  editUserProfileForm: (payload: EditUserProfilePayload) => Promise<void>;
  editUserPasswordForm: (payload: EditUserPasswordData) => Promise<AuthResult>;
  deleteUserForm: (payload: DeleteUserData) => Promise<AuthResult>;
  updateUserGroupChatOrder: (order: string[]) => void;
}

type EditUserProfilePayload =
  | {
      avatarMode: true;
      trimmedNickname: string;
      avatarImageUrl: string;
      modalContext: ModalContext;
    }
  | {
      avatarMode: false;
      trimmedNickname: string;
      avatarColor: string;
      modalContext: ModalContext;
    };

interface ModalContext {
  _id: string;
  method: "POST" | "PATCH" | "DELETE";
  avatarImageUrl: string | null;
}

interface EditUserProfileRequestBody {
  _id: string;
  nickname: string;
  avatarColor: string | null;
  avatarImageUrl: string | null;
}

const useAuthStore = create<AuthStore>((set, get) => ({
  isLoggedIn: false,
  userInfo: null,
  accessToken: null,
  intervalId: null,
  renewToken: () => {
    const checkTokenExpiration = () => {
      const now = Math.floor(new Date().getTime() / 1000);
      // const storedExpirationTime = parseInt(localStorage.getItem("expirationTime") ?? "0", 10);
      const storedExpirationTime = parseInt(
        localStorage.getItem("expirationTime") || "0",
        10
      );
      const refreshTokenExpirationTime = parseInt(
        localStorage.getItem("refreshTokenExp") || "0",
        10
      );

      if (refreshTokenExpirationTime > now) {
        if (now >= storedExpirationTime) {
          get().refreshToken(); // 토큰 갱신
          set({ isLoggedIn: true }); // 토큰 갱신 후 로그인 상태 유지
          useSocketStore.getState().connect();
        }
      } else if (now >= refreshTokenExpirationTime) {
        get().logout(); // 리프레시 토큰 만료 시 로그아웃
      }
    };

    // 브라우저 로드 시 토큰 확인
    const checkTokenOnLoad = () => {
      const isLoggedInStored = localStorage.getItem("isLoggedIn");

      if (isLoggedInStored) {
        checkTokenExpiration(); // 로컬 스토리지의 만료 시간 확인
      }
    };

    checkTokenOnLoad(); // 페이지 로드 시 토큰 만료 여부 확인

    if (get().isLoggedIn) {
      try {
        get().verifyUser();

        // 일정 시간마다 토큰 만료 확인
        const interval = setInterval(checkTokenExpiration, 60 * 1000);
        console.log(interval, "인터벌 실행");

        set({ intervalId: interval });

        return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 정리
      } catch (error) {
        console.error("오류 발생:", error);
        get().logout(); // 오류 발생 시 로그아웃
      }
    }
  },

  // 로그인 상태 확인
  pageAccess: () => {
    const storedUserLoggedInInformation = localStorage.getItem("isLoggedIn");

    if (storedUserLoggedInInformation === "1") {
      set({ isLoggedIn: true });
    }
  },

  signup: async (signupData) => {
    try {
      const response = await fetch(`${apiURL}/signup`, {
        method: "POST",
        body: JSON.stringify(signupData),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message };
      }

      return { success: true };
    } catch (error) {
      console.error("에러 내용:", error);

      return { success: false, type: "NETWORK_ERROR" };
    }
  },

  login: async (loginData) => {
    try {
      const response = await fetch(`${apiURL}/login`, {
        method: "POST",
        body: JSON.stringify(loginData),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message };
      }

      const now = Math.floor(new Date().getTime() / 1000);
      // const expirationTime = Math.ceil(now + 60 * 60);
      const expirationTime = Math.ceil(now + 5 * 60);

      localStorage.setItem("isLoggedIn", "1");
      localStorage.setItem("expirationTime", expirationTime.toString());

      // 로그인 상태 업데이트
      set({ isLoggedIn: true });

      useSocketStore.getState().connect();

      // 같은 스토어의 verifyUser, refreshTokenExp 액션 호출
      await get().verifyUser();
      await get().refreshTokenExp();

      return { success: true };
    } catch (error) {
      console.error("로그인 오류:", error);
      set({ isLoggedIn: false });

      return { success: false, type: "NETWORK_ERROR" };
    }
  },

  logout: async () => {
    try {
      const intervalId = get().intervalId;

      if (intervalId) {
        clearInterval(intervalId);
        set({ intervalId: null }); // intervalId 상태 초기화
        console.log("로그아웃: 인터벌 정리 완료");
      }

      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("expirationTime");
      localStorage.removeItem("refreshTokenExp");

      const response = await fetch(`${apiURL}/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("로그아웃 실패");
      }

      set({ isLoggedIn: false, userInfo: null });
    } catch (error) {
      console.error("네트워크 오류:", error);
      toast.error("로그아웃 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  verifyUser: async () => {
    try {
      const response = await fetch(`${apiURL}/accessToken`, {
        credentials: "include",
      });

      if (!response.ok) {
        const now = Math.floor(new Date().getTime() / 1000);
        const refreshTokenExpirationTime = parseInt(
          localStorage.getItem("refreshTokenExp") || "0",
          10
        );

        if (now >= refreshTokenExpirationTime) {
          get().logout(); // 리프레시 토큰 만료 시 로그아웃
          throw new Error("쿠키에 리프레시 토큰 없음");
        }
        get().refreshToken(); // 토큰 갱신
        return; // 갱신 후 재시도 방지를 위해 종료
      }

      const resData = await response.json();

      console.log("사용자 인증 성공", resData);

      set({ isLoggedIn: true, userInfo: resData });
      useSocketStore.getState().connect();
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

      set({ isLoggedIn: true, userInfo: resData });
      useSocketStore.getState().connect();
      // set({ accessToken: resData });

      const now = Math.floor(new Date().getTime() / 1000);
      // const expirationTime = Math.ceil(now + 60 * 60);
      const expirationTime = Math.ceil(now + 5 * 60);
      localStorage.setItem("isLoggedIn", "1");
      localStorage.setItem("expirationTime", expirationTime.toString());

      await get().refreshTokenExp();
    } catch (error) {
      console.error("토큰 갱신 오류:", error);
      set({ isLoggedIn: false, userInfo: null }); // 오류 시 로그아웃 상태로 처리
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

  updateTheme: async (theme) => {
    try {
      const response = await fetch(`${apiURL}/updateTheme`, {
        method: "PATCH",
        body: JSON.stringify({ theme }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`테마 모드 수정 실패`);
      }

      set((prev) => ({
        userInfo: prev.userInfo ? { ...prev.userInfo, theme } : prev.userInfo,
      }));
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("변경 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  editUserProfileForm: async (payload) => {
    try {
      const { trimmedNickname, avatarMode, modalContext } = payload;

      const requestBody: EditUserProfileRequestBody = {
        _id: modalContext._id,
        nickname: trimmedNickname,
        avatarColor: null,
        avatarImageUrl: null,
      };

      if (avatarMode && payload.avatarImageUrl) {
        // 이미지 모드 + 이미지 있음 → 이미지 업데이트
        requestBody.avatarImageUrl = payload.avatarImageUrl;
      } else if (!avatarMode && payload.avatarColor !== "#ccc") {
        // 색 모드 + 실제 색 선택됨 → 색 업데이트
        requestBody.avatarColor = payload.avatarColor;
      } else if (!avatarMode && payload.avatarColor === "#ccc") {
        // 색 모드인데 색이 없고 (#ccc) → 이미지 유지
        requestBody.avatarImageUrl = modalContext.avatarImageUrl;
      }

      const response = await fetch(`${apiURL}/editUserProfileForm`, {
        method: modalContext.method,
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`사용자 정보 수정 실패`);
      }

      const resData = await response.json();

      set((prev) => ({
        ...prev, // 기존 상태 전체를 유지
        userInfo: {
          ...prev.userInfo!, // 기존 사용자 정보 유지 및 !를 사용해 userInfo가 null이 아님을 단언
          nickname: resData.editUserProfile.nickname, // nickname만 덮어쓰기
          avatarColor: resData.editUserProfile.avatarColor,
          avatarImageUrl: resData.editUserProfile.avatarImageUrl,
        },
      }));
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("수정 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  editUserPasswordForm: async (payload) => {
    try {
      const { password, newPassword, confirmNewPassword } = payload;

      const requestBody: EditUserPasswordData = {
        password,
        newPassword,
        confirmNewPassword,
      };

      const response = await fetch(`${apiURL}/editUserPasswordForm`, {
        method: "PATCH",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message };
      }

      return { success: true };
    } catch (error) {
      console.error("에러 내용:", error);
      return { success: false, type: "NETWORK_ERROR" };
    }
  },

  deleteUserForm: async (payload) => {
    try {
      const { password, confirmText } = payload;

      const requestBody: DeleteUserData = {
        password,
        confirmText,
      };

      const response = await fetch(`${apiURL}/deleteUserForm`, {
        method: "DELETE",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message };
      }

      return { success: true };
    } catch (error) {
      console.error("에러 내용:", error);
      return { success: false, type: "NETWORK_ERROR" };
    }
  },

  updateUserGroupChatOrder: (order) => {
    console.log(order);
    set((prev) => {
      if (!prev.userInfo) return prev;

      return {
        userInfo: {
          ...prev.userInfo,
          groupChatOrder: order,
        },
      };
    });
  },
}));

// 전역 초기화 (클라이언트 환경에서만 실행되도록 보호)
if (typeof window !== "undefined") {
  useAuthStore.getState().verifyUser();
}

export default useAuthStore;
