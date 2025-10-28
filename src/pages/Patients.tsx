import React, { useState, useEffect, useCallback } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, AlertCircle } from "lucide-react";
import { PatientsList } from "@/components/PatientsList";
import { AddPatientDialog } from "@/components/AddPatientDialog";
import { toast } from "sonner";
import { Patient } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

const Patients = () => {
  const { user } = useAuth();
  const [isAddPatientDialogOpen, setIsAddPatientDialogOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setFetchError(null);

    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao buscar pacientes:", error);
      const errorMessage = `Erro ao carregar pacientes: ${error.message}`;
      toast.error(errorMessage);
      setFetchError(errorMessage);
    } else {
      setPatients(data as Patient[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleAddPatient = async (patientData: { name: string; birth_date?: string; diagnosis?: string; mother_name?: string; phone?: string; }) => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar um paciente.");
      return;
    }

    const { data, error } = await supabase
      .from("patients")
      .insert([{ ...patientData, user_id: user.id }])
      .select()
      .single();

    if (error) {
      toast.error(`Erro ao adicionar paciente: ${error.message}`);
      console.error("Erro do Supabase:", error);
    } else if (data) {
      setPatients((prevPatients) => [...prevPatients, data as Patient].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`Paciente ${patientData.name} adicionado com sucesso!`);
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-8">Pacientes</h1>

      <div className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar paciente por nome..."
            className="pl-11 pr-4 py-3 text-base rounded-lg shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="w-full md:w-auto py-3 text-base rounded-lg shadow-sm" onClick={() => setIsAddPatientDialogOpen(true)}>
          <Plus className="h-5 w-5 mr-2" /> Adicionar Paciente
        </Button>
      </div>

      {loading ? (
        <p>Carregando pacientes...</p>
      ) : fetchError ? (
        <Card className="bg-destructive/10 border-destructive/50">
          <CardContent className="p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-destructive mr-3" />
            <div className="text-destructive">
              <p className="font-semibold">Falha ao carregar</p>
              <p className="text-sm">{fetchError}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <PatientsList patients={filteredPatients} />
      )}

      <AddPatientDialog
        isOpen={isAddPatientDialogOpen}
        onClose={() => setIsAddPatientDialogOpen(false)}
        onAddPatient={handleAddPatient}
      />

      <MadeWithDyad />
    </div>
  );
};

export default Patients;