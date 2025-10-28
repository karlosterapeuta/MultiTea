"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, Sparkles, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Demand, Diagnosis } from "@/data/activities";
import { Patient } from "@/types";

interface ActivityPlanFormProps {
  onSavePlan: (data: { patientId: string; content: string }) => void;
  diagnoses: Diagnosis[];
  patients: Patient[];
  specialty: string;
  therapistName: string;
}

export const ActivityPlanForm = ({ onSavePlan, diagnoses, patients, specialty, therapistName }: ActivityPlanFormProps) => {
  const [planContent, setPlanContent] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedDemands, setSelectedDemands] = useState<Demand[]>([]);

  const handleDemandChange = (demand: Demand) => {
    setSelectedDemands(prev =>
      prev.some(d => d.name === demand.name)
        ? prev.filter(d => d.name !== demand.name)
        : [...prev, demand]
    );
  };

  const generatePlan = () => {
    if (!selectedPatientId) {
      toast.error("Por favor, selecione um paciente primeiro.");
      return;
    }
    if (selectedDemands.length === 0) {
      toast.error("Por favor, selecione pelo menos uma demanda para gerar o plano.");
      return;
    }

    const patientName = patients.find(p => p.id === selectedPatientId)?.name || "";
    
    let content = `PLANO DE ATIVIDADES - ${specialty.toUpperCase()}\n\n`;
    content += `Paciente: ${patientName}\n`;
    content += `Data: ${new Date().toLocaleDateString('pt-BR')}\n`;
    content += `Terapeuta Responsável: ${therapistName}\n\n`;
    
    content += `1. FOCO TERAPÊUTICO (DEMANDAS SELECIONADAS):\n`;
    selectedDemands.forEach(demand => {
      content += `   - ${demand.name}\n`;
    });
    content += `\n`;

    content += `2. SUGESTÕES DE ATIVIDADES:\n\n`;

    selectedDemands.forEach(demand => {
      content += `   PARA A DEMANDA: ${demand.name.toUpperCase()}\n\n`;
      demand.activities.forEach((activity) => {
        content += `   - Atividade: ${activity.title}\n`;
        content += `     - Descrição: ${activity.description}\n`;
        content += `     - Materiais: ${activity.materials}\n\n`;
      });
    });

    setPlanContent(content.trim());
    toast.success("Plano de atividades gerado com sucesso!");
  };

  const handleSave = () => {
    if (!selectedPatientId || !planContent.trim()) {
      toast.error("Selecione um paciente e gere o conteúdo antes de salvar.");
      return;
    }
    onSavePlan({
      patientId: selectedPatientId,
      content: planContent,
    });
    setSelectedPatientId("");
    setSelectedDemands([]);
    setPlanContent("");
  };

  const handleDownloadPDF = () => {
    if (!planContent.trim()) {
      toast.error("Gere um plano de atividades antes de baixar o PDF.");
      return;
    }
    const patientName = patients.find(p => p.id === selectedPatientId)?.name || "paciente";
    toast.info("Gerando PDF...");
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textLines = doc.splitTextToSize(planContent, pageWidth - margin * 2);
    doc.text(textLines, margin, margin);
    doc.save(`Plano_Atividades_${patientName.replace(/\s+/g, '_')}.pdf`);
    toast.success("PDF gerado com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="font-bold text-lg">1. Nome do Paciente</Label>
          <Select onValueChange={setSelectedPatientId} value={selectedPatientId}>
            <SelectTrigger><SelectValue placeholder="Selecione um paciente" /></SelectTrigger>
            <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="font-bold text-lg">2. Principais Demandas</Label>
          <div className="p-4 border rounded-md max-h-48 overflow-y-auto">
            <Accordion type="multiple" className="w-full">
              {diagnoses.map(diagnosis => (
                <AccordionItem value={diagnosis.name} key={diagnosis.name}>
                  <AccordionTrigger className="font-semibold">{diagnosis.name}</AccordionTrigger>
                  <AccordionContent className="pl-4 pt-2 space-y-2">
                    {diagnosis.demands.map(demand => (
                      <div key={demand.name} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${diagnosis.name}-${demand.name}`}
                          checked={selectedDemands.some(d => d.name === demand.name)}
                          onCheckedChange={() => handleDemandChange(demand)}
                        />
                        <Label htmlFor={`${diagnosis.name}-${demand.name}`} className="font-normal cursor-pointer">{demand.name}</Label>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={generatePlan} className="w-full sm:w-auto">
            <Sparkles className="mr-2 h-4 w-4" /> 3. Gerar Sugestões
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" /> Salvar Plano
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Baixar PDF
          </Button>
        </div>
        <div>
          <Textarea
            placeholder="Selecione um paciente, escolha as demandas e clique em 'Gerar Sugestões' para começar."
            value={planContent}
            onChange={(e) => setPlanContent(e.target.value)}
            rows={25}
            className="font-mono text-sm bg-muted/20"
          />
        </div>
      </div>
    </div>
  );
};