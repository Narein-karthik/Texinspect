import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { getReportAnalytics } from './reportAnalytics';

export function DefectTrendChart({ defectTrendData }: Pick<ReturnType<typeof getReportAnalytics>, 'defectTrendData'>) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={defectTrendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="location"
            tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Location (m)', position: 'insideBottom', offset: -2, fontSize: 9, fill: '#9ca3af' }}
          />
          <YAxis
            tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            domain={[0, 4]}
            ticks={[1, 2, 3, 4]}
            label={{ value: 'Severity', angle: -90, position: 'insideLeft', fontSize: 9, fill: '#9ca3af' }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const val = payload[0].value as number;
              const severityLabel: Record<number, string> = {
                1: 'Minor', 2: 'Minor', 3: 'Major', 4: 'Critical'
              };
              return (
                <div style={{
                  background: '#111827', borderRadius: '12px',
                  padding: '10px 14px', color: '#fff',
                  fontSize: '11px', fontWeight: 700
                }}>
                  <div style={{ opacity: 0.5, marginBottom: 4 }}>
                    Location: {label} m
                  </div>
                  <div>
                    Severity: {val} - {severityLabel[val] ?? 'Unknown'}
                  </div>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="severity"
            stroke="#2563eb"
            strokeWidth={3}
            isAnimationActive={false}
            dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, fill: '#1d4ed8' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
