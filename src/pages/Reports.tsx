"use client";

import React, { useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, DollarSign } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/DateRangePicker";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data for reports
const mockReportData = {
  totalAppointments: 150,
  activePatients: 47,
  estimatedRevenue: 7500,
  appointmentsByMonth: [
    { name: "Jan", atendimentos: 20 },
    { name: "Fev", atendimentos: 25 },
    { name: "Mar", atendimentos: 30 },
    { name: "Abr", atendimentos: 28 },
    { name: "Mai", atendimentos: 35 },
    { name: "Jun", atendimentos: 32 },
  ],
};

const Reports = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2023, 0, 1),
    to: new Date(),
  });

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-8">Relatórios</h1>

      <div className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-4 md:space-y-0 md:space-x-4">
        <DateRangePicker date={dateRange} setDate={setDateRange} />
        {/* Adicionar botões de filtro ou exportação aqui, se necessário */}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card shadow-sm hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Atendimentos
            </CardTitle>
            <CalendarDays className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {mockReportData.totalAppointments}
            </div>
            <p className="text-xs text-muted-foreground">
              +20% do mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pacientes Ativos
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {mockReportData.activePatients}
            </div>
            <p className="text-xs text-muted-foreground">
              +5 novos pacientes este mês
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Estimada
            </CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              R$ {mockReportData.estimatedRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              +15% do mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Appointments by Month Chart */}
      <Card className="bg-card shadow-sm hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Atendimentos por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockReportData.appointmentsByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.5rem",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Bar dataKey="atendimentos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <MadeWithDyad />
    </div>
  );
};

export default Reports;