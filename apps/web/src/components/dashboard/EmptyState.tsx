import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, actionLabel, actionHref, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {icon || <BookOpen className="w-8 h-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button size="sm">
            <Sparkles className="w-4 h-4 mr-2" /> {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
