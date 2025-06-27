"use client"

import { format } from "date-fns"
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts"

import type { BloodPressureReading } from "@/lib/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface BloodPressureChartProps {
  data: BloodPressureReading[]
  showReadings?: number
  title?: string
  description?: string
}

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
          <div className="space-y-4">
            <LineChart width={400} height={200} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Line 
                type="monotone" 
                dataKey="systolic" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Sistolik"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="diastolic" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Diastolik"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
            <div className="flex justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm">Sistolik</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">Diastolik</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
            Catat bacaan tekanan darah pertama Anda untuk melihat grafik.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
