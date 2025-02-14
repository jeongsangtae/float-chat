import useFriendStore from "../../store/friendStore";

const Friend = ({ id, nickname }) => {
  const { deleteFriend } = useFriendStore();

  const deleteFriendHandler = async () => {
    await deleteFriend(id);
  };
  return (
    <>
      <ul>
        <li>
          {nickname}
          <button onClick={deleteFriendHandler}>삭제</button>
        </li>
      </ul>
    </>
  );
};

export default Friend;
