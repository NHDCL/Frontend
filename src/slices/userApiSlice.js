import { USERS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: USERS_URL + "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // Forgot Password endpoint
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: USERS_URL + "/users/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),

    // Verify OTP endpoint
    verifyOtp: builder.mutation({
      query: ({ email, otp }) => ({
        url: USERS_URL + "/users/verify-otp",
        method: "POST",
        body: { email, otp },
      }),
    }),

    // Resend OTP endpoint
    resendOtp: builder.mutation({
      query: (email) => ({
        url: USERS_URL + "/users/resend-otp",
        method: "POST",
        body: { email },
      }),
    }),

    // // Change Password endpoint
    // changePassword: builder.mutation({
    //   query: ({ email, oldPassword, newPassword }) => ({
    //     url: USERS_URL + "/users/change-password",
    //     method: "PUT",
    //     body: { email, oldPassword, newPassword },
    //   }),
    // }),

    // Reset Password (after OTP verification)
    resetPassword: builder.mutation({
      query: ({ email, otp, newPassword }) => ({
        url: USERS_URL + "/users/reset-password",
        method: "POST",
        body: { email, otp, newPassword },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useResetPasswordMutation, // Added this
} = usersApiSlice;
