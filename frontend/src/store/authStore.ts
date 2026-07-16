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

interface AuthStore {
  // 상태
  isLoggedIn: boolean;
  userInfo: UserInfo | null;
  intervalId: ReturnType<typeof setInterval> | null;
  accessToken: string | null;

  // 인증 관련
  renewToken: () => void;
  pageAccess: () => void;
  signup: (signupData: SignupData) => Promise<AuthResult>;
  login: (loginData: LoginData) => Promise<AuthResult>;
  logout: () => Promise<void>;

  // 사용자 정보
  verifyUser: () => Promise<void>;
  updateTheme: (theme: string) => Promise<void>;
  editUserProfileForm: (payload: EditUserProfilePayload) => Promise<void>;

  //토큰
  refreshToken: () => Promise<void>;
  refreshTokenExp: () => Promise<void>;

  // 보안
  editUserPasswordForm: (payload: EditUserPasswordData) => Promise<AuthResult>;
  deleteUserForm: (payload: DeleteUserData) => Promise<AuthResult>;

  // 그룹 채팅
  updateUserGroupChatOrder: (order: string[]) => void;

  // 추후 사용할 내용
  // restoreLastReadMessages: () => Promise<void>;
}

// interface LastReadMessage {
//   _id: string;
//   roomId: string;
//   userId: string;
//   lastVisibleMessageId: string;
//   messageLength: number;
// }

// 프로필 수정 요청 데이터
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

// 프로필 수정 후 모달 상태 동기화를 위한 정보
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

  // Access Token 만료 여부를 확인하고 필요 시 재발급
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

        set({ intervalId: interval });

        return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 정리
      } catch (error) {
        console.error("오류 발생:", error);
        get().logout(); // 오류 발생 시 로그아웃
      }
    }
  },

  // 페이지 새로고침 시 로그인 상태 복원
  pageAccess: () => {
    const storedUserLoggedInInformation = localStorage.getItem("isLoggedIn");

    if (storedUserLoggedInInformation === "1") {
      set({ isLoggedIn: true });
    }
  },

  // 회원가입 요청
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

  // 로그인 요청
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
      // await get().restoreLastReadMessages();

      return { success: true };
    } catch (error) {
      console.error("로그인 오류:", error);
      set({ isLoggedIn: false });

      return { success: false, type: "NETWORK_ERROR" };
    }
  },

  // 로그아웃 및 로컬 상태 초기화
  logout: async () => {
    try {
      const intervalId = get().intervalId;

      if (intervalId) {
        clearInterval(intervalId);
        set({ intervalId: null }); // intervalId 상태 초기화
      }

      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("expirationTime");
      localStorage.removeItem("refreshTokenExp");

      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("prevMessagesLength-")) {
          localStorage.removeItem(key);
        }
      });

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

  // Access Token을 검증하고 사용자 정보를 조회
  verifyUser: async () => {
    try {
      const response = await fetch(`${apiURL}/accessToken`, {
        credentials: "include",
      });

      // Access Token 만료 시 Refresh Token으로 재발급 시도
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

      set({ isLoggedIn: true, userInfo: resData });
      useSocketStore.getState().connect();
    } catch (error) {
      console.error("사용자 인증 오류:", error);
      set({ isLoggedIn: false, userInfo: null });
    }
  },

  // Refresh Token을 이용해 Access Token 재발급
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

  // Refresh Token 만료 시간 조회 및 저장
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

  // 마지막으로 읽은 메시지 복원 기능 재구현 예정
  // 기존 구현은 제거, 필요 시 Git History 참고

  // 사용자 테마 변경
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

  // 프로필(닉네임 / 아바타) 수정
  editUserProfileForm: async (payload) => {
    try {
      const { trimmedNickname, avatarMode, modalContext } = payload;

      // 아바타 모드에 따라 서버로 전송할 데이터 구성
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
        ...prev,
        userInfo: {
          ...prev.userInfo!, // !를 사용해 userInfo가 null이 아님을 단언
          nickname: resData.editUserProfile.nickname,
          avatarColor: resData.editUserProfile.avatarColor,
          avatarImageUrl: resData.editUserProfile.avatarImageUrl,
        },
      }));
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("수정 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  // 비밀번호 변경
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

  // 계정 삭제
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

      const intervalId = get().intervalId;

      if (intervalId) {
        clearInterval(intervalId);
        set({ intervalId: null });
      }

      // 로그인 관련 로컬 데이터 초기화
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("expirationTime");
      localStorage.removeItem("refreshTokenExp");

      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("prevMessagesLength-")) {
          localStorage.removeItem(key);
        }
      });

      set({ isLoggedIn: false, userInfo: null });
      return { success: true };
    } catch (error) {
      console.error("에러 내용:", error);
      return { success: false, type: "NETWORK_ERROR" };
    }
  },

  // 그룹 채팅방 정렬 순서 업데이트
  updateUserGroupChatOrder: (order) => {
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
