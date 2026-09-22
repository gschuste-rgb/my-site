/**
 * The four-view ladder for a Bernoulli random variable (Station 2.4):
 * table, math, graph, node. Why it exists: the same random variable, shown
 * four ways, is how you prove you can move between a business story and its
 * math. All four views below render from the SAME live theta, so they can
 * never disagree with each other or with your API's answer.
 */
export function BernoulliFourViews({
  theta,
  onSuccess,
  onFailure,
}: {
  theta: number;
  onSuccess: number;
  onFailure: number;
}) {
  const p1 = theta;
  const p0 = 1 - theta;
  const box = "rounded-lg border border-line bg-surface p-4";
  const label = "text-xs font-semibold uppercase tracking-widest text-muted";

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {/* View 1: the table */}
      <div className={box}>
        <p className={label}>Table view</p>
        <table className="mt-3 w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="pb-2 pr-3 font-semibold">Outcome x</th>
              <th className="pb-2 pr-3 font-semibold">Payoff</th>
              <th className="pb-2 font-semibold">P(X = x)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-1 pr-3">1</td>
              <td className="py-1 pr-3 tabular-nums">${onSuccess}</td>
              <td className="py-1 tabular-nums">{p1.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="py-1 pr-3">0</td>
              <td className="py-1 pr-3 tabular-nums">${onFailure}</td>
              <td className="py-1 tabular-nums">{p0.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* View 2: the math */}
      <div className={box}>
        <p className={label}>Math view</p>
        <p className="mt-3 text-sm">
          X ~ Bernoulli(θ),&nbsp;θ = {p1.toFixed(2)}
        </p>
        <p className="mt-1 text-sm">
          P(X = 1) = {p1.toFixed(2)},&nbsp;P(X = 0) = {p0.toFixed(2)}
        </p>
      </div>

      {/* View 3: the graph (two bars sized by probability) */}
      <div className={box}>
        <p className={label}>Graph view</p>
        <div className="mt-3 space-y-2">
          {[
            { x: "1", p: p1 },
            { x: "0", p: p0 },
          ].map(({ x, p }) => (
            <div key={x} className="flex items-center gap-2 text-sm">
              <span className="w-12 shrink-0">x = {x}</span>
              <div className="h-4 flex-1 overflow-hidden rounded bg-paper">
                <div
                  className="h-4 rounded bg-accent"
                  style={{ width: `${Math.max(0, Math.min(1, p)) * 100}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right tabular-nums">{p.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* View 4: the node (the DAG seed from Station 2.4) */}
      <div className={box}>
        <p className={label}>Node view</p>
        <div className="mt-4 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent text-lg font-bold">
            X
          </div>
          <p className="mt-3 text-center text-sm text-muted">
            One uncertain quantity, one node. In Lane 3, nodes get parents.
          </p>
        </div>
      </div>
    </div>
  );
}
