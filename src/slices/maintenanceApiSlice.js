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

    getRepairRequestSchedule: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/schedules",
        method: "GET",
      }),
      providesTags: ["repairRequestSchedule"],
    }),

    // get repir resquest
    getRepairRequest: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/repairs",
        method: "GET",
      }),
      providesTags: ["repair"],
    }),

    // get MAINTENANCE resquest
    getMaintenanceRequest: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/maintenance",
        method: "GET",
      }),
      providesTags: ["maintenance"],
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

    updateSchedule: builder.mutation({
      query: ({ scheduleID, updatedSchedule }) => ({
        url: `${MAINTENANCE_URL}/schedules/${scheduleID}`,
        method: "PUT",
        body: updatedSchedule,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Schedule"], // Optional: to refetch data after mutation
    }),

    getScheduleByRepairID: builder.query({
      query: (repairID) => `${MAINTENANCE_URL}/schedules/repair/${repairID}`,
    }),

    getRepairById: builder.query({
      query: (repairID) => `${MAINTENANCE_URL}/repairs/${repairID}`,
    }),

    // Fetch preventive maintenance by ID
    getMaintenanceById: builder.query({
      query: (id) => `${MAINTENANCE_URL}/maintenance/${id}`, // Using the /{id} endpoint
    }),

    getSchedulesByUserID: builder.query({
      query: (userID) => `${MAINTENANCE_URL}/schedules/user/${userID}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Schedule", id })),
              { type: "Schedule", id: "LIST" },
            ]
          : [{ type: "Schedule", id: "LIST" }],
    }),

    // Endpoint to fetch schedules by user ID
    getPreventiveSchedulesByUserID: builder.query({
      query: (userID) => `${MAINTENANCE_URL}/maintenance/user/${userID}`,
    }),

    // Fetch maintenance records by asset code
    getMaintenanceByAssetCode: builder.query({
      query: (assetCode) => `${MAINTENANCE_URL}/maintenance/asset/${assetCode}`, // Using the /asset/{assetCode} endpoint
    }),

    getSchedulesByTechnicianEmail: builder.query({
      query: (email) => `${MAINTENANCE_URL}/schedules/technician/${email}`,
      providesTags: ["Schedules"], // Optional: helpful for cache invalidation
    }),

    getMaintenanceByTechnicianEmail: builder.query({
      query: (email) => `${MAINTENANCE_URL}/maintenance/technician/${email}`,
      providesTags: ["Maintenance"],
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
        method: "POST",
        body: newMaintenance,
      }),
      invalidatesTags: ["Maintenance"],
    }),
    sendEmail: builder.mutation({
      query: (emailData) => ({
        url: MAINTENANCE_URL + "/maintenance/send-email", // This corresponds to the @PostMapping("/send-email") route
        method: "POST",
        body: emailData,
      }),
    }),

    // technician status update
    updateRepairById: builder.mutation({
      query: ({ repairID, updateFields }) => ({
        url: `${MAINTENANCE_URL}/repairs/update/${repairID}`,
        method: "PUT",
        body: updateFields,
      }),
      invalidatesTags: ["Repairs"],
    }),

    createRepairReport: builder.mutation({
      query: (formData) => ({
        url: `${MAINTENANCE_URL}/repair-reports`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["RepairReport"],
    }),

    getPreventiveMaintenanceReports: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/maintenance-reports", // matches your backend @GetMapping
        method: "GET",
      }),
      transformResponse: (response) => response,
      providesTags: ["PreventiveMaintenanceReports"], // Optional tag for cache invalidation
    }),

    getRepairReportByID: builder.query({
      query: (repairID) =>
        `${MAINTENANCE_URL}/repair-reports/repair/${repairID}`,
    }),

    createMaintenanceReport: builder.mutation({
      query: (formData) => ({
        url: `${MAINTENANCE_URL}/maintenance-reports`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["MaintenanceReport"],
    }),

    getMaintenanceReportByID: builder.query({
      query: (id) =>
        `${MAINTENANCE_URL}/maintenance-reports//by-maintenance-id/${id}`,
    }),
    getAllCombinedMaintenanceCost: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/cost", // matches your backend @GetMapping
        method: "GET",
      }),
      transformResponse: (response) => response,
    }),
    getAverageResponseTime: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/analytics", // matches your backend @GetMapping
        method: "GET",
      }),
      transformResponse: (response) => response,
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
  useUpdateScheduleMutation,
  useLazyGetScheduleByRepairIDQuery,
  useGetScheduleByRepairIDQuery,
  useGetSchedulesByUserIDQuery,
  useGetRepairByIdQuery,
  useGetPreventiveSchedulesByUserIDQuery,
  useGetMaintenanceByAssetCodeQuery,
  useGetMaintenanceByIdQuery,
  useGetSchedulesByTechnicianEmailQuery,
  useGetMaintenanceByTechnicianEmailQuery,
  useCreateMaintenanceMutation,
  useSendEmailMutation,
  useUpdateRepairByIdMutation,
  useCreateRepairReportMutation,
  useGetPreventiveMaintenanceReportsQuery,
  useGetRepairReportByIDQuery,
  useCreateMaintenanceReportMutation,
  useGetMaintenanceReportByIDQuery,
  useGetAllCombinedMaintenanceCostQuery,
  useGetAverageResponseTimeQuery
} = maintenanceApiSlice;
