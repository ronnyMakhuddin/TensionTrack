"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  systolic: z.coerce.number().min(50, "Nilai tidak valid").max(300, "Nilai tidak valid"),
  diastolic: z.coerce.number().min(30, "Nilai tidak valid").max(200, "Nilai tidak valid"),
  pulse: z.coerce.number().min(30, "Nilai tidak valid").max(250, "Nilai tidak valid"),
});

interface BloodPressureFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void
  onCancel?: () => void
}

export function BloodPressureForm({ onSubmit, onCancel }: BloodPressureFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      systolic: 120,
      diastolic: 80,
      pulse: 70,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="systolic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sistolik (SYS)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} placeholder="120" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="diastolic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diastolik (DIA)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} placeholder="80" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pulse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Denyut Nadi (BPM)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} placeholder="70" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>}
          <Button type="submit">Simpan Bacaan</Button>
        </div>
      </form>
    </Form>
  )
}
