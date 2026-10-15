// electron 관련 타입 정의
export {};

declare global {
  interface Window {
    electronAPI?: {
      isElectron: true;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    };
  }
}
