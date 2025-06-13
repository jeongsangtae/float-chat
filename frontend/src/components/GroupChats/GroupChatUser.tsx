import { UserInfo } from "../../types";

import classes from "./GroupChatUser.module.css";

const GroupChatUser = ({ nickname }: Pick<UserInfo, "nickname">) => {
  return (
    <div className={classes["group-chat-users"]}>
      <div className={classes.avatar}>
        {nickname.charAt(0)}
        {/* <div
            className={
              onlineChecked ? classes["online-dot"] : classes["offline-dot"]
            }
          /> */}
      </div>
      <p>{nickname}</p>
    </div>
  );
};

export default GroupChatUser;
