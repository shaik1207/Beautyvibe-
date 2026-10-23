import API from "./axios";

export const createAppointmentBooking = async (bookingData) => {
  try {
    const response = await API.post("/api/appointments", bookingData);
    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error.response?.data || error;
  }
};

export const fetchUserAppointments = async () => {
  try {
    const response = await API.get("/api/appointments/my-bookings");
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return [];
  }
};