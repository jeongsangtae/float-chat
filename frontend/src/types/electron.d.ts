// electron 관련 타입 정의

// 해당 파일을 모듈로 취급하는 역할
// 파일에 import나 export가 없으면 해당 파일을 전역 스크립트 취급
export {};

// 모듈 파일 안에서 전역 타입 선언
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
