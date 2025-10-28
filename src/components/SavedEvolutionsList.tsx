import React from "react";
import jsPDF from 'jspdf';
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SavedEvolution } from "@/pages/Profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Download } from "lucide-react";

interface SavedEvolutionsListProps {
  evolutions: SavedEvolution[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const formatLabel = (key: string) => {
  const result = key.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

const EvolutionItem = ({ evolution, onEdit, onDelete }: { evolution: SavedEvolution; onEdit: (id: string) => void; onDelete: (id: string) => void; }) => {
  
  const handleDownloadPDF = () => {
    toast.info("Gerando PDF da Evolução...");
    const { data, patientName, specialty } = evolution;
    
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = 20;

    doc.setFillColor(23, 73, 77);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Relatório de Evolução", pageWidth / 2, 18, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const sessionDate = data.sessionDate ? new Date(data.sessionDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Data não informada';
    doc.text(`Paciente: ${patientName}`, margin, 30);
    doc.text(`Data da Sessão: ${sessionDate}`, margin, 35);
    
    y = 55;
    doc.setTextColor(28, 25, 23);

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'patientName' || key === 'sessionDate' || !value || (Array.isArray(value) && value.length === 0)) {
        return;
      }
      
      const valueLines = doc.splitTextToSize(String(value), pageWidth - margin * 2);
      const valueHeight = valueLines.length * 5;
      const labelHeight = 6;
      
      if (y + labelHeight + valueHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(formatLabel(key), margin, y);
      y += labelHeight;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(valueLines, margin, y);
      y += valueHeight + 5;
      
      doc.setDrawColor(224, 224, 224);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        doc.text(`Gerado por MultiTea`, margin, pageHeight - 10);
    }

    const dateForFile = data.sessionDate || new Date().toISOString().split('T')[0];
    doc.save(`Evolucao_${specialty}_${patientName.replace(/\s+/g, '_')}_${dateForFile}.pdf`);
    toast.success("PDF da Evolução gerado com sucesso!");
  };

  return (
    <AccordionItem value={evolution.id}>
      <AccordionTrigger>
        <div className="flex items-center justify-between w-full pr-4">
          <div className="text-left">
            <p className="font-semibold">{evolution.patientName}</p>
            <p className="text-sm text-muted-foreground">
              Data: {new Date(evolution.submissionDate).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">{evolution.specialty}</Badge>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hidden md:flex">
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </Button>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="p-4">
          {Object.entries(evolution.data).map(([key, value]) => {
            if (key === 'patientName' || !value || (Array.isArray(value) && value.length === 0)) {
              return null;
            }
            return (
              <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-x-4 text-sm mb-2">
                <dt className="font-medium text-muted-foreground col-span-1">{formatLabel(key)}</dt>
                <dd className="text-foreground col-span-2 whitespace-pre-wrap">
                  {String(value)}
                </dd>
              </div>
            );
          })}
          <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDownloadPDF(); }}>
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(evolution.id); }}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(evolution.id); }}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export const SavedEvolutionsList = ({ evolutions, onEdit, onDelete }: SavedEvolutionsListProps) => {
  if (evolutions.length === 0) {
    return <p className="text-muted-foreground text-center py-4">Nenhum registro de evolução salvo ainda.</p>;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {evolutions.map((evolution) => (
        <EvolutionItem 
          key={evolution.id} 
          evolution={evolution} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </Accordion>
  );
};