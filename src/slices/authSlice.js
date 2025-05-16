import { createSlice } from "@reduxjs/toolkit";

const userInfoFromStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

const userRoleFromStorage = localStorage.getItem("userRole") || null;

const tokenFromStorage = localStorage.getItem("userToken")
  ? localStorage.getItem("userToken")
  : null;

const initialState = {
  userInfo: userInfoFromStorage,
  userRole: userRoleFromStorage,
  userToken: tokenFromStorage,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload.user;
      state.userRole = action.payload.userRole;
      state.userToken = action.payload.token;
      localStorage.setItem("userInfo", JSON.stringify(action.payload.user));
      localStorage.setItem("userRole", action.payload.userRole);
      localStorage.setItem("userToken", action.payload.token);
    },
    logout: (state) => {
       state.userInfo = null;
      state.userRole = null;
      state.userToken = null;
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userToken");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
