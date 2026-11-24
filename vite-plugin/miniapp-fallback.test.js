import { expect, test } from "bun:test";
import { miniAppFallbackPath } from "./index.js";

test("miniapp route fallback rewrites routes but leaves assets alone", () => {
  expect(miniAppFallbackPath("/miniapp/owner/orders?theme=dark")).toBe(
    "/miniapp/index.html?theme=dark",
  );
  expect(miniAppFallbackPath("/app/abc/miniapp/product/1")).toBe(
    "/app/abc/miniapp/index.html",
  );
  expect(miniAppFallbackPath("/miniapp/assets/app.js")).toBeNull();
  expect(miniAppFallbackPath("/about")).toBeNull();
});
