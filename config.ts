export const config = {
  socketUrl:
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://lingomania.onrender.com"
      : "http://localhost:3001"),
};