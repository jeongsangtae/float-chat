import { ReactNode, useState, useRef, useEffect } from "react";

import { FaBell, FaTrash } from "react-icons/fa";
import { ToastContainer } from "react-toastify";

import Notification from "../UI/Notification";
import SideBar from "./SideBar";

import useAuthStore from "../../store/authStore";
import useLayoutStore from "../../store/layoutStore";
import useSocketStore from "../../store/socketStore";

import Avatar from "../Users/Avatar";

import classes from "./Layout.module.css";

interface LayoutProps {
  children: ReactNode;
  onLeaveChatRoom: () => void;
}

const Layout = ({ children, onLeaveChatRoom }: LayoutProps) => {
  const { userInfo, updateTheme } = useAuthStore();
  const {
    notificationHistory,
    unReadNotification,
    readNotification,
    clearNotification,
  } = useSocketStore();
  const { theme, setTheme, currentView, groupChatTitle } = useLayoutStore();

  const [fullOpacity, setFullOpacity] = useState(1);
  const [toggleNotification, setToggleNotification] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const themes = [
    "dark",
    "blue",
    "purple",
    "emerald",
    "rose",
    "sunset",
    "orange",
  ];

  useEffect(() => {
    if (userInfo?.theme) {
      setTheme(userInfo.theme);
    } else {
      setTheme("dark");
    }
  }, [userInfo?.theme, setTheme]);

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

  useEffect(() => {
    document.body.classList.remove(
      "theme-dark",
      "theme-blue",
      "theme-purple",
      "theme-emerald",
      "theme-rose",
      "theme-sunset",
      "theme-orange"
    );

    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  useEffect(() => {
    const outsideClickHandler = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setToggleNotification(false);
      }
    };

    document.addEventListener("mousedown", outsideClickHandler);

    return () => {
      document.removeEventListener("mousedown", outsideClickHandler);
    };
  }, []);

  const themeUpdateHandler = (theme: string) => {
    setTheme(theme);
    updateTheme(theme);
  };

  const notificationHandler = () => {
    readNotification();
    setToggleNotification((prev) => !prev);
  };

  const notificationClearHandler = () => {
    clearNotification();
  };

  return (
    <div className={classes.wrapper} style={{ opacity: fullOpacity }}>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
      />
      <div className={classes.header}>
        {currentView === "friends" && "친구"}
        {currentView === "directChat" && "다이렉트 메시지"}
        {currentView === "groupChat" && groupChatTitle}
      </div>
      <button
        className={classes["notification-button"]}
        ref={buttonRef}
        onClick={notificationHandler}
      >
        <FaBell />
        {unReadNotification && (
          <div className={classes["notification-dot"]}></div>
        )}
      </button>
      {themes.map((t) => (
        <button
          key={t}
          className={`${classes[t]} ${theme === t ? classes.active : ""}`}
          onClick={() => themeUpdateHandler(t)}
        ></button>
      ))}
      <div className={classes.layout}>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.01"
          value={fullOpacity}
          onChange={(e) => setFullOpacity(Number(e.target.value))}
          className={classes["full-opacity-slider"]}
        />
        <SideBar onLeaveChatRoom={onLeaveChatRoom} />
        <div className={classes["main-content"]}>{children}</div>
        {!toggleNotification && <Notification />}
      </div>
      {toggleNotification && (
        <div ref={dropdownRef} className={classes["notification-dropdown"]}>
          <div className={classes["notification-header"]}>
            <span className={classes["notification-title"]}>알림</span>
            {notificationHistory.length > 0 && (
              <button
                className={classes["notification-clear-button"]}
                onClick={notificationClearHandler}
              >
                <FaTrash />
              </button>
            )}
          </div>

          <div className={classes.underline}></div>

          <div className={classes["notification-list"]}>
            {notificationHistory.length === 0 ? (
              <div className={classes["notification-empty"]}>
                알림이 없습니다.
              </div>
            ) : (
              notificationHistory.map((notif) => (
                <div key={notif.id} className={classes["notification-item"]}>
                  <Avatar
                    nickname={notif.senderNickname}
                    avatarColor={notif.avatarColor}
                    avatarImageUrl={notif.avatarImageUrl}
                    extraClass="notif-list-avatar"
                  />

                  <div className={classes["notification-content"]}>
                    <div className={classes["notification-nickname"]}>
                      {notif.senderNickname}
                      {notif.type === "messageNotification" &&
                        notif.roomTitle &&
                        `(${notif.roomTitle})`}
                    </div>
                    <div className={classes["notification-message"]}>
                      {notif.type === "groupChatInviteNotification" &&
                      notif.roomTitle
                        ? `${notif.roomTitle} ${notif.message}`
                        : notif.message}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
