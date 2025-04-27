import { MAINTENANCE_URL } from "../constants";
import { apiSlice } from "./apiSlice";
export const maintenanceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    postRepairRequest: builder.mutation({
      query: (requestData) => ({
        url: MAINTENANCE_URL + "/repairs", // API endpoint for posting assets
        method: "POST",
        body: requestData, // Send the new asset data as the request body
      }),
    }),

    postRepairSchedule: builder.mutation({
      query: (scheduleData) => ({
        url: MAINTENANCE_URL + "/schedules",
        method: "POST",
        body: scheduleData,
        headers: {
          "Content-Type": "application/json", // make sure backend expects JSON
        },
      }),
    }),
    updateRepairSchedule: builder.mutation({
      query: ({ scheduleId, updatedData }) => ({
        url: `${MAINTENANCE_URL}/schedules/${scheduleId}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["RepairSchedule"], // adjust tag if needed
    }),


    assignRepair: builder.mutation({
      query: ({ repairId, email }) => ({
        url: `${MAINTENANCE_URL}/repairs/schedule/${repairId}`,
        method: "PUT",
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
        responseHandler: (response) => response.text(),
        // },
      }),
      invalidatesTags: ["MaintenanceRequest"],

    }),

    getSchedulesByRepairID: builder.query({
      query: (repairID) => `${MAINTENANCE_URL}/schedules/repair/${repairID}`,
    }),
    // get repair schedule
    // getRepairRequestSchedule: builder.query({
    //   query: () => ({
    //     url: MAINTENANCE_URL + "/schedules",
    //     method: 'GET',
    //   }),
    //   providesTags: ["repairRequestSchedule"]
    // }),

    getRepairRequestSchedule: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/schedules",
        method: 'GET',
      }),
      providesTags: ["repairRequestSchedule"]
    }),


    // get repir resquest
    getRepairRequest: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/repairs",
        method: 'GET',
      }),
      providesTags: ["repair"]
    }),

    // get MAINTENANCE resquest
    getMaintenanceRequest: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/maintenance",
        method: 'GET',
      }),
      providesTags: ["maintenance"]
    }),

    // GET All Repair Reports
    getRepairReports: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/repair-reports",
        method: "GET",
      }),
      transformResponse: (response) => response, // Optional, if no nesting like { data: [...] }
      providesTags: ["RepairReports"],
    }),

    // GET All maintenance Reports
    getMaintenanceReports: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/maintenance-reports",
        method: "GET",
      }),
      transformResponse: (response) => response, // Optional, if no nesting like { data: [...] }
      providesTags: ["maintenanceReports"],
    }),

    acceptOrRejectRepairRequest: builder.mutation({
      query: ({ repairId, accept }) => ({
        url: `${MAINTENANCE_URL}/repairs/${repairId}/accept`,
        method: "PUT",
        body: JSON.stringify({ accept }),
        headers: {
          "Content-Type": "application/json",
        },
        responseHandler: (response) => response.text(), // 👈 Tell it to handle text
      }),
      invalidatesTags: ["RepairRequest"],
    }),

    updatePreventiveMaintenance: builder.mutation({
      query: ({ id, maintenance }) => ({
        url: `${MAINTENANCE_URL}/maintenance/${id}`,
        method: "PUT",
        body: maintenance,
      }),
      invalidatesTags: ["maintenance"], // optional: useful for refetch
    }),
    createMaintenance: builder.mutation({
      query: (newMaintenance) => ({
        url: MAINTENANCE_URL + "/maintenance", // POST to /api/maintenance
        method: 'POST',
        body: newMaintenance,
      }),
      invalidatesTags: ['Maintenance'],
    }),
    sendEmail: builder.mutation({
      query: (emailData) => ({
        url:  MAINTENANCE_URL + "/maintenance/send-email",  // This corresponds to the @PostMapping("/send-email") route
        method: 'POST',
        body: emailData,
      }),
    }),

  }),
});

export const {
  usePostRepairRequestMutation,
  usePostRepairScheduleMutation,
  useUpdateRepairScheduleMutation,
  useAssignRepairMutation,
  useGetSchedulesByRepairIDQuery,
  useGetRepairRequestScheduleQuery,
  useGetRepairRequestQuery,
  useGetMaintenanceRequestQuery,
  useAcceptOrRejectRepairRequestMutation,
  useUpdatePreventiveMaintenanceMutation,
  useGetRepairReportsQuery,
  useGetMaintenanceReportsQuery,
  useCreateMaintenanceMutation,
  useSendEmailMutation
} = maintenanceApiSlice;
