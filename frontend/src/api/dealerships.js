import client from "./client"

export const getDealerships = () =>
  client.get("/dealerships/").then((r) => r.data)

export const getDealershipById = (id) =>
  client.get(`/dealerships/${id}/`).then((r) => r.data)
