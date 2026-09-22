/**
 * The two-way table behind a plausibility update (Station 2.3's counting
 * method, drawn instead of computed). Why it exists: a posterior with no
 * table is just a number someone claims; the table shows a reader exactly
 * where the number comes from. Imagine 10,000 cases and count who lands in
 * each cell. The posterior is then read straight off the "flagged" column:
 * true flags divided by all flags.
 */
export function TwoWayTable({
  baseRate,
  hitRate,
  falseAlarmRate,
}: {
  baseRate: number;
  hitRate: number;
  falseAlarmRate: number;
}) {
  const N = 10_000;
  const trueFlagged = Math.round(N * baseRate * hitRate);
  const trueMissed = Math.round(N * baseRate * (1 - hitRate));
  const falseFlagged = Math.round(N * (1 - baseRate) * falseAlarmRate);
  const truePassed = Math.round(N * (1 - baseRate) * (1 - falseAlarmRate));
  const flaggedTotal = trueFlagged + falseFlagged;

  const cell = "border border-line px-3 py-2 text-right tabular-nums";
  const head = "border border-line bg-surface px-3 py-2 text-left font-semibold";

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full max-w-lg border-collapse text-sm">
        <thead>
          <tr>
            <th className={head}>Out of {N.toLocaleString()} cases</th>
            <th className={head}>Flagged</th>
            <th className={head}>Not flagged</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className={head}>Actually the condition</th>
            <td className={cell}>{trueFlagged.toLocaleString()}</td>
            <td className={cell}>{trueMissed.toLocaleString()}</td>
          </tr>
          <tr>
            <th className={head}>Not the condition</th>
            <td className={cell}>{falseFlagged.toLocaleString()}</td>
            <td className={cell}>{truePassed.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-3 max-w-prose text-sm text-muted">
        The flag arrived, so only the “Flagged” column matters now:{" "}
        {trueFlagged.toLocaleString()} real cases out of {flaggedTotal.toLocaleString()} flags in
        total. That ratio, {trueFlagged.toLocaleString()} / {flaggedTotal.toLocaleString()}, is the
        posterior. The table is why the number is right.
      </p>
    </div>
  );
}
