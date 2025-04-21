import { UserInfo } from "../../types";

import classes from "./GroupChatUser.module.css";

const GroupChatUser = ({ nickname }: Pick<UserInfo, "nickname">) => {
  return (
    <div className={classes["group-chat-users"]}>
      <p>{nickname}</p>
    </div>
  );
};

export default GroupChatUser;
