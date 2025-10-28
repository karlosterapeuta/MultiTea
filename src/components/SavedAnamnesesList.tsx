import React, { useRef } from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SavedAnamnese } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Download } from "lucide-react";

interface SavedAnamnesesListProps {
  anamneses: SavedAnamnese[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const formatLabel = (key: string) => {
  if (key === 'patientId') return 'Paciente';
  const result = key.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

const AnamneseItem = ({ anamnese, onEdit, onDelete }: { anamnese: SavedAnamnese; onEdit: (id: string) => void; onDelete: (id: string) => void; }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const patientName = anamnese.patients?.name || 'Paciente';

  const handleDownloadPDF = () => {
    if (!contentRef.current) {
      toast.error("Não foi possível gerar o PDF. Tente novamente.");
      return;
    }
    
    toast.info("Gerando PDF da Anamnese...");

    const buttons = contentRef.current.querySelector('.action-buttons') as HTMLElement;
    if (buttons) buttons.style.visibility = 'hidden';

    html2canvas(contentRef.current, { scale: 2, useCORS: true }).then((canvas) => {
      if (buttons) buttons.style.visibility = 'visible';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 10, position, pdfWidth - 20, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, pdfWidth - 20, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      pdf.save(`Anamnese_${anamnese.specialty}_${patientName.replace(/\s+/g, '_')}.pdf`);
      toast.success("PDF gerado com sucesso!");

    }).catch(err => {
      if (buttons) buttons.style.visibility = 'visible';
      console.error("Erro ao gerar PDF:", err);
      toast.error("Ocorreu um erro ao gerar o PDF.");
    });
  };

  return (
    <AccordionItem value={anamnese.id}>
      <AccordionTrigger>
        <div className="flex items-center justify-between w-full pr-4">
          <div className="text-left">
            <p className="font-semibold">{patientName}</p>
            <p className="text-sm text-muted-foreground">
              Data: {new Date(anamnese.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">{anamnese.specialty}</Badge>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hidden md:flex">
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </Button>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div ref={contentRef} className="p-4">
          {Object.entries(anamnese.data).map(([key, value]) => {
            if (key === 'patientId' || !value || (Array.isArray(value) && value.length === 0)) {
              return null;
            }
            return (
              <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-x-4 text-sm mb-2">
                <dt className="font-medium text-muted-foreground col-span-1">{formatLabel(key)}</dt>
                <dd className="text-foreground col-span-2">
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </dd>
              </div>
            );
          })}
          <div className="flex justify-end space-x-2 pt-4 border-t mt-4 action-buttons">
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDownloadPDF(); }}>
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(anamnese.id); }}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(anamnese.id); }}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export const SavedAnamnesesList = ({ anamneses, onEdit, onDelete }: SavedAnamnesesListProps) => {
  if (anamneses.length === 0) {
    return <p className="text-muted-foreground text-center py-4">Nenhuma anamnese salva ainda.</p>;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {anamneses.map((anamnese) => (
        <AnamneseItem 
          key={anamnese.id} 
          anamnese={anamnese} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </Accordion>
  );
};