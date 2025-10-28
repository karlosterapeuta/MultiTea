import React from "react";
import jsPDF from 'jspdf';
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";
import { SavedActivityPlan } from "@/types";

interface SavedActivityPlansListProps {
  plans: SavedActivityPlan[];
  onDelete: (id: string) => void;
}

const PlanItem = ({ plan, onDelete }: { plan: SavedActivityPlan; onDelete: (id: string) => void; }) => {
  const patientName = plan.patients?.name || 'Paciente';

  const handleDownloadPDF = () => {
    toast.info("Gerando PDF do plano de atividades...");
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textLines = doc.splitTextToSize(plan.content, pageWidth - margin * 2);
    doc.text(textLines, margin, margin);
    doc.save(`Plano_Atividades_${patientName.replace(/\s+/g, '_')}.pdf`);
    toast.success("PDF gerado com sucesso!");
  };

  return (
    <AccordionItem value={plan.id}>
      <AccordionTrigger>
        <div className="flex items-center justify-between w-full pr-4">
          <div className="text-left">
            <p className="font-semibold">{patientName}</p>
            <p className="text-sm text-muted-foreground">
              Data: {new Date(plan.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <Badge variant="outline">Plano de Atividades</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="p-4 space-y-4">
          <pre className="whitespace-pre-wrap font-sans text-sm bg-muted/50 p-4 rounded-md">{plan.content}</pre>
          <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDownloadPDF(); }}>
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(plan.id); }}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export const SavedActivityPlansList = ({ plans, onDelete }: SavedActivityPlansListProps) => {
  if (plans.length === 0) {
    return <p className="text-muted-foreground text-center py-4">Nenhum plano de atividades salvo ainda.</p>;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {plans.map((plan) => (
        <PlanItem 
          key={plan.id} 
          plan={plan} 
          onDelete={onDelete} 
        />
      ))}
    </Accordion>
  );
};