import { createSlice } from "@reduxjs/toolkit";

const userInfoFromStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

const userRoleFromStorage = localStorage.getItem("userRole")
  ? localStorage.getItem("userRole")
  : null;

const initialState = {
  userInfo: userInfoFromStorage,
  userRole: userRoleFromStorage,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      state.userRole = action.payload.userRole;

      localStorage.setItem("userInfo", JSON.stringify(action.payload.user));
      localStorage.setItem("userRole", action.payload.userRole);
    },
    logout: (state) => {
      state.userInfo = null;
      state.userRole = null;
    },
  },
});




export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
