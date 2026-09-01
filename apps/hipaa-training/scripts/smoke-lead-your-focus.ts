/**
 * Unit smoke: Clinical lead Your Focus merge/cap (no network).
 * Run: npx tsx scripts/smoke-lead-your-focus.ts
 */
import assert from "node:assert/strict";
import {
  buildLeadFocusItems,
  capLeadFocusItems,
  isClinicalOpsLead,
  YOUR_FOCUS_CAP,
} from "../src/lib/lead-your-focus";

assert.equal(isClinicalOpsLead(["Clinical Operations"]), true);
assert.equal(isClinicalOpsLead(["HR"]), false);
assert.equal(YOUR_FOCUS_CAP, 5);

const items = buildLeadFocusItems({
  gaps: [
    {
      id: "gap-b",
      department: "Clinical Operations",
      departmentSlug: "clinical_operations",
      taskLabel: "Newer gap",
      createdAt: "2026-08-21T12:00:00.000Z",
    },
    {
      id: "gap-a",
      department: "Clinical Operations",
      departmentSlug: "clinical_operations",
      taskLabel: "Older gap",
      createdAt: "2026-08-19T01:00:00.000Z",
    },
    {
      id: "gap-hr",
      department: "HR",
      departmentSlug: "hr",
      taskLabel: "Should not appear",
      createdAt: "2026-08-01T00:00:00.000Z",
    },
  ],
  sops: [
    {
      id: "sop-1",
      department: "Clinical Operations",
      title: "Oldest SOP",
      status: "pending_review",
      submittedAt: "2026-08-04T05:00:00.000Z",
      createdAt: "2026-08-04T05:00:00.000Z",
    },
    {
      id: "sop-2",
      department: "Clinical Operations",
      title: "Draft ignore",
      status: "draft",
      createdAt: "2026-08-01T00:00:00.000Z",
    },
    {
      id: "sop-3",
      department: "Clinical Operations",
      title: "Mid SOP",
      status: "pending_review",
      submittedAt: "2026-08-06T01:00:00.000Z",
      createdAt: "2026-08-06T01:00:00.000Z",
    },
  ],
});

assert.equal(items.length, 4);
assert.equal(items[0].title, "Oldest SOP");
assert.equal(items[1].title, "Mid SOP");
assert.equal(items[2].title, "Older gap");
assert.equal(items[3].title, "Newer gap");
assert.ok(items[0].href.includes("/memory/knowledge/sops?edit="));
assert.ok(items[2].href.includes("/lead/your-focus/gap/"));

const six = buildLeadFocusItems({
  gaps: Array.from({ length: 4 }, (_, i) => ({
    id: `g${i}`,
    department: "Clinical Operations",
    departmentSlug: "clinical_operations",
    taskLabel: `G${i}`,
    createdAt: `2026-08-${10 + i}T00:00:00.000Z`,
  })),
  sops: Array.from({ length: 3 }, (_, i) => ({
    id: `s${i}`,
    department: "Clinical Operations",
    title: `S${i}`,
    status: "pending_review",
    submittedAt: `2026-08-0${i + 1}T00:00:00.000Z`,
    createdAt: `2026-08-0${i + 1}T00:00:00.000Z`,
  })),
});
assert.equal(six.length, 7);
const capped = capLeadFocusItems(six);
assert.equal(capped.preview.length, 5);
assert.equal(capped.moreCount, 2);

console.log("smoke-lead-your-focus: OK");
