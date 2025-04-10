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

    // Post Academy
    postAcademy: builder.mutation({
      query: (academyData) => ({
        url: USERS_URL + "/academies",
        method: "POST",
        body: academyData,
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

    // Get department
    getDepartment: builder.query({
      query: () => ({
        url: USERS_URL + "/departments",
        method: "GET",
      }),
      providesTags: ["Departments"],
    }),

    // Post Department
    createDepartment: builder.mutation({
      query: (departmentData) => ({
        url: USERS_URL + "/departments",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(departmentData),
      }),
    }),


    updateAcademy: builder.mutation({
      query: ({ academyId, name, location, description, image }) => {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("location", location);
        formData.append("description", description);
        if (image) {
          formData.append("image", image);
        }

        return {
          url: `${USERS_URL}/academies/${academyId}`,
          method: "PUT",
          body: formData,
        };
      },
    }),

    // updateAcademy: builder.mutation({
    //   query: (updatedData) => {
    //     console.log('Updating academy with data:', updatedData); // optional: helpful for debugging
    //     return {
    //       // url: ${USERS_URL}/academies/${updatedData.academyId}, // use academyId here!
    //       url: USERS_URL + /academies/${updatedData.academyId},

    //       method: 'PUT',
    //       body: updatedData,
    //     };
    //   },
    // }),

    // Delete Academy
    deleteAcademy: builder.mutation({
      query: (id) => ({
        url: USERS_URL + `/academies/${id}`,
        method: "DELETE",
      }),
    }),

    getUsers: builder.query({
      query: () => ({
        url: USERS_URL + "/users",
        method: "GET",
      }),
      providesTags: ["users"],
    }),

    createUser: builder.mutation({
      query: (userData) => {
        const formData = new FormData();
        formData.append("email", userData.email);
        formData.append("password", userData.password);
        formData.append("name", userData.name);
        formData.append("academyId", userData.academyId); // Ensure academyId is appended
        formData.append("departmentId", userData.departmentId); // departmentId should be appended if available
        formData.append("roleId", userData.roleId);

        return {
          url: USERS_URL + '/users',
          method: "POST",
          body: formData,
        };
      },
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
  useCreateUserMutation,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useGetUsersQuery,
} = usersApiSlice;