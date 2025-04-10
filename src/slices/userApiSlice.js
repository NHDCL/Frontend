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


    // Add Academy
    postAcademy: builder.mutation({
      query: (formData) => ({
        url: USERS_URL + "/academies",
        method: "POST",
        body: formData,
      }),
    }),

    // Get Academy
    getAcademy: builder.query({
      query: () => ({
        url: USERS_URL + "/academies",
        method: "GET",
      }),
      providesTags: ["Academy"],
    }),

    // update academy
    updateAcademy: builder.mutation({
      query: ({ academyId, name, location, description, image }) => {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("location", location);
        formData.append("description", description);
        if (image) {
          formData.append("image", image); // image should be a File object
        }

        return {
          url: `${USERS_URL}/academies/${academyId}`,
          method: "PUT",
          body: formData,
        };
      },
    }),
    // updateAcademy: builder.mutation({
    //   query: ({ academyId, formData }) => ({
    //       url: `${USERS_URL}/academies/${academyId}`,
    //       method: "PUT",
    //       body: formData,
    //   }),
    // }),

    // Delete Academy
    deleteAcademy: builder.mutation({
      query: (id) => ({
        url: USERS_URL + `/academies/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  usePostAcademyMutation,
  useGetAcademyQuery,
  useDeleteAcademyMutation,
  useUpdateAcademyMutation,
  useResetPasswordMutation, // Added this
} = usersApiSlice;
