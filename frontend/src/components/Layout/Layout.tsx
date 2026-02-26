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

  const [theme, setTheme] = useState("dark");
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
    <div
      className={`${classes.wrapper} theme-${theme}`}
      style={{ opacity: fullOpacity }}
    >
      <div className={classes.header}>
        {currentView === "friends" && "친구"}
        {currentView === "directChat" && "다이렉트 메시지"}
        {currentView === "groupChat" && groupChatTitle}
      </div>
      <button
        className={`${classes.dark} ${theme === "dark" ? classes.active : ""}`}
        onClick={() => setTheme("dark")}
      ></button>
      <button
        className={`${classes.blue} ${theme === "blue" ? classes.active : ""}`}
        onClick={() => setTheme("blue")}
      ></button>
      <button
        className={`${classes.purple} ${
          theme === "purple" ? classes.active : ""
        }`}
        onClick={() => setTheme("purple")}
      ></button>
      <button
        className={`${classes.emerald} ${
          theme === "emerald" ? classes.active : ""
        }`}
        onClick={() => setTheme("emerald")}
      ></button>
      <button
        className={`${classes.rose} ${theme === "rose" ? classes.active : ""}`}
        onClick={() => setTheme("rose")}
      ></button>
      <button
        className={`${classes.sunset} ${
          theme === "sunset" ? classes.active : ""
        }`}
        onClick={() => setTheme("sunset")}
      ></button>
      <button
        className={`${classes.orange} ${
          theme === "orange" ? classes.active : ""
        }`}
        onClick={() => setTheme("orange")}
      ></button>
      <div className={classes.layout}>
        <SideBar
          onLeaveChatRoom={onLeaveChatRoom}
          fullOpacity={fullOpacity}
          setFullOpacity={setFullOpacity}
        />
        <div className={classes["main-content"]}>{children}</div>
        <Notification />
      </div>
    </div>
  );
};

export default Layout;
