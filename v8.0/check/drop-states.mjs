/* Fixed-clock tests for the v0.7 drop state machine and G20 price parity.
   Checkout is not wired: shown price is asserted equal to drops.json only. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const code = fs.readFileSync(path.join(root, "v8.0/assets/drop-time.js"), "utf8");
const window = globalThis;
eval(code);
const TT = globalThis.TT;

const failures = [];
function check(name, ok, detail) {
  const line = (ok ? "PASS" : "FAIL") + " " + name + (detail ? " — " + detail : "");
  console.log(line);
  if (!ok) failures.push(line);
}

const priced = {
  id: "priced",
  artist_id: "placeholder",
  design_ids: ["placeholder"],
  starts_at: "2026-12-12T00:00:00-06:00",
  ends_at: "2026-12-12T23:59:59-06:00",
  last_chance_starts_at: "2026-12-13T00:00:00-06:00",
  last_chance_ends_at: "2026-12-13T23:59:59-06:00",
  live_price: 48,
  last_chance_price: 36,
  vault_price: 42,
  status_override: null,
  theme: null,
};

function at(iso) {
  return new Date(iso);
}

function expectState(name, iso, state, label, price) {
  const drop = Object.assign({}, priced);
  if (state === "sold_out" || state === "pulled") drop.status_override = state;
  const view = TT.dropView(drop, at(iso));
  const priceOk = view.price === price && view.priceText === (price == null ? "" : "$" + price.toFixed(2));
  const countdownOk = (state === "live" || state === "last_chance") ? view.countdown.length > 0 : view.countdown === "";
  check(
    name,
    view.state === state && view.label === label && priceOk && countdownOk,
    `state=${view.state} label=${JSON.stringify(view.label)} price=${view.price} text=${JSON.stringify(view.priceText)} countdown=${JSON.stringify(view.countdown)}`
  );
  if (price == null) {
    check("G20 " + name + " no invented price", view.priceText === "" && view.price == null, "shown empty");
  } else {
    check("G20 " + name + " shown == drops.json", view.price === price, `shown ${view.price} drops.json ${price}`);
  }
}

expectState("upcoming", "2026-12-11T23:59:59-06:00", "upcoming", "Starts Sat, Dec 12, 12:00 AM CT", 48);
expectState("live", "2026-12-12T15:00:00-06:00", "live", "Ends tonight 11:59 PM CT", 48);
expectState("live-start", "2026-12-12T00:00:00-06:00", "live", "Ends tonight 11:59 PM CT", 48);
expectState("live-end", "2026-12-12T23:59:59-06:00", "live", "Ends tonight 11:59 PM CT", 48);
expectState("after-live", "2026-12-13T00:00:00-06:00", "vault", "In the Vault", 42);
expectState("former-last-chance", "2026-12-13T12:00:00-06:00", "vault", "In the Vault", 42);
expectState("former-last-chance-end", "2026-12-13T23:59:59-06:00", "vault", "In the Vault", 42);
expectState("vault", "2026-12-14T00:00:00-06:00", "vault", "In the Vault", 42);
expectState("sold-out", "2026-12-12T15:00:00-06:00", "sold_out", "Sold out", null);
expectState("pulled", "2026-12-12T15:00:00-06:00", "pulled", "Unavailable", null);

const override = Object.assign({}, priced, { status_override: "sold_out" });
const overridden = TT.dropView(override, at("2026-12-12T15:00:00-06:00"));
check("status_override wins over the clock", overridden.state === "sold_out" && overridden.label === "Sold out" && overridden.countdown === "", overridden.label);

const nullDrop = Object.assign({}, priced, { live_price: null, vault_price: null });
for (const [name, iso, field] of [
  ["upcoming", "2026-12-11T12:00:00-06:00", "live_price"],
  ["live", "2026-12-12T12:00:00-06:00", "live_price"],
  ["after-live", "2026-12-13T12:00:00-06:00", "vault_price"],
  ["vault", "2026-12-14T12:00:00-06:00", "vault_price"],
]) {
  const view = TT.dropView(nullDrop, at(iso));
  check("null " + name + " shows no price", view.price == null && view.priceText === "", `drops.json ${field}=null shown=${JSON.stringify(view.priceText)}`);
}

const file = JSON.parse(fs.readFileSync(path.join(root, "v8.0/data/drops.json"), "utf8")).drops[0];
const onReviewDay = TT.dropView(file, at("2026-10-24T15:00:00-05:00"));
const onRealClock = TT.dropView(file, new Date());
check(
  "placeholder is not live today",
  onReviewDay.state === "upcoming" &&
    onReviewDay.label === "Starts Sat, Dec 12, 12:00 AM CT" &&
    !/tonight/i.test(onReviewDay.label) &&
    onReviewDay.price == null &&
    onRealClock.state !== "live" &&
    onRealClock.state !== "last_chance" &&
    !/tonight/i.test(onRealClock.label),
  `review=${onReviewDay.state} ${onReviewDay.label} now=${onRealClock.state} ${onRealClock.label}`
);

check("DST 2026-11-01 refused", TT.isDstChangeDay(2026, 11, 1) === true, "");
check("DST 2027-03-14 refused", TT.isDstChangeDay(2027, 3, 14) === true, "");
check("DST 2027-11-07 refused", TT.isDstChangeDay(2027, 11, 7) === true, "");
check("2026-12-12 allowed", TT.isDstChangeDay(2026, 12, 12) === false, "");
const dstDrop = Object.assign({}, priced, {
  starts_at: "2026-11-01T00:00:00-05:00",
  ends_at: "2026-11-01T23:59:59-06:00",
});
check("DST drop has no label", TT.dropView(dstDrop, at("2026-11-01T12:00:00-06:00")).label === "", "");

const seen = [];
let now = at("2026-12-12T23:59:59-06:00");
const stop = TT.watchDrop(priced, (view) => seen.push(view.state + "|" + view.price), () => now, 20);
await new Promise((resolve) => setTimeout(resolve, 40));
now = at("2026-12-13T00:00:00-06:00");
await new Promise((resolve) => setTimeout(resolve, 50));
stop();
check(
  "morphs at zero without reload",
  seen.includes("live|48") && seen.includes("vault|42") && !seen.some((item) => item.startsWith("last_chance")),
  seen.join(" -> ")
);

const offLabels = [
  "2026-12-11T23:59:59-06:00",
  "2026-12-12T15:00:00-06:00",
  "2026-12-13T00:00:00-06:00",
  "2026-12-13T12:00:00-06:00",
  "2026-12-14T00:00:00-06:00",
].map((iso) => TT.dropView(priced, at(iso)));
const overrideOff = TT.dropView(Object.assign({}, priced, { status_override: "last_chance" }), at("2026-12-12T15:00:00-06:00"));
offLabels.push(overrideOff);
check(
  "flag off never renders Last chance",
  TT.features.last_chance === false && offLabels.every((view) => !/last chance/i.test(JSON.stringify(view))),
  offLabels.map((view) => view.state + ":" + view.label).join(" | ")
);

TT.features = { last_chance: true };
const flagged = TT.dropView(priced, at("2026-12-13T12:00:00-06:00"));
check("flag on keeps the future state in code", flagged.state === "last_chance" && flagged.price === 36, flagged.state);
TT.features = { last_chance: false };

console.log("checkout-match: PENDING — Shopify checkout is not wired; G20 asserts the shown price equals drops.json for each state.");
if (failures.length) {
  console.error("DROP STATES: FAIL");
  process.exit(1);
}
console.log("DROP STATES: PASS");
