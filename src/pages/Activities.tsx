import React, { useState, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityPlanForm } from "@/components/ActivityPlanForm";
import { SavedActivityPlansList } from "@/components/SavedActivityPlansList";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { activitiesData } from "@/data/activities";
import { supabase } from "@/integrations/supabase/client";
import { Patient, SavedActivityPlan } from "@/types";

const Activities = () => {
  const { user, profile, loading } = useAuth();
  const [savedPlans, setSavedPlans] = useState<SavedActivityPlan[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: plansData, error: plansError } = await supabase
        .from('activity_plans')
        .select('*, patients(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (plansError) toast.error("Erro ao buscar planos de atividades.");
      else setSavedPlans(plansData as any);

      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id);

      if (patientsError) toast.error("Erro ao buscar pacientes.");
      else setPatients(patientsData as Patient[]);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="p-4 md:p-6 text-center"><p>Carregando...</p></div>;
  }

  if (!profile || !profile.specialty) {
    return <div className="p-4 md:p-6 text-center"><p>Complete seu perfil para encontrar atividades.</p></div>;
  }

  const therapistName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  const specialtyActivities = activitiesData.find(s => s.specialty === profile.specialty);
  const diagnosesForSpecialty = specialtyActivities ? specialtyActivities.diagnoses : [];

  const handleSavePlan = async (data: { patientId: string; content: string }) => {
    if (!user) return;
    const { data: dbData, error } = await supabase
      .from('activity_plans')
      .insert([{ user_id: user.id, patient_id: data.patientId, content: data.content }])
      .select('*, patients(name)');

    if (error) {
      toast.error("Erro ao salvar plano de atividades.");
    } else if (dbData) {
      setSavedPlans(prev => [dbData[0] as any, ...prev]);
      toast.success("Plano de atividades salvo com sucesso!");
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este plano?")) {
      const { error } = await supabase.from('activity_plans').delete().eq('id', id);
      if (error) {
        toast.error("Erro ao excluir o plano.");
      } else {
        setSavedPlans(prev => prev.filter(p => p.id !== id));
        toast.success("Plano de atividades excluído com sucesso.");
      }
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-8">
      <h1 className="text-3xl font-bold">Gerador de Plano de Atividades</h1>

      <Card>
        <CardHeader>
          <CardTitle>Planos de Atividades Salvos</CardTitle>
          <CardDescription>Visualize, baixe ou exclua os planos gerados.</CardDescription>
        </CardHeader>
        <CardContent>
          <SavedActivityPlansList
            plans={savedPlans}
            onDelete={handleDeletePlan}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Plano de Atividades</CardTitle>
          <CardDescription>Selecione o paciente e as demandas para gerar sugestões de atividades para a sua especialidade: <span className="font-semibold text-primary">{profile.specialty}</span>.</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityPlanForm 
            onSavePlan={handleSavePlan} 
            diagnoses={diagnosesForSpecialty} 
            patients={patients} 
            specialty={profile.specialty}
            therapistName={therapistName}
          />
        </CardContent>
      </Card>

      <MadeWithDyad />
    </div>
  );
};

export default Activities;