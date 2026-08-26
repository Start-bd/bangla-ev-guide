/**
 * Reports a CI/build failure to Sentry so build breakages (e.g. the SEO JSON-LD
 * parse error) show up alongside runtime errors. No-ops without SENTRY_DSN.
 */
import { captureServerError } from "../src/lib/monitoring.server";

const message = process.env["FAILURE_CONTEXT"] ?? "CI job failed";

await captureServerError(new Error(message), {
  source: "github-actions",
  workflow: process.env["GITHUB_WORKFLOW"],
  job: process.env["GITHUB_JOB"],
  ref: process.env["GITHUB_REF"],
  sha: process.env["GITHUB_SHA"],
  runUrl: `${process.env["GITHUB_SERVER_URL"]}/${process.env["GITHUB_REPOSITORY"]}/actions/runs/${process.env["GITHUB_RUN_ID"]}`,
});

console.log("Reported CI failure to monitoring.");
