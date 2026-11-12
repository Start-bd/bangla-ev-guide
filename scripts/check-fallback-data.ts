#!/usr/bin/env bun
import { isLocalFallbackRecord } from "../src/lib/data-source";
import { LOCAL_EV_MODELS, LOCAL_POSTS } from "../src/lib/local-data";

if (LOCAL_EV_MODELS.some((model) => model.last_price_update !== null)) {
  throw new Error("Fallback model prices must not be stamped with a current update date.");
}
if (!LOCAL_EV_MODELS.every((model) => isLocalFallbackRecord(model.id))) {
  throw new Error("Every fallback model must be identifiable as local fallback data.");
}
if (!LOCAL_POSTS.every((post) => isLocalFallbackRecord(post.id))) {
  throw new Error("Every fallback post must be identifiable as local fallback data.");
}
if (isLocalFallbackRecord("7dfead22-8e2f-4adb-a2b4-819762c2a26b")) {
  throw new Error("Database records must not be identified as local fallback data.");
}

console.log("Fallback rows remain identifiable and never claim a current price-update date.");