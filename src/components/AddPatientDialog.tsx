import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect } from "react";

const patientFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  birth_date: z.string().optional(),
  diagnosis: z.string().optional(),
  mother_name: z.string().optional(),
  phone: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface AddPatientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (patientData: PatientFormValues) => void;
}

export const AddPatientDialog = ({ isOpen, onClose, onAddPatient }: AddPatientDialogProps) => {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
      birth_date: "",
      diagnosis: "",
      mother_name: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const onSubmit = (data: PatientFormValues) => {
    onAddPatient(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Paciente</DialogTitle>
          <DialogDescription>
            Preencha os dados para adicionar um novo paciente à sua lista.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <FormLabel className="text-left sm:text-right">Nome</FormLabel>
                  <FormControl className="col-span-full sm:col-span-3">
                    <Input placeholder="Nome completo do paciente" {...field} />
                  </FormControl>
                  <FormMessage className="col-start-1 sm:col-start-2 col-span-full sm:col-span-3" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <FormLabel className="text-left sm:text-right">Nascimento</FormLabel>
                  <FormControl className="col-span-full sm:col-span-3">
                    <Input placeholder="DD/MM/AAAA" {...field} />
                  </FormControl>
                  <FormMessage className="col-start-1 sm:col-start-2 col-span-full sm:col-span-3" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <FormLabel className="text-left sm:text-right">Diagnóstico</FormLabel>
                  <FormControl className="col-span-full sm:col-span-3">
                    <Input placeholder="Ex: TEA, TDAH..." {...field} />
                  </FormControl>
                  <FormMessage className="col-start-1 sm:col-start-2 col-span-full sm:col-span-3" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mother_name"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <FormLabel className="text-left sm:text-right">Nome da Mãe</FormLabel>
                  <FormControl className="col-span-full sm:col-span-3">
                    <Input placeholder="Nome completo da mãe" {...field} />
                  </FormControl>
                  <FormMessage className="col-start-1 sm:col-start-2 col-span-full sm:col-span-3" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <FormLabel className="text-left sm:text-right">Telefone</FormLabel>
                  <FormControl className="col-span-full sm:col-span-3">
                    <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                  </FormControl>
                  <FormMessage className="col-start-1 sm:col-start-2 col-span-full sm:col-span-3" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};