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
  renewToken: () => void;
  pageAccess: () => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  verifyUser: () => Promise<void>;
  refreshToken: () => Promise<void>;
  refreshTokenExp: () => Promise<void>;
}

const useAuthStore = create<AuthStore>((set, get) => ({
  isLoggedIn: false,
  userInfo: null,
  accessToken: null,
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

      if (now >= storedExpirationTime && refreshTokenExpirationTime > now) {
        get().refreshToken(); // 토큰 갱신
        set({ isLoggedIn: true }); // 토큰 갱신 후 로그인 상태 유지
      } else if (now >= refreshTokenExpirationTime) {
        get().logout(); // 리프레시 토큰 만료 시 로그아웃
      }

      console.log(new Date(now * 1000));
      console.log(new Date(storedExpirationTime * 1000));
      console.log(new Date(refreshTokenExpirationTime * 1000));
      console.log(
        now >= storedExpirationTime && refreshTokenExpirationTime > now,
        now >= refreshTokenExpirationTime
      );
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
      // const expirationTime = Math.ceil(now + 60 * 60);
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
