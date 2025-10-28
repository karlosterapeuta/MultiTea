import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EvolutionForm, EvolutionFormData } from "./EvolutionForm";
import { SavedEvolution } from "@/pages/Profile";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditEvolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  evolution: SavedEvolution | null;
  onSave: (data: EvolutionFormData) => void;
}

export const EditEvolutionDialog = ({ isOpen, onClose, evolution, onSave }: EditEvolutionDialogProps) => {
  if (!evolution) return null;

  const formId = "edit-evolution-form";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar Registro de Evolução</DialogTitle>
          <DialogDescription>
            Modifique os dados da evolução de {evolution.patientName}.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-4 border rounded-md">
          <EvolutionForm
            id={formId}
            specialty={evolution.specialty}
            initialData={evolution.data}
            onSave={onSave}
            hideButtons
          />
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form={formId}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};