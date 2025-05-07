import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import useAuthStore from "./store/authStore";

import router from "./router";
import authRouter from "./authRouter";

import "./index.css";

const Root = () => {
  const { isLoggedIn } = useAuthStore();

  return <RouterProvider router={isLoggedIn ? router : authRouter} />;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* <RouterProvider router={router} /> */}
    <Root />
  </React.StrictMode>
);
