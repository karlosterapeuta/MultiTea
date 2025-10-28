"use client";

import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AnamneseForm, AnamneseFormData } from "./AnamneseForm";
import { ProfileData } from "@/pages/Profile";
import { Patient, SavedAnamnese, SavedEvolution, SavedReport, SavedTherapeuticPlan, SavedDevolutiva } from "@/types";
import { EvolutionForm, EvolutionFormData } from "./EvolutionForm";
import { TherapeuticPlanForm } from "./TherapeuticPlanForm";
import { Input } from "@/components/ui/input";
import { SavedAnamnesesList } from "./SavedAnamnesesList";
import { SavedEvolutionsList } from "./SavedEvolutionsList";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { ReportWizard, ReportWizardData } from "./ReportWizard";
import { SavedReportsList } from "./SavedReportsList";
import { SavedTherapeuticPlansList } from "./SavedTherapeuticPlansList";
import { DevolutivaForm } from "./DevolutivaForm";
import { SavedDevolutivasList } from "./SavedDevolutivasList";

const profileFormSchema = z.object({
  firstName: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  lastName: z.string().default(''),
  email: z.string().email({ message: "Email inválido." }),
  phone: z.string().optional(),
  address: z.string().optional(),
  specialty: z.string().min(1, { message: "Selecione uma especialidade." }),
  crp: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const specialtyToCouncil: Record<string, string> = {
  "Psicologia": "CRP", "Nutrição": "CRN", "Fonoaudiologia": "CREFONO", "Fisioterapia": "CREFITO", "Terapia Ocupacional": "CREFITO",
};

interface ProfileTabsProps {
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  profileData: ProfileData;
  onProfileUpdate: (data: ProfileData) => void;
  patients: Patient[];
  savedAnamneses: SavedAnamnese[];
  onSaveAnamnese: (data: AnamneseFormData) => void;
  onEditAnamnese: (id: string) => void;
  onDeleteAnamnese: (id: string) => void;
  savedEvolutions: SavedEvolution[];
  onSaveEvolution: (data: EvolutionFormData) => void;
  onEditEvolution: (id: string) => void;
  onDeleteEvolution: (id: string) => void;
  savedReports: SavedReport[];
  onSaveReport: (data: ReportWizardData) => void;
  onDeleteReport: (id: string) => void;
  savedPlans: SavedTherapeuticPlan[];
  onSavePlan: (data: { patientName: string; specialty: string; planContent: string; patientId: string; }) => void;
  onDeletePlan: (id: string) => void;
  savedDevolutivas: SavedDevolutiva[];
  onSaveDevolutiva: (data: { patientName: string; specialty: string; content: string; patientId: string; }) => void;
  onDeleteDevolutiva: (id: string) => void;
}

export const ProfileTabs = ({ 
  isEditing, setIsEditing, profileData, onProfileUpdate, patients,
  savedAnamneses, onSaveAnamnese, onEditAnamnese, onDeleteAnamnese,
  savedEvolutions, onSaveEvolution, onEditEvolution, onDeleteEvolution,
  savedReports, onSaveReport, onDeleteReport,
  savedPlans, onSavePlan, onDeletePlan,
  savedDevolutivas, onSaveDevolutiva, onDeleteDevolutiva
}: ProfileTabsProps) => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profileData,
  });

  useEffect(() => {
    form.reset(profileData);
  }, [profileData, form]);

  const currentSpecialty = form.watch("specialty");

  const handleCancel = () => {
    form.reset(profileData);
    setIsEditing(false);
  };

  const getCouncilLabel = () => {
    if (specialtyToCouncil[currentSpecialty]) return specialtyToCouncil[currentSpecialty];
    if (["Psicomotricidade", "Psicopedagogia", "Musicoterapia"].includes(currentSpecialty)) return "Nº de Associação";
    return "Registro Profissional";
  };

  return (
    <Tabs defaultValue="dados-cadastrais" className="w-full">
      <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto">
        <TabsTrigger value="dados-cadastrais">Dados</TabsTrigger>
        <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
        <TabsTrigger value="evolucao">Evolução</TabsTrigger>
        <TabsTrigger value="relatorio">Relatório</TabsTrigger>
        <TabsTrigger value="plano-terapeutico">Plano</TabsTrigger>
        <TabsTrigger value="devolutiva">Devolutiva</TabsTrigger>
      </TabsList>

      <TabsContent value="dados-cadastrais" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Dados Cadastrais</CardTitle>
            <CardDescription>Gerencie suas informações pessoais e profissionais.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => {
                onProfileUpdate({
                  firstName: data.firstName,
                  lastName: data.lastName,
                  email: data.email,
                  phone: data.phone,
                  address: data.address,
                  specialty: data.specialty,
                  crp: data.crp,
                  avatarUrl: profileData.avatarUrl
                });
              })} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} disabled={!isEditing} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Sobrenome</FormLabel><FormControl><Input {...field} disabled={!isEditing} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} disabled={!isEditing} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Endereço</FormLabel><FormControl><Input {...field} disabled={!isEditing} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="specialty" render={({ field }) => (<FormItem><FormLabel>Especialidade</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Psicologia">Psicologia</SelectItem><SelectItem value="Fonoaudiologia">Fonoaudiologia</SelectItem><SelectItem value="Terapia Ocupacional">Terapia Ocupacional</SelectItem><SelectItem value="Psicomotricidade">Psicomotricidade</SelectItem><SelectItem value="Psicopedagogia">Psicopedagogia</SelectItem><SelectItem value="Musicoterapia">Musicoterapia</SelectItem><SelectItem value="Fisioterapia">Fisioterapia</SelectItem><SelectItem value="Nutrição">Nutrição</SelectItem><SelectItem value="Padrão">Outra / Padrão</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="crp" render={({ field }) => (<FormItem><FormLabel>{getCouncilLabel()}</FormLabel><FormControl><Input {...field} disabled={!isEditing} /></FormControl><FormMessage /></FormItem>)} />
                {isEditing && (<div className="flex space-x-2 pt-2"><Button type="submit">Salvar Alterações</Button><Button variant="outline" type="button" onClick={handleCancel}>Cancelar</Button></div>)}
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="anamnese" className="mt-4 space-y-6">
        <Card><CardHeader><CardTitle>Anamneses Salvas</CardTitle><CardDescription>Visualize, edite ou exclua as anamneses preenchidas.</CardDescription></CardHeader><CardContent><SavedAnamnesesList anamneses={savedAnamneses} onEdit={onEditAnamnese} onDelete={onDeleteAnamnese} /></CardContent></Card>
        <Collapsible><Card><CollapsibleTrigger asChild><div className="flex w-full cursor-pointer items-center justify-between p-4"><CardHeader className="p-0"><CardTitle>Criar Nova Anamnese</CardTitle><CardDescription>Clique aqui para preencher um novo formulário.</CardDescription></CardHeader><Button variant="ghost" size="sm" className="w-9 p-0"><ChevronsUpDown className="h-4 w-4" /><span className="sr-only">Toggle</span></Button></div></CollapsibleTrigger><CollapsibleContent><CardContent className="pt-4"><AnamneseForm specialty={currentSpecialty} onSave={onSaveAnamnese} patients={patients} /></CardContent></CollapsibleContent></Card></Collapsible>
      </TabsContent>

      <TabsContent value="evolucao" className="mt-4 space-y-6">
        <Card><CardHeader><CardTitle>Evoluções Salvas</CardTitle><CardDescription>Visualize, edite ou exclua os registros de evolução.</CardDescription></CardHeader><CardContent><SavedEvolutionsList evolutions={savedEvolutions} onEdit={onEditEvolution} onDelete={onDeleteEvolution} /></CardContent></Card>
        <Collapsible><Card><CollapsibleTrigger asChild><div className="flex w-full cursor-pointer items-center justify-between p-4"><CardHeader className="p-0"><CardTitle>Criar Novo Registro de Evolução</CardTitle><CardDescription>Clique aqui para preencher um novo registro.</CardDescription></CardHeader><Button variant="ghost" size="sm" className="w-9 p-0"><ChevronsUpDown className="h-4 w-4" /><span className="sr-only">Toggle</span></Button></div></CollapsibleTrigger><CollapsibleContent><CardContent className="pt-4"><EvolutionForm specialty={currentSpecialty} onSave={onSaveEvolution} patients={patients} /></CardContent></CollapsibleContent></Card></Collapsible>
      </TabsContent>

      <TabsContent value="relatorio" className="mt-4 space-y-6">
        <Card><CardHeader><CardTitle>Relatórios Salvos</CardTitle><CardDescription>Visualize, baixe ou exclua os relatórios gerados.</CardDescription></CardHeader><CardContent><SavedReportsList reports={savedReports} onDelete={onDeleteReport} profileData={profileData} /></CardContent></Card>
        <Collapsible><Card><CollapsibleTrigger asChild><div className="flex w-full cursor-pointer items-center justify-between p-4"><CardHeader className="p-0"><CardTitle>Criar Novo Relatório</CardTitle><CardDescription>Clique aqui para abrir o assistente de criação.</CardDescription></CardHeader><Button variant="ghost" size="sm" className="w-9 p-0"><ChevronsUpDown className="h-4 w-4" /><span className="sr-only">Toggle</span></Button></div></CollapsibleTrigger><CollapsibleContent><CardContent className="pt-4"><ReportWizard specialty={currentSpecialty} profileData={profileData} onSaveReport={onSaveReport} patients={patients} /></CardContent></CollapsibleContent></Card></Collapsible>
      </TabsContent>

      <TabsContent value="plano-terapeutico" className="mt-4 space-y-6">
        <Card><CardHeader><CardTitle>Planos Terapêuticos Salvos</CardTitle><CardDescription>Visualize, baixe ou exclua os planos gerados.</CardDescription></CardHeader><CardContent><SavedTherapeuticPlansList plans={savedPlans} onDelete={onDeletePlan} profileData={profileData} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Criar Novo Plano Terapêutico</CardTitle><CardDescription>Defina e acompanhe o plano de tratamento.</CardDescription></CardHeader><CardContent><TherapeuticPlanForm specialty={currentSpecialty} therapistName={`${profileData.firstName} ${profileData.lastName}`.trim()} onSavePlan={onSavePlan} patients={patients} /></CardContent></Card>
      </TabsContent>

      <TabsContent value="devolutiva" className="mt-4 space-y-6">
        <Card><CardHeader><CardTitle>Devolutivas Salvas</CardTitle><CardDescription>Visualize, baixe ou exclua as devolutivas geradas.</CardDescription></CardHeader><CardContent><SavedDevolutivasList devolutivas={savedDevolutivas} onDelete={onDeleteDevolutiva} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Gerar Nova Devolutiva</CardTitle><CardDescription>Crie um relatório de devolutiva para pais ou escola.</CardDescription></CardHeader><CardContent><DevolutivaForm specialty={currentSpecialty} therapistName={`${profileData.firstName} ${profileData.lastName}`.trim()} therapistCouncil={profileData.crp || ""} onSave={onSaveDevolutiva} patients={patients} /></CardContent></Card>
      </TabsContent>
    </Tabs>
  );
};