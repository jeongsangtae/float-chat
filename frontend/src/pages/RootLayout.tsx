import { Outlet } from "react-router-dom";
// import MainHeader from "../components/Layout/MainHeader";
import SideBar from "../components/Layout/SideBar";

const RootLayout = () => {
  return (
    <>
      <Outlet />
      <SideBar />
      {/* <MainHeader /> */}
    </>
  );
};

export default RootLayout;
