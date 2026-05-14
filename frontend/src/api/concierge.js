import client from "./client"

export const sendConciergeMessage = ({ message, history = [] }) =>
  client.post("/concierge/chat/", { message, history }).then((r) => r.data)
