import { useState, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ProfileTabs } from "@/components/ProfileTabs";
import { AnamneseFormData } from "@/components/AnamneseForm";
import { EvolutionFormData } from "@/components/EvolutionForm";
import { EditAnamneseDialog } from "@/components/EditAnamneseDialog";
import { EditEvolutionDialog } from "@/components/EditEvolutionDialog";
import { toast } from "sonner";
import { ReportWizardData } from "@/components/ReportWizard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Patient, SavedAnamnese, SavedDevolutiva, SavedEvolution, SavedReport, SavedTherapeuticPlan } from "@/types";

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  specialty: string;
  crp?: string;
  avatarUrl?: string;
}

const Profile = () => {
  const { user, profile, refreshProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [savedAnamneses, setSavedAnamneses] = useState<SavedAnamnese[]>([]);
  const [isEditAnamneseDialogOpen, setIsEditAnamneseDialogOpen] = useState(false);
  const [currentAnamnese, setCurrentAnamnese] = useState<SavedAnamnese | null>(null);

  const [savedEvolutions, setSavedEvolutions] = useState<SavedEvolution[]>([]);
  const [isEditEvolutionDialogOpen, setIsEditEvolutionDialogOpen] = useState(false);
  const [currentEvolution, setCurrentEvolution] = useState<SavedEvolution | null>(null);

  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [savedPlans, setSavedPlans] = useState<SavedTherapeuticPlan[]>([]);
  const [savedDevolutivas, setSavedDevolutivas] = useState<SavedDevolutiva[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Buscar pacientes
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', user.id);
        
        if (patientsError) {
          toast.error("Erro ao buscar pacientes: " + patientsError.message);
          console.error("Erro ao buscar pacientes:", patientsError);
        } else {
          setPatients(patientsData as Patient[]);
        }

        // Buscar anamneses
        const { data: anamnesesData, error: anamnesesError } = await supabase
          .from('anamneses')
          .select('*, patients(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (anamnesesError) {
          toast.error("Erro ao buscar anamneses: " + anamnesesError.message);
          console.error("Erro ao buscar anamneses:", anamnesesError);
        } else {
          setSavedAnamneses(anamnesesData as any);
        }

        // Buscar evoluções
        const { data: evolutionsData, error: evolutionsError } = await supabase
          .from('evolutions')
          .select('*, patients(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (evolutionsError) {
          toast.error("Erro ao buscar evoluções: " + evolutionsError.message);
          console.error("Erro ao buscar evoluções:", evolutionsError);
        } else {
          setSavedEvolutions(evolutionsData as any);
        }

        // Buscar relatórios
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select('*, patients(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (reportsError) {
          toast.error("Erro ao buscar relatórios: " + reportsError.message);
          console.error("Erro ao buscar relatórios:", reportsError);
        } else {
          setSavedReports(reportsData as any);
        }

        // Buscar planos terapêuticos
        const { data: plansData, error: plansError } = await supabase
          .from('therapeutic_plans')
          .select('*, patients(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (plansError) {
          toast.error("Erro ao buscar planos terapêuticos: " + plansError.message);
          console.error("Erro ao buscar planos terapêuticos:", plansError);
        } else {
          setSavedPlans(plansData as any);
        }

        // Buscar devolutivas
        const { data: devolutivasData, error: devolutivasError } = await supabase
          .from('devolutivas')
          .select('*, patients(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (devolutivasError) {
          toast.error("Erro ao buscar devolutivas: " + devolutivasError.message);
          console.error("Erro ao buscar devolutivas:", devolutivasError);
        } else {
          setSavedDevolutivas(devolutivasData as any);
        }
      } catch (error) {
        console.error("Erro inesperado ao buscar dados:", error);
        toast.error("Erro inesperado ao carregar dados do perfil");
      }
    };

    fetchData();
  }, [user]);

  const handleSaveAnamnese = async (formData: AnamneseFormData) => {
    if (!user || !profile?.specialty) return;
    try {
      const { data, error } = await supabase
        .from('anamneses')
        .insert([{ 
          user_id: user.id, 
          patient_id: formData.patientId, 
          specialty: profile.specialty, 
          data: formData 
        }])
        .select('*, patients(name)');
      
      if (error) {
        toast.error("Erro ao salvar anamnese: " + error.message);
        console.error(error);
      } else if (data) {
        setSavedAnamneses(prev => [data[0] as any, ...prev]);
        toast.success("Anamnese salva com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar anamnese:", error);
      toast.error("Erro inesperado ao salvar anamnese");
    }
  };

  const handleDeleteAnamnese = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta anamnese?")) return;
    try {
      const { error } = await supabase
        .from('anamneses')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error("Erro ao excluir anamnese: " + error.message);
        console.error(error);
      } else {
        setSavedAnamneses(p => p.filter(a => a.id !== id));
        toast.success("Anamnese excluída com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao excluir anamnese:", error);
      toast.error("Erro inesperado ao excluir anamnese");
    }
  };

  const handleUpdateAnamnese = async (updatedData: AnamneseFormData) => {
    if (!currentAnamnese) return;
    try {
      const { data, error } = await supabase
        .from('anamneses')
        .update({ 
          data: updatedData, 
          patient_id: updatedData.patientId 
        })
        .eq('id', currentAnamnese.id)
        .select('*, patients(name)');
      
      if (error) {
        toast.error("Erro ao atualizar anamnese: " + error.message);
        console.error(error);
      } else if (data) {
        setSavedAnamneses(p => p.map(a => a.id === currentAnamnese.id ? data[0] as any : a));
        toast.success("Anamnese atualizada com sucesso!");
        setIsEditAnamneseDialogOpen(false);
        setCurrentAnamnese(null);
      }
    } catch (error) {
      console.error("Erro ao atualizar anamnese:", error);
      toast.error("Erro inesperado ao atualizar anamnese");
    }
  };

  const handleSaveEvolution = async (formData: EvolutionFormData) => {
    if (!user || !profile?.specialty) return;
    try {
      const { data, error } = await supabase
        .from('evolutions')
        .insert([{ 
          user_id: user.id, 
          patient_id: formData.patientId, 
          specialty: profile.specialty, 
          data: formData,
          created_at: formData.sessionDate 
        }])
        .select('*, patients(name)');
      
      if (error) {
        toast.error("Erro ao salvar evolução: " + error.message);
        console.error(error);
      } else if (data) {
        setSavedEvolutions(prev => [data[0] as any, ...prev]);
        toast.success("Evolução salva com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar evolução:", error);
      toast.error("Erro inesperado ao salvar evolução");
    }
  };

  const handleDeleteEvolution = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta evolução?")) return;
    try {
      const { error } = await supabase
        .from('evolutions')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error("Erro ao excluir evolução: " + error.message);
        console.error(error);
      } else {
        setSavedEvolutions(p => p.filter(e => e.id !== id));
        toast.success("Evolução excluída com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao excluir evolução:", error);
      toast.error("Erro inesperado ao excluir evolução");
    }
  };

  const handleUpdateEvolution = async (updatedData: EvolutionFormData) => {
    if (!currentEvolution) return;
    try {
      const { data, error } = await supabase
        .from('evolutions')
        .update({ 
          data: updatedData, 
          patient_id: updatedData.patientId,
          created_at: updatedData.sessionDate 
        })
        .eq('id', currentEvolution.id)
        .select('*, patients(name)');
      
      if (error) {
        toast.error("Erro ao atualizar evolução: " + error.message);
        console.error(error);
      } else if (data) {
        setSavedEvolutions(p => p.map(e => e.id === currentEvolution.id ? data[0] as any : e));
        toast.success("Evolução atualizada com sucesso!");
        setIsEditEvolutionDialogOpen(false);
        setCurrentEvolution(null);
      }
    } catch (error) {
      console.error("Erro ao atualizar evolução:", error);
      toast.error("Erro inesperado ao atualizar evolução");
    }
  };

  const handleSaveReport = async (reportData: ReportWizardData) => {
    if (!user || !profile?.specialty) return;
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([{ 
          user_id: user.id, 
          patient_id: reportData.patientId, 
          specialty: profile.specialty, 
          data: reportData 
        }])
        .select('*, patients(name)');
      
      if (error) {
        toast.error("Erro ao salvar relatório: " + error.message);
        console.error(error);
      } else if (data) {
        setSavedReports(prev => [data[0] as any, ...prev]);
        toast.success("Relatório salvo com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar relatório:", error);
      toast.error("Erro inesperado ao salvar relatório");
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este relatório?")) return;
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error("Erro ao excluir relatório: " + error.message);
        console.error(error);
      } else {
        setSavedReports(p => p.filter(r => r.id !== id));
        toast.success("Relatório excluído com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao excluir relatório:", error);
      toast.error("Erro inesperado ao excluir relatório");
    }
  };

  const handleSavePlan = async (planData: { patientName: string; specialty: string; planContent: string; patientId: string }) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('therapeutic_plans')
        .insert([{ 
          user_id: user.id, 
          patient_id: planData.patientId, 
          specialty: planData.specialty, 
          plan_content: planData.planContent 
        }])
        .select('*, patients(name)');
      
      if (error) {
        toast.error("Erro ao salvar plano: " + error.message);
        console.error(error);
      } else if (data) {
        setSavedPlans(prev => [data[0] as any, ...prev]);
        toast.success("Plano salvo com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar plano:", error);
      toast.error("Erro inesperado ao salvar plano");
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este plano?")) return;
    try {
      const { error } = await supabase
        .from('therapeutic_plans')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error("Erro ao excluir plano: " + error.message);
        console.error(error);
      } else {
        setSavedPlans(p => p.filter(plan => plan.id !== id));
        toast.success("Plano excluído com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao excluir plano:", error);
      toast.error("Erro inesperado ao excluir plano");
    }
  };

  const handleSaveDevolutiva = async (data: { patientName: string; specialty: string; content: string; patientId: string }) => {
    if (!user) return;
    try {
      const { data: dbData, error } = await supabase
        .from('devolutivas')
        .insert([{ 
          user_id: user.id, 
          patient_id: data.patientId, 
          specialty: data.specialty, 
          content: data.content 
        }])
        .select('*, patients(name)');
      
      if (error) {
        toast.error("Erro ao salvar devolutiva: " + error.message);
        console.error(error);
      } else if (dbData) {
        setSavedDevolutivas(prev => [dbData[0] as any, ...prev]);
        toast.success("Devolutiva salva com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar devolutiva:", error);
      toast.error("Erro inesperado ao salvar devolutiva");
    }
  };

  const handleDeleteDevolutiva = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta devolutiva?")) return;
    try {
      const { error } = await supabase
        .from('devolutivas')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error("Erro ao excluir devolutiva: " + error.message);
        console.error(error);
      } else {
        setSavedDevolutivas(p => p.filter(d => d.id !== id));
        toast.success("Devolutiva excluída com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao excluir devolutiva:", error);
      toast.error("Erro inesperado ao excluir devolutiva");
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) return;
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;
    const toastId = toast.loading("Enviando avatar...");
    
    try {
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) {
        toast.error("Erro ao enviar o avatar.", { id: toastId });
        console.error(uploadError);
        return;
      }
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const newAvatarUrl = `${data.publicUrl}?t=${new Date().getTime()}`;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id);
      
      if (updateError) {
        toast.error("Erro ao atualizar o perfil.", { id: toastId });
        console.error(updateError);
        return;
      }
      
      await refreshProfile();
      toast.success("Avatar atualizado com sucesso!", { id: toastId });
    } catch (error) {
      console.error("Erro ao atualizar avatar:", error);
      toast.error("Erro inesperado ao atualizar avatar", { id: toastId });
    }
  };

  const handleProfileUpdate = async (data: ProfileData) => {
    console.log('handleProfileUpdate called with:', data);
    if (!user) {
      console.error('No user found');
      return;
    }
    try {
      console.log('Updating profile for user:', user.id);
      const { error } = await supabase
        .from('profiles')
        .update({ 
          first_name: data.firstName, 
          last_name: data.lastName, 
          phone: data.phone, 
          address: data.address, 
          specialty: data.specialty, 
          crp: data.crp 
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('Supabase error:', error);
        toast.error("Erro ao atualizar o perfil: " + error.message);
      } else {
        console.log('Profile updated successfully');
        await refreshProfile();
        toast.success("Dados cadastrais atualizados com sucesso!");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro inesperado ao atualizar perfil");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><p>Carregando perfil...</p></div>;

  const displayName = profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : user?.email || 'Usuário';
  const displaySpecialty = profile?.specialty || 'Especialidade';
  const profileFormData: ProfileData = { 
    firstName: profile?.firstName || '', 
    lastName: profile?.lastName || '', 
    email: user?.email || '', 
    phone: profile?.phone || '', 
    address: profile?.address || '', 
    specialty: profile?.specialty || '', 
    crp: profile?.crp || '', 
    avatarUrl: profile?.avatarUrl || '' 
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-8">Perfil do Terapeuta</h1>
      <ProfileHeader 
        name={displayName} 
        specialty={displaySpecialty} 
        avatarUrl={profile?.avatarUrl} 
        isEditing={isEditing} 
        setIsEditing={setIsEditing} 
        onAvatarChange={handleAvatarChange} 
      />
      <ProfileTabs
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        profileData={profileFormData}
        onProfileUpdate={handleProfileUpdate}
        patients={patients}
        savedAnamneses={savedAnamneses}
        onSaveAnamnese={handleSaveAnamnese}
        onEditAnamnese={(id) => { 
          const a = savedAnamneses.find(a => a.id === id); 
          if (a) { 
            setCurrentAnamnese(a); 
            setIsEditAnamneseDialogOpen(true); 
          }
        }}
        onDeleteAnamnese={handleDeleteAnamnese}
        savedEvolutions={savedEvolutions}
        onSaveEvolution={handleSaveEvolution}
        onEditEvolution={(id) => { 
          const e = savedEvolutions.find(e => e.id === id); 
          if (e) { 
            setCurrentEvolution(e); 
            setIsEditEvolutionDialogOpen(true); 
          }
        }}
        onDeleteEvolution={handleDeleteEvolution}
        savedReports={savedReports}
        onSaveReport={handleSaveReport}
        onDeleteReport={handleDeleteReport}
        savedPlans={savedPlans}
        onSavePlan={handleSavePlan}
        onDeletePlan={handleDeletePlan}
        savedDevolutivas={savedDevolutivas}
        onSaveDevolutiva={handleSaveDevolutiva}
        onDeleteDevolutiva={handleDeleteDevolutiva}
      />
      <EditAnamneseDialog 
        isOpen={isEditAnamneseDialogOpen} 
        onClose={() => setIsEditAnamneseDialogOpen(false)} 
        anamnese={currentAnamnese} 
        onSave={handleUpdateAnamnese} 
        patients={patients} 
      />
      <EditEvolutionDialog 
        isOpen={isEditEvolutionDialogOpen} 
        onClose={() => setIsEditEvolutionDialogOpen(false)} 
        evolution={currentEvolution} 
        onSave={handleUpdateEvolution} 
        patients={patients} 
      />
      <MadeWithDyad />
    </div>
  );
};

export default Profile;