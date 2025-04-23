import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";
import useModalStore from "../../store/modalStore";

import { GroupChatData } from "../../types";

import classes from "./GroupChat.module.css";

const GroupChat = ({ _id, hostId, title }: GroupChatData) => {
  const { userInfo } = useAuthStore();
  const { deleteGroupChat, leaveGroupChat } = useGroupChatStore();
  const { toggleModal } = useModalStore();
  const navigate = useNavigate();

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });

  const contextMenuOpenHandler = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setContextMenu({
      visible: !contextMenu.visible,
      x: event.pageX,
      y: event.pageY,
    });
  };

  const ContextMenuCloseHandler = () =>
    setContextMenu({ visible: false, x: 0, y: 0 });

  const groupChatDeleteHandler = async (): Promise<void> => {
    await deleteGroupChat(_id);
    ContextMenuCloseHandler();
    navigate("/");
  };

  const groupChatLeaveHandler = async (): Promise<void> => {
    await leaveGroupChat(_id);
    ContextMenuCloseHandler();
    navigate("/");
  };

  const groupChatEditHandler = () => {
    toggleModal("groupChatForm", "PATCH", { _id, title });
    ContextMenuCloseHandler();
  };

  return (
    <>
      <div onContextMenu={contextMenuOpenHandler}>
        <Link to={`/group-chat/${_id.toString()}`}>{title}</Link>
      </div>
      {contextMenu.visible && (
        <ul className={classes["context-menu"]}>
          {hostId === userInfo?._id ? (
            <>
              <button type="button" onClick={groupChatEditHandler}>
                수정
              </button>
              <button type="button" onClick={groupChatDeleteHandler}>
                삭제
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={groupChatLeaveHandler}>
                나가기
              </button>
            </>
          )}
        </ul>
      )}
    </>
  );
};

export default GroupChat;
