import client from "./client"

export const getCars = (params = {}) =>
  client.get("/inventory/", { params }).then((r) => r.data)

export const getCarById = (id) =>
  client.get(`/inventory/${id}/`).then((r) => r.data)

export const getFeaturedCars = () =>
  client.get("/inventory/featured/").then((r) => r.data)

export const searchCars = (query) =>
  client.get("/inventory/search/", { params: { q: query } }).then((r) => r.data)
