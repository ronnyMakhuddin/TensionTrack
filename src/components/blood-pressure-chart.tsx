"use client"

import { format } from "date-fns"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import type { BloodPressureReading } from "@/lib/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface BloodPressureChartProps {
  data: BloodPressureReading[]
  showReadings?: number
  title?: string
  description?: string
}

const chartConfig = {
  systolic: {
    label: "Sistolik",
    color: "hsl(var(--chart-1))",
  },
  diastolic: {
    label: "Diastolik",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function BloodPressureChart({ data, showReadings = 7, title, description }: BloodPressureChartProps) {
  const chartData = data
    .slice(0, showReadings)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((r) => ({
      ...r,
      date: format(new Date(r.timestamp), "MMM d"),
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || "Tren Tekanan Darah"}</CardTitle>
        <CardDescription>
          {description || (data.length > 0 ? `Menampilkan ${Math.min(data.length, showReadings)} bacaan terakhir.` : "Tidak ada data.")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="systolic" fill="var(--color-systolic)" radius={4} />
              <Bar dataKey="diastolic" fill="var(--color-diastolic)" radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
            Catat bacaan tekanan darah pertama Anda untuk melihat grafik.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
