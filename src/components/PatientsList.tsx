import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { Patient } from "@/types";

interface PatientsListProps {
  patients: Patient[];
}

export const PatientsList = ({ patients }: PatientsListProps) => {
  if (patients.length === 0) {
    return <p className="text-muted-foreground text-center">Nenhum paciente encontrado.</p>;
  }

  return (
    <div className="space-y-4">
      {patients.map((patient) => (
        <Card key={patient.id} className="bg-card shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={patient.avatar_url || "/placeholder.svg"} alt={patient.name} />
                <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{patient.name}</p>
                <p className="text-sm text-muted-foreground">{patient.diagnosis}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="h-5 w-5 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};