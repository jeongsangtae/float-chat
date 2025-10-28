import useSocketStore from "../../store/socketStore";

import classes from "./Notification.module.css";

const Notification = () => {
  const { notification } = useSocketStore();

  return (
    <div className={classes["notification-container"]}>
      {notification.map((notif) => (
        <div key={notif.id} className={classes["notification-item"]}>
          {notif.avatarImageUrl ? (
            <img className={classes.avatar} src={notif.avatarImageUrl} />
          ) : (
            <div className={classes["notification-avatar"]}>
              <div
                className={classes.avatar}
                style={{ backgroundColor: notif.avatarColor }}
              >
                {notif.senderNickname.charAt(0)}
              </div>
            </div>
          )}

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
