import { UserInfo } from "../../types";

const GroupChatUser = ({ nickname }: Pick<UserInfo, "nickname">) => {
  return (
    <>
      <p>{nickname}</p>
    </>
  );
};

export default GroupChatUser;
