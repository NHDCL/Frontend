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

    forgotPassword: builder.mutation({
      query: (email) => ({
        url: USERS_URL + "/users/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),

    verifyOtp: builder.mutation({
      query: ({ email, otp }) => ({
        url: USERS_URL + "/users/verify-otp",
        method: "POST",
        body: { email, otp },
      }),
    }),

    resendOtp: builder.mutation({
      query: (email) => ({
        url: USERS_URL + "/users/resend-otp",
        method: "POST",
        body: { email },
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ email, otp, newPassword }) => ({
        url: USERS_URL + "/users/reset-password",
        method: "POST",
        body: { email, otp, newPassword },
      }),
    }),

    getUserByEmail: builder.query({
      query: (email) => ({
        url: `${USERS_URL}/users/email`,
        method: "GET",
        params: { email },
      }),
    }),

    updateUserImage: builder.mutation({
      query: ({ email, image }) => {
        const formData = new FormData();
        formData.append("email", email);
        if (image) {
          formData.append("image", image);
        }

        return {
          url: USERS_URL + "/users/image",
          method: "PUT",
          body: formData,
        };
      },
    }),

    changePassword: builder.mutation({
      query: ({ email, oldPassword, newPassword }) => ({
        url: USERS_URL + "/users/change-password",
        method: "PUT",
        body: { email, oldPassword, newPassword },
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: USERS_URL + "/auth/logout",
        method: "POST",
      }),
    }),

    // New Endpoints for Academies and Departments
    getAllAcademies: builder.query({
      query: () => ({
        url: USERS_URL + "/academies", // Corrected path here
        method: "GET",
      }),
    }),

    getAllDepartments: builder.query({
      query: () => ({
        url: USERS_URL + "/departments", // Corrected path here
        method: "GET",
      }),
    }),

    getAcademyById: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/academies/${id}`,
        method: "GET",
      }),
    }),

    getDepartmentById: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/departments/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useResetPasswordMutation,
  useGetUserByEmailQuery,
  useUpdateUserImageMutation,
  useChangePasswordMutation,
  useLogoutMutation,
  useGetAllAcademiesQuery,
  useGetAllDepartmentsQuery,
  useGetAcademyByIdQuery,
  useGetDepartmentByIdQuery,
} = usersApiSlice;
