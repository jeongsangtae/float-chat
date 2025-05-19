import { ReactNode, useEffect } from "react";

import Notification from "../UI/Notification";
import SideBar from "./SideBar";

import useLayoutStore from "../../store/layoutStore";

import classes from "./Layout.module.css";

interface LayoutProps {
  children: ReactNode;
  onLeaveGroupChat: () => void;
}

const Layout = ({ children, onLeaveGroupChat }: LayoutProps) => {
  const { currentView, groupChatTitle } = useLayoutStore();

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
    <div className={classes.layout}>
      <div>
        {currentView === "friends" && "친구"}
        {currentView === "directChat" && "다이렉트 메시지"}
        {currentView === "groupChat" && groupChatTitle}
      </div>
      <SideBar onLeaveGroupChat={onLeaveGroupChat} />
      <div className={classes["main-content"]}>{children}</div>
      <Notification />
    </div>
  );
};

export default Layout;
