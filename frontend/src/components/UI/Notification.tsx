// import { NotificationData } from "../../types";

import useSocketStore from "../../store/socketStore";

import classes from "./Notification.module.css";

const Notification = () => {
  const { notification } = useSocketStore();

  // const notificationMessage = {
  //   friendRequest: (data: NotificationData) => `친구 요청`,
  //   messageNotification: (data: NotificationData) =>
  //     `${data.roomTitle} 새로운 메시지`,
  //   groupChatInviteNotification: (data: NotificationData) =>
  //     `${data.roomTitle} 그룹 채팅 초대`,
  // };

  return (
    <div className={classes["notification-container"]}>
      {notification.map((notif) => (
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
        <div key={notif.id} className={classes["notification-item"]}>
          <div className={classes["notification-avatar"]}>
            <div
              className={classes.avatar}
              style={{ backgroundColor: notif.avatarColor }}
            >
              {notif.senderNickname.charAt(0)}
            </div>
          </div>
          <div className={classes["notification-content"]}>
            <div className={classes["notification-nickname"]}>
              {notif.senderNickname}{" "}
              {notif.type === "messageNotification" &&
                notif.roomTitle &&
                ` (${notif.roomTitle})`}
            </div>
            <div className={classes["notification-message"]}>
              {notif.type === "groupChatInviteNotification" && notif.roomTitle
                ? `${notif.roomTitle} ${notif.message}`
                : notif.message}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notification;
