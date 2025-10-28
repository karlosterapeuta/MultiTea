import React from "react";
import jsPDF from 'jspdf';
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SavedReport, ProfileData } from "@/pages/Profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";

interface SavedReportsListProps {
  reports: SavedReport[];
  onDelete: (id: string) => void;
  profileData: ProfileData;
}

const reportSections = [
  { id: "informacoesBasicas", title: "1. Informações Básicas" },
  { id: "objetivosTerapeuticos", title: "2. Objetivos Terapêuticos" },
  { id: "atividadesRealizadas", title: "3. Atividades Realizadas" },
  { id: "evolucaoPaciente", title: "4. Evolução do Paciente" },
  { id: "encaminhamentosRecomendacoes", title: "5. Encaminhamentos e Recomendações" },
  { id: "conclusao", title: "6. Conclusão" },
  { id: "observacoesComplementares", title: "7. Observações Complementares" },
];

const ReportItem = ({ report, onDelete, profileData }: { report: SavedReport; onDelete: (id: string) => void; profileData: ProfileData; }) => {
  
  const handleDownloadPDF = () => {
    toast.info("Gerando PDF do relatório...");
    const { data, patientName, specialty } = report;
    const { content, startDate, endDate } = data;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = 0;

    // --- Colors ---
    const primaryColor = '#17494D';
    const textColor = '#333333';
    const lightTextColor = '#777777';
    const sectionBgColor = '#F8F9FA';
    const headerTextColor = '#FFFFFF';

    const checkPageBreak = (heightNeeded: number) => {
      if (y + heightNeeded > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // --- Header ---
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, pageWidth, 30, 'F');
    y = 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(headerTextColor);
    doc.text(profileData.name, pageWidth - margin, y + 3, { align: 'right' });
    doc.setFont("helvetica", "normal");
    doc.text(profileData.specialty, pageWidth - margin, y + 8, { align: 'right' });
    if (profileData.crp) {
      doc.text(profileData.crp, pageWidth - margin, y + 13, { align: 'right' });
    }
    y = 40;

    // --- Title ---
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textColor);
    doc.text("Relatório de Acompanhamento", pageWidth / 2, y, { align: 'center' });
    y += 15;

    // --- Patient Info Section ---
    doc.setFillColor(sectionBgColor);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 20, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(lightTextColor);
    doc.text("PACIENTE", margin + 5, y + 7);
    doc.text("PERÍODO", margin + 100, y + 7);

    doc.setFontSize(12);
    doc.setTextColor(textColor);
    doc.setFont("helvetica", "bold");
    doc.text(patientName, margin + 5, y + 14);
    const period = (startDate && endDate) 
        ? `${new Date(startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} a ${new Date(endDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`
        : "Não especificado";
    doc.text(period, margin + 100, y + 14);
    y += 30;

    // --- Body ---
    reportSections.forEach(section => {
      const sectionContent = content[section.id];
      if (sectionContent && sectionContent.trim()) {
        const titleLines = doc.splitTextToSize(section.title.toUpperCase(), pageWidth - margin * 2);
        const contentLines = doc.splitTextToSize(sectionContent, pageWidth - margin * 2 - 5);
        const heightNeeded = (titleLines.length * 8) + (contentLines.length * 5) + 10;
        
        checkPageBreak(heightNeeded);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(primaryColor);
        doc.text(titleLines, margin, y);
        y += titleLines.length * 8;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(textColor);
        doc.text(contentLines, margin + 5, y);
        y += contentLines.length * 5 + 10;
      }
    });

    // --- Footer ---
    const footerHeight = 30;
    checkPageBreak(footerHeight + 20);
    y = pageHeight - margin - footerHeight;

    doc.setDrawColor(textColor);
    doc.line(pageWidth / 2 - 40, y + 2, pageWidth / 2 + 40, y + 2);
    doc.setFontSize(10);
    doc.text(profileData.name, pageWidth / 2, y + 8, { align: 'center' });
    if (profileData.crp) {
        doc.text(profileData.crp, pageWidth / 2, y + 13, { align: 'center' });
    }

    // --- Page numbers ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(lightTextColor);
        doc.text(
            `Página ${i} de ${pageCount}`,
            pageWidth - margin,
            pageHeight - 10,
            { align: 'right' }
        );
        doc.text(
            `Gerado por MultiTea em ${new Date().toLocaleDateString('pt-BR')}`,
            margin,
            pageHeight - 10
        );
    }

    doc.save(`Relatorio_${specialty}_${patientName.replace(/\s+/g, '_')}.pdf`);
    toast.success("PDF gerado com sucesso!");
  };

  return (
    <AccordionItem value={report.id}>
      <AccordionTrigger>
        <div className="flex items-center justify-between w-full pr-4">
          <div className="text-left">
            <p className="font-semibold">{report.patientName}</p>
            <p className="text-sm text-muted-foreground">
              Data: {new Date(report.submissionDate).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <Badge variant="outline">{report.specialty}</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="p-4 space-y-4 prose prose-sm max-w-none">
          {Object.entries(report.data.content).map(([key, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) {
              return null;
            }
            const section = reportSections.find(s => s.id === key);
            return (
              <div key={key}>
                <h4 className="font-bold">{section ? section.title : key}</h4>
                <p className="whitespace-pre-wrap">{String(value)}</p>
              </div>
            );
          })}
          <div className="flex justify-end space-x-2 pt-4 border-t mt-4 not-prose">
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDownloadPDF(); }}>
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(report.id); }}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export const SavedReportsList = ({ reports, onDelete, profileData }: SavedReportsListProps) => {
  if (reports.length === 0) {
    return <p className="text-muted-foreground text-center py-4">Nenhum relatório salvo ainda.</p>;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {reports.map((report) => (
        <ReportItem 
          key={report.id} 
          report={report} 
          onDelete={onDelete} 
          profileData={profileData}
        />
      ))}
    </Accordion>
  );
};