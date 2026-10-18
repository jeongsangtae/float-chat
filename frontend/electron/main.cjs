const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

// Electron 앱의 메인 창을 생성하는 함수
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    // 창의 기본 크기와 최소 크기
    width: 1440,
    height: 900,
    minWidth: 800,
    minHeight: 600,

    // 기본 타이틀바를 제거하고 투명한 창으로 생성
    // React에서 직접 만든 타이틀바를 사용하기 위한 설정
    frame: false,
    transparent: true,

    webPreferences: {
      // 메인 프로세스와 React 렌더러 사이의 연결을 담당하는 preload 파일
      preload: path.join(__dirname, "preload.cjs"),

      // 렌더러에서 Electron의 Node.js 기능에 직접 접근하지 못하도록 설정
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 개발 환경에서는 로컬 React 서버를,
  // 패키징된 앱에서는 배포된 FloatChat 웹 앱을 불러옴
  if (app.isPackaged) {
    mainWindow.loadURL("https://float-chat-vdc1.onrender.com");
  } else {
    mainWindow.loadURL("http://localhost:5173");
  }

  // F5 키를 누르면 현재 창의 페이지를 새로고침
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F5" && input.type === "keyDown") {
      // Electron의 기본 키 처리와 중복되지 않도록 기본 동작을 취소
      event.preventDefault();

      // 현재 페이지를 다시 불러옴
      mainWindow.webContents.reload();
    }
  });
};

// React에서 전달한 창 제어 요청을 처리
// 현재 포커스된 창을 최소화
ipcMain.on("window-minimize", () => {
  BrowserWindow.getFocusedWindow()?.minimize();
});

// 현재 포커스된 창을 최대화하거나 원래 크기로 복원
ipcMain.on("window-maximize", () => {
  const window = BrowserWindow.getFocusedWindow();

  // 포커스된 창이 없으면 종료
  if (!window) {
    return;
  }

  // 최대화 상태에 따라 복원 또는 최대화 실행
  if (window.isMaximized()) {
    window.unmaximize();
  } else {
    window.maximize();
  }
});

// 현재 포커스된 창을 닫음
ipcMain.on("window-close", () => {
  BrowserWindow.getFocusedWindow()?.close();
});

// Electron 앱이 준비되면 메인 창 생성
app.whenReady().then(() => {
  createWindow();

  // macOS에서 Dock 아이콘 등을 눌러 앱을 다시 활성화했을 때
  // 열린 창이 없다면 새 창을 생성
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 모든 창이 닫혔을 때 앱 종료
// macOS에서는 일반적으로 앱 자체를 종료하지 않음
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// 테스트

// 현재 창의 위치를 반환
// ipcMain.handle("window-get-position", (event) => {
//   const window = BrowserWindow.fromWebContents(event.sender);

//   return window?.getPosition() ?? [0, 0];
// });

// 전달받은 좌표로 창 이동
ipcMain.on("window-set-position", (event, x, y) => {
  const window = BrowserWindow.fromWebContents(event.sender);

  if (window && !window.isMaximized()) {
    window.setPosition(Math.round(x), Math.round(y));
  }
});

ipcMain.handle("window-get-state", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);

  if (!window) {
    return null;
  }

  return {
    position: window.getPosition(),
    isMaximized: window.isMaximized(),
  };
});
