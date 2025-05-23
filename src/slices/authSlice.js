import { createSlice } from "@reduxjs/toolkit";

const userInfoFromSession = sessionStorage.getItem("userInfo")
  ? JSON.parse(sessionStorage.getItem("userInfo"))
  : null;

const userRoleFromSession = sessionStorage.getItem("userRole") || null;

const tokenFromSession = sessionStorage.getItem("userToken")
  ? sessionStorage.getItem("userToken")
  : null;

const initialState = {
  userInfo: userInfoFromSession,
  userRole: userRoleFromSession,
  userToken: tokenFromSession,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload.user;
      state.userRole = action.payload.userRole;
      state.userToken = action.payload.token;
      sessionStorage.setItem("userInfo", JSON.stringify(action.payload.user));
      sessionStorage.setItem("userRole", action.payload.userRole);
      sessionStorage.setItem("userToken", action.payload.token);
    },
    logout: (state) => {
      state.userInfo = null;
      state.userRole = null;
      state.userToken = null;
      sessionStorage.removeItem("userInfo");
      sessionStorage.removeItem("userRole");
      sessionStorage.removeItem("userToken");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
