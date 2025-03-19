import { useEffect } from "react";

import { NotificationData } from "../../types";

import DirectChat from "./DirectChat";
import Friends from "../Friends/Friends";
import useAuthStore from "../../store/authStore";
import useSocketStore from "../../store/socketStore";
import useGroupChatStore from "../../store/groupChatStore";
import GroupChatInviteList from "../GroupChats/GroupChatInviteList";

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

  useEffect(() => {
    if (isLoggedIn) {
      getGroupChatInvites();
    }
  }, [isLoggedIn]);

  return (
    <>
      {isLoggedIn && (
        <>
          {/* <p>아이콘 들어갈 위치</p> */}
          <DirectChat />
          {groupChatInvites.map((groupChatInvite) => (
            <GroupChatInviteList
              key={groupChatInvite._id}
              groupChatId={groupChatInvite.roomId}
              groupChatInviteId={groupChatInvite._id}
              requester={groupChatInvite.requester}
              requesterNickname={groupChatInvite.requesterNickname}
              roomTitle={groupChatInvite.roomTitle}
              status={groupChatInvite.status}
            />
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
