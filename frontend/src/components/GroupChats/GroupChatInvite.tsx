const GroupChatInvite = ({ nickname }) => {
  console.log(nickname);

  return (
    <>
      <ul>
        <li>{nickname}</li>
        <button>초대</button>
      </ul>
    </>
  );
};

export default GroupChatInvite;
