import { create } from "zustand";

import useSocketStore from "./socketStore";

import { UserInfo } from "../types";

const apiURL = import.meta.env.VITE_API_URL;

// const {connect} = useSocketStore()

interface AuthStore {
  isLoggedIn: boolean;
  userInfo: UserInfo | null;
  intervalId: ReturnType<typeof setInterval> | null;
  accessToken: string | null;
  renewToken: () => void;
  pageAccess: () => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  verifyUser: () => Promise<void>;
  refreshToken: () => Promise<void>;
  refreshTokenExp: () => Promise<void>;
  editUserProfileForm: ({
    trimmedNickname,
    avatarColor,
    avatarImageUrl,
    modalData,
  }: {
    trimmedNickname: string;
    avatarColor?: string;
    avatarImageUrl?: string;
    modalData: {
      method: "POST" | "PATCH" | "DELETE";
      _id?: string;
      nickname?: string;
      avatarColor?: string;
      avatarImageUrl?: string;
    };
  }) => Promise<void>;
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

      // console.log(refreshTokenExpirationTime > now);
      // console.log(now >= storedExpirationTime);

      if (refreshTokenExpirationTime > now) {
        if (now >= storedExpirationTime) {
          get().refreshToken(); // 토큰 갱신
          set({ isLoggedIn: true }); // 토큰 갱신 후 로그인 상태 유지
          useSocketStore.getState().connect();
        }
      } else if (now >= refreshTokenExpirationTime) {
        get().logout(); // 리프레시 토큰 만료 시 로그아웃
      }

      // console.log(new Date(now * 1000));
      // console.log(new Date(storedExpirationTime * 1000));
      // console.log(new Date(refreshTokenExpirationTime * 1000));
      // console.log(
      //   now >= storedExpirationTime && refreshTokenExpirationTime > now,
      //   now >= refreshTokenExpirationTime
      // );
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

  login: async () => {
    try {
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
    } catch (error) {
      console.error("사용자 인증 오류:", error);
      set({ isLoggedIn: false });
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

      console.log("로그아웃 성공");

      set({ isLoggedIn: false, userInfo: null });
    } catch (error) {
      console.error("네트워크 오류:", error);
      alert(
        "네트워크 문제로 로그아웃에 실패했습니다. 새로고침 후 다시 시도해 주세요."
      );
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

  editUserProfileForm: async ({
    trimmedNickname,
    avatarColor,
    avatarImageUrl,
    modalData,
  }) => {
    try {
      const requestBody = {
        nickname: trimmedNickname,
        ...(avatarImageUrl ? { avatarImageUrl } : { avatarColor }),
        modalData,
      };

      const response = await fetch(`${apiURL}/editUserProfileForm`, {
        method: modalData.method,
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
        },
      }));
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "사용자 정보 수정 중 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
  },
}));

// 전역 초기화 (클라이언트 환경에서만 실행되도록 보호)
if (typeof window !== "undefined") {
  useAuthStore.getState().verifyUser();
}

export default useAuthStore;
