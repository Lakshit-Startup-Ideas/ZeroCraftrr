import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { formatNumber } from '../utils/format'

type TrendChartProps = {
  data: Array<{ timestamp: string; value: number }>
  color?: string
  metricLabel: string
}

const TrendChart = ({ data, color = '#0B8B6F', metricLabel }: TrendChartProps) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-base font-semibold text-slate-800">{metricLabel}</h2>
    <div className="mt-4 h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(val: number) => formatNumber(val)} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => formatNumber(value)}
            labelFormatter={(label) => new Date(label).toLocaleString()}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fillOpacity={1}
            fill="url(#trendGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
)

export default TrendChart
