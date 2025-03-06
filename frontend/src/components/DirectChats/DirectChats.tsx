import { useEffect } from "react";

import { NotificationData } from "../../types";

import DirectChat from "./DirectChat";
import Friends from "../Friends/Friends";
import useAuthStore from "../../store/authStore";
import useSocketStore from "../../store/socketStore";
import useGroupChatStore from "../../store/groupChatStore";

const DirectChats = () => {
  const { isLoggedIn } = useAuthStore();
  const { getGroupChatInvites, groupChatInvites } = useGroupChatStore();
  const { notification } = useSocketStore();

  const notificationMessage = {
    friendRequest: (data: NotificationData) =>
      `${data.requester} 님이 친구 요청을 보냈습니다.`,
    messageNotification: (data: NotificationData) =>
      `${data.roomTitle}에서 새로운 메시지 추가`,
    groupChatInviteNotification: (data: NotificationData) =>
      `${data.roomTitle} 그룹 채팅에 초대했습니다.`,
  };

  console.log(groupChatInvites);

  useEffect(() => {
    getGroupChatInvites();
  }, []);

  return (
    <>
      {isLoggedIn && (
        <>
          <p>아이콘 들어갈 위치</p>
          <DirectChat />
          {groupChatInvites.map((groupChatInvite) => (
            <ul key={groupChatInvite._id}>
              <li>{groupChatInvite.roomTitle}</li>
              <button>수락</button>
              <button>거절</button>
            </ul>
          ))}
          {notification.map((notif, index) => (
            <div key={index}>
              <p>
                {notificationMessage[notif.type]?.(notif.data) ||
                  "알 수 없는 알림"}
              </p>
            </div>
          ))}
          <Friends />
        </>
      )}
    </>
  );
};

export default DirectChats;
