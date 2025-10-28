import React, { useState, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AddAppointmentDialog } from "@/components/AddAppointmentDialog";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Appointment, Patient } from "@/types";

const Agenda = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !date) return;

    const fetchAppointments = async () => {
      setLoading(true);
      const selectedDate = format(date, "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("appointments")
        .select("*, patients(name, avatar_url)")
        .eq("user_id", user.id)
        .eq("date", selectedDate)
        .order("time", { ascending: true });

      if (error) {
        toast.error("Erro ao buscar agendamentos.");
        console.error(error);
      } else {
        setAppointments(data as any);
      }
      setLoading(false);
    };

    fetchAppointments();
  }, [user, date]);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (error) {
        toast.error("Erro ao buscar pacientes para o agendamento.");
      } else {
        setPatients(data as Patient[]);
      }
    };
    fetchPatients();
  }, [user]);

  const handleAddAppointment = async (patient_id: string, time: string, specialty: string, date: Date) => {
    if (!user) return;

    const newAppointment = {
      user_id: user.id,
      patient_id,
      time,
      specialty,
      date: format(date, "yyyy-MM-dd"),
    };

    const { data, error } = await supabase
      .from("appointments")
      .insert([newAppointment])
      .select("*, patients(name, avatar_url)");

    if (error) {
      toast.error("Erro ao adicionar agendamento.");
      console.error(error);
    } else if (data) {
      setAppointments((prev) => [...prev, data[0] as any].sort((a, b) => a.time.localeCompare(b.time)));
      toast.success("Agendamento adicionado com sucesso!");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-8">Agenda</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="bg-card shadow-sm">
            <CardContent className="p-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full"
                locale={ptBR}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-2xl font-semibold">
                Agendamentos para {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : "hoje"}
              </CardTitle>
              <Button size="sm" className="rounded-lg" onClick={() => setIsAddAppointmentDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {loading ? (
                <p className="text-muted-foreground text-center py-8">Carregando...</p>
              ) : appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center space-x-4 p-4 border rounded-lg bg-background hover:bg-muted/80 transition-colors">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{appointment.patients.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.time} • {appointment.specialty}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">Nenhum agendamento para esta data.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddAppointmentDialog
        isOpen={isAddAppointmentDialogOpen}
        onClose={() => setIsAddAppointmentDialogOpen(false)}
        onAddAppointment={handleAddAppointment}
        patients={patients}
        selectedDate={date || new Date()}
      />

      <MadeWithDyad />
    </div>
  );
};

export default Agenda;