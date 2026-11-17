function effects(rows) {
  const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const naive = (slice) =>
    mean(slice.filter((r) => r.x === 1).map((r) => r.y)) -
    mean(slice.filter((r) => r.x === 0).map((r) => r.y));
  let weighted = 0;
  for (const z of [0, 1]) {
    const slice = rows.filter((r) => r.z === z);
    weighted += naive(slice) * slice.length;
  }
  return { naive: naive(rows), stratified: weighted / rows.length };
}

function colliderRows() {
  // Same process as the practice probes: X and Y are unrelated overall,
  // and both push Z, so a gap shows up only inside the levels of Z.
  for (let attempt = 0; attempt < 400; attempt++) {
    const rows = [];
    for (let i = 0; i < 240; i++) {
      const x = Math.random() < 0.5 ? 1 : 0;
      const u1 = Math.max(Math.random(), 1e-12);
      const yDev = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * Math.random());
      const noise =
        Math.sqrt(-2 * Math.log(Math.max(Math.random(), 1e-12))) *
        Math.cos(2 * Math.PI * Math.random());
      const z = 1.5 * (x - 0.5) + 1.5 * yDev + 0.6 * noise > 0 ? 1 : 0;
      rows.push({ x, z, y: Math.round((30 + yDev) * 1000) / 1000 });
    }
    const { naive, stratified } = effects(rows);
    const cellsOk = [0, 1].every((z) =>
      [0, 1].every((x) => rows.filter((r) => r.z === z && r.x === x).length >= 15)
    );
    if (cellsOk && Math.abs(naive) <= 0.15 && Math.abs(stratified) >= 0.6) return rows;
  }
  throw new Error("could not draw a decisive collider");
}

const probes = {
  fork: {
    domainFacts: { zTiming: "before-x", zInfluencesX: true },
    xLabel: "surgeon",
    yLabel: "symptom score",
    zLabel: "severity",
    rows: [
      ...Array.from({ length: 30 }, () => ({ x: 1, z: 1, y: 10 })),
      ...Array.from({ length: 8 }, () => ({ x: 0, z: 1, y: 10 })),
      ...Array.from({ length: 30 }, () => ({ x: 0, z: 0, y: 6 })),
      ...Array.from({ length: 8 }, () => ({ x: 1, z: 0, y: 6 })),
    ],
  },
  pipe: {
    domainFacts: { zTiming: "after-x", zInfluencesX: false },
    xLabel: "treatment",
    yLabel: "growth",
    zLabel: "fungus",
    rows: [
      ...Array.from({ length: 30 }, () => ({ x: 1, z: 1, y: 12 })),
      ...Array.from({ length: 8 }, () => ({ x: 0, z: 1, y: 12 })),
      ...Array.from({ length: 30 }, () => ({ x: 0, z: 0, y: 7 })),
      ...Array.from({ length: 8 }, () => ({ x: 1, z: 0, y: 7 })),
    ],
  },
  "fork-causal": {
    domainFacts: { zTiming: "before-x", zInfluencesX: true },
    xLabel: "surgeon",
    yLabel: "symptom score",
    zLabel: "severity",
    rows: [
      ...Array.from({ length: 30 }, () => ({ x: 1, z: 1, y: 13.6 })),
      ...Array.from({ length: 8 }, () => ({ x: 0, z: 1, y: 12 })),
      ...Array.from({ length: 30 }, () => ({ x: 0, z: 0, y: 10 })),
      ...Array.from({ length: 8 }, () => ({ x: 1, z: 0, y: 11.6 })),
    ],
  },
  collider: {
    domainFacts: { zTiming: "after-x", zInfluencesX: false },
    xLabel: "interview",
    yLabel: "reference score",
    zLabel: "offer",
    rows: colliderRows(),
  },
  direct: {
    domainFacts: { zTiming: "before-x", zInfluencesX: false },
    xLabel: "checkoutFlow",
    yLabel: "basket size",
    zLabel: "device",
    rows: [
      ...Array.from({ length: 20 }, () => ({ x: 1, z: 1, y: 14 })),
      ...Array.from({ length: 20 }, () => ({ x: 0, z: 1, y: 8 })),
      ...Array.from({ length: 20 }, () => ({ x: 1, z: 0, y: 14 })),
      ...Array.from({ length: 20 }, () => ({ x: 0, z: 0, y: 8 })),
    ],
  },
};

for (const [name, p] of Object.entries(probes)) {
  const body = {
    probeId: "step6-" + name,
    type: "causality-audit",
    context: {
      narrative: "Check sentence for " + name,
      xLabel: p.xLabel,
      x0: "a",
      x1: "b",
      zLabel: p.zLabel,
      z0: "no",
      z1: "yes",
      yLabel: p.yLabel,
      domainFacts: p.domainFacts,
    },
    dataset: p.rows,
  };
  const res = await fetch("http://localhost:3000/api/causality/decide", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const ans = await res.json();
  const page = await fetch("http://localhost:3000/causality");
  const html = await page.text();
  const img =
    html.match(/data-causality="dag"[^>]*src="([^"]+)"/) ||
    html.match(/src="([^"]+)"[^>]*data-causality="dag"/);
  const cap = html
    .split("The causal structure")[1]
    ?.split("</p>")[0]
    ?.replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const verdict = html.match(/data-causality="verdict"[^>]*>([^<]+)/)?.[1];
  const structure = html.match(/data-causality="structure"[^>]*>([^<]+)/)?.[1];
  let imgStatus = "no-src";
  if (img) {
    const ir = await fetch("http://localhost:3000" + img[1]);
    imgStatus = ir.status + " " + ir.headers.get("content-type");
  }
  console.log(
    name,
    res.status,
    JSON.stringify(ans.structure),
    ans.causal,
    "| page",
    structure,
    verdict,
    "| img",
    img?.[1],
    imgStatus
  );
  console.log("  ", cap);
}
