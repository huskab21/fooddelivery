import axios from "axios";

export const server = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

server.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Axios алдаанаас backend-ийн message-ийг гаргаж авна
export const getErrorMessage = (err) =>
  err?.response?.data?.message ?? err?.message ?? "Something went wrong";

// ---- Food Category ----
export const fetchFoodCategories = async () => {
  const { data } = await server.get("/food-category/get");
  return data.foodCategories;
};

export const createFoodCategory = async (FoodCategoryName) => {
  const { data } = await server.post("/food-category/create", {
    FoodCategoryName,
  });
  return data.foodCategory;
};

export const deleteFoodCategory = async (id) => {
  const { data } = await server.delete(`/food-category/delete/${id}`);
  return data;
};

// ---- Food ----
export const fetchFoods = async (categoryId) => {
  const { data } = await server.get("/food/get", {
    params: categoryId ? { categoryId } : {},
  });
  return data.foods;
};

export const createFood = async (payload) => {
  const { data } = await server.post("/food/create", payload);
  return data.food;
};

export const updateFood = async (payload) => {
  const { data } = await server.put("/food/update", payload);
  return data.food;
};

// ---- Auth ----
export const loginUser = async (email, password) => {
  const { data } = await server.post("/auth/login", { email, password });
  return data;
};

export const signupUser = async (email, password) => {
  const { data } = await server.post("/auth/sign-up", { email, password });
  return data;
};

// ---- Order ----
export const createOrder = async (payload) => {
  const { data } = await server.post("/food-order", payload);
  return data;
};

// userId-г URL-аар биш token-оос авдаг болсон (backend: GET /food-order/my)
export const fetchMyOrders = async () => {
  const { data } = await server.get("/food-order/my");
  return data;
};

export const fetchAllOrders = async () => {
  const { data } = await server.get("/food-order");
  return data;
};

export const updateOrderStatus = async (orderId, status) => {
  const { data } = await server.patch(`/food-order/${orderId}/status`, {
    status,
  });
  return data;
};

export const bulkUpdateOrderStatus = async (orderIds, status) => {
  const { data } = await server.patch("/food-order/bulk-status", {
    orderIds,
    status,
  });
  return data;
};
