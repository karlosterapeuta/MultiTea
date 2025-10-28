import React from "react";
import jsPDF from 'jspdf';
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SavedDevolutiva } from "@/pages/Profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";

interface SavedDevolutivasListProps {
  devolutivas: SavedDevolutiva[];
  onDelete: (id: string) => void;
}

const DevolutivaItem = ({ devolutiva, onDelete }: { devolutiva: SavedDevolutiva; onDelete: (id: string) => void; }) => {
  
  const handleDownloadPDF = () => {
    toast.info("Gerando PDF da devolutiva...");
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textLines = doc.splitTextToSize(devolutiva.content, pageWidth - margin * 2);
    doc.text(textLines, margin, margin);
    doc.save(`Devolutiva_${devolutiva.patientName.replace(/\s+/g, '_')}.pdf`);
    toast.success("PDF gerado com sucesso!");
  };

  return (
    <AccordionItem value={devolutiva.id}>
      <AccordionTrigger>
        <div className="flex items-center justify-between w-full pr-4">
          <div className="text-left">
            <p className="font-semibold">{devolutiva.patientName}</p>
            <p className="text-sm text-muted-foreground">
              Data: {new Date(devolutiva.submissionDate).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <Badge variant="outline">{devolutiva.specialty}</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="p-4 space-y-4">
          <pre className="whitespace-pre-wrap font-sans text-sm bg-muted/50 p-4 rounded-md">{devolutiva.content}</pre>
          <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDownloadPDF(); }}>
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(devolutiva.id); }}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export const SavedDevolutivasList = ({ devolutivas, onDelete }: SavedDevolutivasListProps) => {
  if (devolutivas.length === 0) {
    return <p className="text-muted-foreground text-center py-4">Nenhuma devolutiva salva ainda.</p>;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {devolutivas.map((item) => (
        <DevolutivaItem 
          key={item.id} 
          devolutiva={item} 
          onDelete={onDelete} 
        />
      ))}
    </Accordion>
  );
};