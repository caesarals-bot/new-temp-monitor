import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Clock } from 'lucide-react';

interface RoutePlaceholderProps {
  title: string;
  taskId: string;
  description?: string;
}

export function RoutePlaceholder({ title, taskId, description }: RoutePlaceholderProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Clock className="h-12 w-12 text-[--color-slate-300]" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Disponible en {taskId}
          </CardDescription>
        </CardHeader>
        {description && (
          <CardContent>
            <p className="text-sm text-[--color-text-secondary] text-center">
              {description}
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
