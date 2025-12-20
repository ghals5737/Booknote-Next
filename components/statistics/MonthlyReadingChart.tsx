"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyStat } from "@/lib/types/statistics/statistics";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MonthlyReadingChartProps {
  monthlyData: MonthlyStat[];
}

export function MonthlyReadingChart({ monthlyData }: MonthlyReadingChartProps) {
  const chartData = monthlyData.map((item) => ({
    month: item.label,
    books: item.readCount,
    pages: item.pageCount,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>월별 독서량</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value) => [`${typeof value === 'number' ? value : 0}권`, "독서량"]}
            />
            <Bar
              dataKey="books"
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
              className="fill-primary"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

