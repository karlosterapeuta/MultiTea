import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Patient } from "@/types";

interface AddAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAppointment: (patientId: string, time: string, specialty: string, date: Date) => void;
  patients: Patient[];
  selectedDate: Date;
}

export const AddAppointmentDialog = ({ isOpen, onClose, onAddAppointment, patients, selectedDate }: AddAppointmentDialogProps) => {
  const [patientId, setPatientId] = useState("");
  const [time, setTime] = useState("");
  const [specialty, setSpecialty] = useState("");

  const handleSubmit = () => {
    if (patientId && time.trim() && specialty.trim()) {
      onAddAppointment(patientId, time, specialty, selectedDate);
      setPatientId("");
      setTime("");
      setSpecialty("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Agendamento</DialogTitle>
          <DialogDescription>
            Preencha os dados para adicionar um novo agendamento à sua agenda.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="patientName" className="text-left sm:text-right">
              Paciente
            </Label>
            <div className="col-span-full sm:col-span-3">
              <Select onValueChange={setPatientId} value={patientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-left sm:text-right">
              Horário
            </Label>
            <Input
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Ex: 09:00 - 10:00"
              className="col-span-full sm:col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="specialty" className="text-left sm:text-right">
              Especialidade
            </Label>
            <Input
              id="specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="col-span-full sm:col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Adicionar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};