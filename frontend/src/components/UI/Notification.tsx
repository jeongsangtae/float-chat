import { NotificationData } from "../../types";

import useSocketStore from "../../store/socketStore";

import classes from "./Notification.module.css";

const Notification = () => {
  const { notification } = useSocketStore();

  const notificationMessage = {
    friendRequest: (data: NotificationData) =>
      `${data.requester} 님이 친구 요청을 보냈습니다.`,
    messageNotification: (data: NotificationData) =>
      `${data.roomTitle}에서 새로운 메시지 추가`,
    groupChatInviteNotification: (data: NotificationData) =>
      `${data.roomTitle} 그룹 채팅에 초대했습니다.`,
  };

  return (
    <div className={classes["notification-container"]}>
      {notification.map((notif, index) => (
        // <div key={index} className={classes["notification-item"]}>
        //   {notif.type === "friendRequest" && (
        //     <div
        //       className={classes.avatar}
        //       style={{ backgroundColor: notif.avatarColor || "#ccc" }}
        //     >
        //       {notif.data.requester?.charAt(0)}
        //     </div>
        //   )}
        //   <p className={classes["notification-content"]}>
        //     {notificationMessage[notif.type]?.(notif.data) || "알 수 없는 알림"}
        //   </p>
        // </div>
        <div key={index} className={classes["notification-item"]}>
          <div className={classes["notification-avatar"]}>
            <div
              className={classes.avatar}
              style={{ backgroundColor: notif.avatarColor }}
            >
              {notif.data.requester?.charAt(0)}
            </div>
          </div>
          <div className={classes["notification-content"]}>
            <div className={classes["notification-nickname"]}>
              {notificationMessage[notif.type]?.(notif.data) ||
                "알 수 없는 알림"}
            </div>
            <div className={classes["notification-message"]}>
              {notificationMessage[notif.type]?.(notif.data) ||
                "알 수 없는 알림"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notification;
