import optimizeImage from "$lib/server/optimizeImage.js";
import { sequence } from "@sveltejs/kit/hooks";

export const handle = sequence(
  optimizeImage({
    allowedOrigins: ["https://image.civitai.com"],
  })
);
