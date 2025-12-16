import "dotenv/config";
import { createApp } from "../../src/app.js";

const PORT = Number(process.env.PORT) || 4000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`[backend] Server started on http://localhost:${PORT}`);
});
