import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

type AdminStatCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  hint: string;
};

const AdminStatCard = ({ label, value, icon, hint }: AdminStatCardProps) => {
  return (
    <Card className="border-white/50 bg-white/70 py-0 shadow-xl backdrop-blur-2xl">
      <CardContent className="flex items-start justify-between p-6">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
          <p className="mt-4 text-4xl font-serif">{value}</p>
          <p className="mt-3 text-sm text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">{icon}</div>
      </CardContent>
    </Card>
  );
};

export default AdminStatCard;
