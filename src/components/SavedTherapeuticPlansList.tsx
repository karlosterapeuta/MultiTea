import React from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SavedTherapeuticPlan, ProfileData } from "@/pages/Profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";

interface SavedTherapeuticPlansListProps {
  plans: SavedTherapeuticPlan[];
  onDelete: (id: string) => void;
  profileData: ProfileData;
}

const PlanItem = ({ plan, onDelete, profileData }: { plan: SavedTherapeuticPlan; onDelete: (id: string) => void; profileData: ProfileData; }) => {
  
  const handleDownloadPDF = async () => {
    toast.info("Gerando PDF do Plano Terapêutico...");

    const pdfContainer = document.createElement('div');
    pdfContainer.style.position = 'absolute';
    pdfContainer.style.left = '-9999px';
    pdfContainer.style.width = '210mm';
    pdfContainer.style.backgroundColor = 'white';
    document.body.appendChild(pdfContainer);

    const pdfContent = document.createElement('div');
    pdfContent.className = 'p-8 font-sans text-gray-800';
    
    const lines = plan.planContent.split('\n');
    let currentList: HTMLUListElement | null = null;

    const header = document.createElement('div');
    header.className = 'text-center mb-8';
    const title = document.createElement('h1');
    title.className = 'text-2xl font-bold text-primary';
    title.innerText = lines[0];
    const subtitle = document.createElement('h2');
    subtitle.className = 'text-lg text-muted-foreground';
    subtitle.innerText = lines[1];
    header.appendChild(title);
    header.appendChild(subtitle);
    pdfContent.appendChild(header);

    const infoContainer = document.createElement('div');
    infoContainer.className = 'grid grid-cols-3 gap-4 mb-8 text-sm';
    for (let i = 3; i <= 5; i++) {
      if (!lines[i]) continue;
      const infoDiv = document.createElement('div');
      const [label, ...valueParts] = lines[i].split(':');
      const value = valueParts.join(':').trim();
      infoDiv.innerHTML = `<strong class="text-muted-foreground">${label}:</strong><p>${value}</p>`;
      infoContainer.appendChild(infoDiv);
    }
    pdfContent.appendChild(infoContainer);
    
    lines.slice(7).forEach(line => {
      const trimmedLine = line.trim();
      if (/^\d+\./.test(trimmedLine)) {
        currentList = null;
        const h3 = document.createElement('h3');
        h3.className = 'text-lg font-semibold text-primary mt-6 mb-2 pb-1 border-b-2 border-primary/20';
        h3.innerText = trimmedLine;
        pdfContent.appendChild(h3);
      } else if (trimmedLine.startsWith('-')) {
        if (!currentList) {
          currentList = document.createElement('ul');
          currentList.className = 'list-disc pl-5 space-y-1';
          pdfContent.appendChild(currentList);
        }
        const li = document.createElement('li');
        li.innerText = trimmedLine.substring(1).trim();
        currentList.appendChild(li);
      } else if (trimmedLine) {
        currentList = null;
        const p = document.createElement('p');
        p.className = 'text-justify';
        p.innerText = trimmedLine;
        pdfContent.appendChild(p);
      }
    });

    pdfContainer.appendChild(pdfContent);

    try {
      const canvas = await html2canvas(pdfContainer, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = -heightLeft;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`Plano_Terapeutico_${plan.specialty}_${plan.patientName.replace(/\s+/g, '_')}.pdf`);
      toast.success("PDF gerado com sucesso!");
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      toast.error("Ocorreu um erro ao gerar o PDF.");
    } finally {
      document.body.removeChild(pdfContainer);
    }
  };

  return (
    <AccordionItem value={plan.id}>
      <AccordionTrigger>
        <div className="flex items-center justify-between w-full pr-4">
          <div className="text-left">
            <p className="font-semibold">{plan.patientName}</p>
            <p className="text-sm text-muted-foreground">
              Data: {new Date(plan.submissionDate).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <Badge variant="outline">{plan.specialty}</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="p-4 space-y-4">
          <pre className="whitespace-pre-wrap font-sans text-sm bg-muted/50 p-4 rounded-md">{plan.planContent}</pre>
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

export const SavedTherapeuticPlansList = ({ plans, onDelete, profileData }: SavedTherapeuticPlansListProps) => {
  if (plans.length === 0) {
    return <p className="text-muted-foreground text-center py-4">Nenhum plano terapêutico salvo ainda.</p>;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {plans.map((plan) => (
        <PlanItem 
          key={plan.id} 
          plan={plan} 
          onDelete={onDelete} 
          profileData={profileData}
        />
      ))}
    </Accordion>
  );
};