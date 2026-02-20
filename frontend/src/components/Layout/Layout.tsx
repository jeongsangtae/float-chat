import { ReactNode, useState, useEffect } from "react";

import Notification from "../UI/Notification";
import SideBar from "./SideBar";

import useLayoutStore from "../../store/layoutStore";

import classes from "./Layout.module.css";

interface LayoutProps {
  children: ReactNode;
  onLeaveChatRoom: () => void;
}

const Layout = ({ children, onLeaveChatRoom }: LayoutProps) => {
  const { currentView, groupChatTitle } = useLayoutStore();

  const [fullOpacity, setFullOpacity] = useState(1);

  useEffect(() => {
    // 우클릭 감지 함수
    const preventContextMenu = (event: MouseEvent) => {
      event.preventDefault(); // 기본 브라우저 컨텍스트 메뉴 막기
    };

    // 우클릭 이벤트를 전역에 등록
    document.addEventListener("contextmenu", preventContextMenu);

    // 컴포넌트가 언마운트되면 클린업
    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, []);

  return (
    <div className={classes.wrapper} style={{ opacity: fullOpacity }}>
      <div className={classes.header}>
        {currentView === "friends" && "친구"}
        {currentView === "directChat" && "다이렉트 메시지"}
        {currentView === "groupChat" && groupChatTitle}
      </div>
      <div className={classes.layout}>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.01"
          value={fullOpacity}
          onChange={(e) => setFullOpacity(Number(e.target.value))}
          className={classes["full-opacity-slider"]}
          // style={{
          //   position: "fixed",
          //   top: 5,
          //   right: 10,
          //   zIndex: 9999,
          // }}
        />
        <SideBar onLeaveChatRoom={onLeaveChatRoom} />
        <div className={classes["main-content"]}>{children}</div>
        <Notification />
      </div>
    </div>
  );
};

export default Layout;
