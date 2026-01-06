export const isProd = process.env.NODE_ENV === "production";

export const root = isProd ? "https://salkaro.com": "http:localhost:3000"

export const title = "Salkaro"
export const shortenedTitle = "SK"