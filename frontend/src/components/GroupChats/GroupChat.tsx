import React, { useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";
import useModalStore from "../../store/modalStore";

import { GroupChatData } from "../../types";

import classes from "./GroupChat.module.css";

const GroupChat = ({
  _id,
  hostId,
  title,
  contextMenu,
  setContextMenu,
}: GroupChatData) => {
  const { userInfo } = useAuthStore();
  const { deleteGroupChat, leaveGroupChat } = useGroupChatStore();
  const { toggleModal } = useModalStore();
  const navigate = useNavigate();

  const contextMenuRef = useRef<HTMLUListElement | null>(null);

  const contextMenuOpenHandler = (
    event: React.MouseEvent<HTMLDivElement>
  ): void => {
    event.preventDefault();

    // 이미 열려 있고 같은 _id 그룹 채팅방을 열었을 경우 (닫기)
    // if (contextMenu.visible && contextMenu.id === _id) {
    //   // console.log(contextMenu.id === _id);
    //   contextMenuCloseHandler();
    //   return;
    // }

    // 다른 그룹 채팅방이 열려 있을 경우 (닫기)
    // if (contextMenu.visible && contextMenu.id !== _id) {
    //   // console.log(contextMenu.id === _id);
    //   contextMenuCloseHandler();
    //   return;
    // }

    // 아무것도 안 열려 있는 경우 (열기)
    setContextMenu({
      visible: !contextMenu.visible,
      x: event.pageX,
      y: event.pageY,
      id: _id,
    });
  };

  const contextMenuCloseHandler = (): void => {
    setContextMenu({ visible: false, x: 0, y: 0, id: null });
  };

  const groupChatDeleteHandler = async (): Promise<void> => {
    await deleteGroupChat(_id);
    contextMenuCloseHandler();
    navigate("/");
  };

  const groupChatLeaveHandler = async (): Promise<void> => {
    await leaveGroupChat(_id);
    contextMenuCloseHandler();
    navigate("/");
  };

  const groupChatEditHandler = (): void => {
    toggleModal("groupChatForm", "PATCH", { _id, title });
    contextMenuCloseHandler();
  };

  useEffect(() => {
    const contectMenuOutsideClickHandler = (event: MouseEvent): void => {
      if (
        contextMenu.visible &&
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        contextMenuCloseHandler();
      }
    };

    document.addEventListener("click", contectMenuOutsideClickHandler);
    return () => {
      document.removeEventListener("click", contectMenuOutsideClickHandler);
    };
  }, [contextMenu.visible]);

  return (
    <>
      <div onContextMenu={contextMenuOpenHandler}>
        <Link to={`/group-chat/${_id.toString()}`}>{title}</Link>
      </div>
      {contextMenu.visible && contextMenu.id === _id && (
        <ul
          className={classes["context-menu"]}
          ref={contextMenuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
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
