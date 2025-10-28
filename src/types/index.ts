import { AnamneseFormData } from "@/components/AnamneseForm";
import { EvolutionFormData } from "@/components/EvolutionForm";
import { ReportWizardData } from "@/components/ReportWizard";

export interface Patient {
  id: string;
  user_id: string;
  name: string;
  birth_date: string;
  diagnosis: string;
  mother_name: string;
  phone: string;
  avatar_url?: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  patient_id: string;
  date: string;
  time: string;
  specialty: string;
  patients: { name: string; avatar_url: string | null };
}

export interface SavedAnamnese {
  id: string;
  patient_id: string;
  specialty: string;
  data: AnamneseFormData;
  created_at: string;
  patients: { name: string };
}

export interface SavedEvolution {
  id: string;
  patient_id: string;
  specialty: string;
  data: EvolutionFormData;
  created_at: string;
  patients: { name: string };
}

export interface SavedReport {
  id: string;
  patient_id: string;
  specialty: string;
  data: ReportWizardData;
  created_at: string;
  patients: { name: string };
}

export interface SavedTherapeuticPlan {
  id: string;
  patient_id: string;
  specialty: string;
  plan_content: string;
  created_at: string;
  patients: { name: string };
}

export interface SavedDevolutiva {
  id: string;
  patient_id: string;
  specialty: string;
  content: string;
  created_at: string;
  patients: { name: string };
}

export interface SavedActivityPlan {
  id: string;
  patient_id: string;
  content: string;
  created_at: string;
  patients: { name: string };
}