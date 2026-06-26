import cors from "cors";

// Memastikan hanya frontend tertentu yang bisa mengakses backend
// memastikan juga bahwa frontend dan backend berjalan di domain yang sama atau diizinkan oleh CORS
const corsOptions: cors.CorsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
};

export default cors(corsOptions);
