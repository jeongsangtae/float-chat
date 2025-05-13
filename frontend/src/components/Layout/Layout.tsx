import { ReactNode, useEffect } from "react";

import Notification from "../UI/Notification";
import SideBar from "./SideBar";

import classes from "./Layout.module.css";

interface LayoutProps {
  children: ReactNode;
  onLeaveGroupChat: () => void;
}

const Layout = ({ children, onLeaveGroupChat }: LayoutProps) => {
  useEffect(() => {
    const preventContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener("contextmenu", preventContextMenu);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, []);

  return (
    <div className={classes.layout}>
      <SideBar onLeaveGroupChat={onLeaveGroupChat} />
      <div className={classes["main-content"]}>{children}</div>
      <Notification />
    </div>
  );
};

export default Layout;
