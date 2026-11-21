import app from "@/app";
import { ENV } from "@/config/env";

app.listen(ENV.PORT, () => {
  console.log(`${ENV.APP_NAME} running at ${ENV.BACKEND_URL} (${ENV.NODE_ENV})`);
});