import "dotenv/config";
import connectDB from "./db/index.js";
import app from "./app.js";

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("Error while running the server ", error)
    })
    app.listen(process.env.PORT || 8000);
    console.log(`Server started on port ${process.env.PORT}`);
  })
  .catch((error) => {
    console.log("Mongo DB connection failed", error);
  });
