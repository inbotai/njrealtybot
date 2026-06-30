"use client";

import { getCommuteData, isSouthJersey } from "@/data/nj-commute-data";

interface CommuteCardProps {
  city: string | null | undefined;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function CommuteCard({ city }: CommuteCardProps) {
  const data = getCommuteData(city);
  if (!data) return null;

  const southJersey = isSouthJersey(city);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="rounded-lg bg-navy p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Commute From This Home
        </p>
        <p className="mt-1 text-lg font-bold text-white">
          {city}
        </p>
      </div>

      {/* Commute rows */}
      <div className="mt-4 space-y-2 text-sm">
        {/* South Jersey: Philly first */}
        {southJersey && data.driveToPhilly != null && (
          <CommuteRow
            icon="🚗"
            label="Drive to Philadelphia"
            time={data.driveToPhilly}
            highlight
          />
        )}

        {/* Transit to NYC Penn */}
        {data.transitToNYCPenn != null && (
          <CommuteRow
            icon="🚂"
            label="Transit to NYC Penn"
            time={data.transitToNYCPenn}
            sub={data.transitLine}
            highlight={!southJersey}
          />
        )}

        {/* Drive to NYC Penn */}
        {data.driveToNYCPenn != null && (
          <CommuteRow
            icon="🚗"
            label="Drive to NYC (Midtown)"
            time={data.driveToNYCPenn}
          />
        )}

        {/* Transit to Hoboken */}
        {data.transitToHoboken != null && data.transitToHoboken > 0 && (
          <CommuteRow
            icon="🚂"
            label="Transit to Hoboken"
            time={data.transitToHoboken}
          />
        )}

        {/* Drive to Hoboken */}
        {data.driveToHoboken != null && data.driveToHoboken > 0 && (
          <CommuteRow
            icon="🚗"
            label="Drive to Hoboken/JC"
            time={data.driveToHoboken}
          />
        )}

        {/* Drive to Newark */}
        {data.driveToNewark != null && data.driveToNewark > 0 && (
          <CommuteRow
            icon="🚗"
            label="Drive to Newark"
            time={data.driveToNewark}
          />
        )}

        {/* Drive to Philly (non-South Jersey, only if available) */}
        {!southJersey && data.driveToPhilly != null && (
          <CommuteRow
            icon="🚗"
            label="Drive to Philadelphia"
            time={data.driveToPhilly}
          />
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 pt-2" />

        {/* Station info */}
        {data.nearestStation && (
          <div className="flex items-start gap-2 text-gray-600">
            <span className="mt-0.5 shrink-0 text-base">🚉</span>
            <div>
              <p className="font-medium text-navy">{data.nearestStation}</p>
              {data.stationDistance != null && data.stationDistance > 0 && (
                <p className="text-xs text-gray-400">
                  ~{data.stationDistance} mi from town center
                </p>
              )}
            </div>
          </div>
        )}

        {/* Monthly pass */}
        {data.monthlyPass != null && (
          <div className="flex justify-between text-gray-600">
            <span>
              Monthly Pass
              {data.transitZone != null && (
                <span className="ml-1 text-[10px] text-gray-400">
                  (Zone {data.transitZone})
                </span>
              )}
            </span>
            <span className="font-medium text-navy">{fmt(data.monthlyPass)}/mo</span>
          </div>
        )}
      </div>

      <p className="mt-4 text-[10px] text-gray-400 leading-relaxed">
        Commute times are peak-hour estimates based on NJ Transit schedules and
        typical traffic. Actual times may vary. Drive times assume weekday morning
        rush hour.
      </p>
    </div>
  );
}

/* --- Single commute row --- */

function CommuteRow({
  icon,
  label,
  time,
  sub,
  highlight,
}: {
  icon: string;
  label: string;
  time: number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between ${highlight ? "rounded-md bg-blue-50 px-3 py-2" : "px-1"}`}>
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <div>
          <span className={highlight ? "font-semibold text-navy" : "text-gray-600"}>
            {label}
          </span>
          {sub && (
            <p className="text-[10px] text-gray-400">{sub}</p>
          )}
        </div>
      </div>
      <span className={`font-bold ${highlight ? "text-navy text-base" : "text-gray-700"}`}>
        {time} min
      </span>
    </div>
  );
}

/* --- Compact badge for listing cards --- */

export function CommuteBadge({ city }: { city: string | null | undefined }) {
  const data = getCommuteData(city);
  if (!data) return null;

  const southJersey = isSouthJersey(city);

  // Pick the most relevant commute to show
  let label: string;
  let time: number;

  if (southJersey && data.driveToPhilly != null) {
    label = "to Philly";
    time = data.driveToPhilly;
  } else if (data.transitToNYCPenn != null) {
    label = "to NYC";
    time = data.transitToNYCPenn;
  } else if (data.driveToNYCPenn != null) {
    label = "to NYC";
    time = data.driveToNYCPenn;
  } else {
    return null;
  }

  return (
    <p className="text-xs text-gray-500">
      <span className="inline-flex items-center gap-1">
        <span>🚂</span>
        <span className="font-semibold text-navy">{time} min</span>{" "}
        {label}
      </span>
    </p>
  );
}
