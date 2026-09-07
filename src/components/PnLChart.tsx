import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface ChartPoint {
  time: string;
  balance: number;
  pnl: number;
}

interface PnLChartProps {
  data: ChartPoint[];
  currentBalance: number;
  totalPnL: number;
}

export const PnLChart: React.FC<PnLChartProps> = ({ data, currentBalance, totalPnL }) => {
  const { t, isAr } = useLanguage();
  const isPositive = totalPnL >= 0;

  return (
    <div className="bg-[#181a20] border border-[#2b2f36] rounded-xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 border-b border-[#2b2f36] pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#fcd535]" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#848e9c] font-mono">
            {t.chartTitle}
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[#848e9c]">
            {isAr ? 'الرصيد:' : 'Balance:'} <strong className="text-[#eaecef]">${currentBalance.toFixed(2)}</strong>
          </span>
          <span className={isPositive ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
            PnL: {isPositive ? `+$${totalPnL.toFixed(2)}` : `-$${Math.abs(totalPnL).toFixed(2)}`}
          </span>
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fcd535" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#fcd535" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2b2f36" vertical={false} />
            <XAxis dataKey="time" stroke="#848e9c" fontSize={10} tickLine={false} />
            <YAxis
              stroke="#848e9c"
              fontSize={10}
              domain={['auto', 'auto']}
              tickFormatter={(v) => `$${v}`}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#181a20',
                borderColor: '#2b2f36',
                borderRadius: '0.5rem',
                fontSize: '11px',
                color: '#eaecef',
                fontFamily: 'monospace',
              }}
              formatter={(val: any) => [`$${Number(val).toFixed(2)}`, isAr ? 'الرصيد' : 'Balance']}
              labelStyle={{ color: '#848e9c' }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#fcd535"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#balanceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
