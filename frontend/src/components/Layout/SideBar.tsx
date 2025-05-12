import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BsFillChatSquareFill } from "react-icons/bs";
import { LuLogOut } from "react-icons/lu";

import useAuthStore from "../../store/authStore";
import useModalStore from "../../store/modalStore";
import useSocketStore from "../../store/socketStore";

import GroupChats from "../GroupChats/GroupChats";
import GroupChatForm from "../GroupChats/GroupChatForm";

import { IoMdAddCircle } from "react-icons/io";

import classes from "./SideBar.module.css";

interface SideBarProps {
  onLeaveGroupChat: () => void;
}

const SideBar = ({ onLeaveGroupChat }: SideBarProps) => {
  const { isLoggedIn, userInfo, renewToken, refreshTokenExp, logout } =
    useAuthStore();
  const { activeModal, toggleModal } = useModalStore();
  const { disconnect } = useSocketStore();

  const navigate = useNavigate();

  // const modals: {
  //   type: ModalType;
  //   label: ReactNode;
  //   component: React.ComponentType<ModalProps>;
  //   className?: string;
  // }[] = [
  //   {
  //     type: "login",
  //     label: "로그인",
  //     component: Login,
  //     className: classes["auth-button"],
  //   },
  //   {
  //     type: "signup",
  //     label: "회원가입",
  //     component: Signup,
  //     className: classes["auth-button"],
  //   },
  //   {
  //     type: "groupChatForm",
  //     label: <IoMdAddCircle />,
  //     component: GroupChatForm,
  //     className: classes["group-chat-form-button"],
  //   },
  // ];

  // const filteredModals = modals.filter(({ type }) => {
  //   if (isLoggedIn) {
  //     // 로그인 상태에서는 "login"과 "signup" 모달을 제외
  //     return type !== "login" && type !== "signup";
  //   }

  //   // 비로그인 상태에서는 "createGroupChat" 모달을 제외
  //   return type !== "groupChatForm";
  // });

  // 앱이 처음 로드될 때 로그인 상태 확인
  useEffect(() => {
    const renewTokens = async () => {
      if (isLoggedIn) {
        await refreshTokenExp();
        await renewToken();
      }
    };

    renewTokens();
  }, [isLoggedIn]);

  const logoutHandler = async (): Promise<void> => {
    await logout();
    disconnect();
    navigate("/login");
    // navigate("/me");
  };

  return (
    <div className={classes.sidebar}>
      <div className={classes["sidebar-top"]}>
        {isLoggedIn && (
          <>
            <button
              className={classes["home-button"]}
              onClick={onLeaveGroupChat}
            >
              <BsFillChatSquareFill className={classes["chat-icon"]} />
              <div className={`${classes.eye} ${classes["left-eye"]}`}></div>
              <div className={`${classes.eye} ${classes["right-eye"]}`}></div>
            </button>
            <GroupChats />
          </>
        )}

        {/* {filteredModals.map(
          ({ type, label, component: Component, className }) => (
            <div key={type}>
              <button className={className} onClick={() => toggleModal(type)}>
                {label}
              </button>
              {activeModal === type && (
                <Component onToggle={() => toggleModal(type)} />
              )}
            </div>
          )
        )} */}

        {isLoggedIn && (
          <div>
            <button
              className={classes["group-chat-form-button"]}
              onClick={() => toggleModal("groupChatForm")}
            >
              <IoMdAddCircle />
            </button>
            {activeModal === "groupChatForm" && (
              <GroupChatForm onToggle={() => toggleModal("groupChatForm")} />
            )}
          </div>
        )}
      </div>

      {isLoggedIn && (
        <div className={classes["user-info"]}>
          <p>{userInfo?.nickname}</p>
          <button onClick={logoutHandler}>
            로그아웃 <LuLogOut />
          </button>
        </div>
      )}
    </div>
  );
};

export default SideBar;
