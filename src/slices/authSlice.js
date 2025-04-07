import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  userRole: localStorage.getItem("userRole")
    ? localStorage.getItem("userRole")
    : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload.user;
      state.userRole = action.payload.userRole;

      localStorage.setItem("userInfo", JSON.stringify(action.payload.user));
      localStorage.setItem("userRole", action.payload.userRole);
    },
    logout: (state) => {
      state.userInfo = null;
      state.userRole = null;

      localStorage.removeItem("userInfo");
      localStorage.removeItem("userRole");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
