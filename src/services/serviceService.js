import API from "./axios";

export const fetchAllServices = async () => {
  try {
    const response = await API.get("/api/services");
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
};

export const fetchServiceCategories = async () => {
  try {
    const response = await API.get("/api/services/categories");
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};