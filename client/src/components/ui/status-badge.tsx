import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusColors = {
    active: "bg-green-100 text-green-800 hover:bg-green-100",
    paused: "bg-amber-100 text-amber-800 hover:bg-amber-100",
    planning: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    completed: "bg-slate-100 text-slate-800 hover:bg-slate-100",
  };

  const statusLabels = {
    active: "Em andamento",
    paused: "Pausado",
    planning: "Planejamento",
    completed: "Concluído",
  };

  const colorClass = statusColors[status as keyof typeof statusColors] || "bg-slate-100 text-slate-800";
  const label = statusLabels[status as keyof typeof statusLabels] || status;

  return (
    <Badge variant="outline" className={cn(colorClass, className)}>
      {label}
    </Badge>
  );
}
