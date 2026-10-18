const { contextBridge, ipcRenderer } = require("electron");

// React 렌더러에서 사용할 수 있는 API를 window.electronAPI로 공개
// Electron의 내부 기능 전체가 아니라 필요한 기능만 선택적으로 제공
contextBridge.exposeInMainWorld("electronAPI", {
  // React에서 현재 앱이 Electron 환경인지 확인할 때 사용
  isElectron: true,

  // 메인 프로세스에 창 최소화 요청
  minimize: () => ipcRenderer.send("window-minimize"),

  // 메인 프로세스에 창 최대화 또는 복원 요청
  maximize: () => ipcRenderer.send("window-maximize"),

  // 메인 프로세스에 창 닫기 요청
  close: () => ipcRenderer.send("window-close"),

  // 테스트
  // getPosition: () => ipcRenderer.invoke("window-get-position"),
  getState: () => ipcRenderer.invoke("window-get-state"),
  setPosition: (x, y) => ipcRenderer.send("window-set-position", x, y),
});
