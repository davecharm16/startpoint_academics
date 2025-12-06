import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CreditCard, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  totalProjects: number;
  inProgress: number;
  pendingValidation: number;
  monthlyRevenue: number;
}

export function StatsCards({
  totalProjects,
  inProgress,
  pendingValidation,
  monthlyRevenue,
}: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      title: "Total Projects",
      value: totalProjects.toString(),
      description: "All time",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "In Progress",
      value: inProgress.toString(),
      description: "Currently active",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Pending Validation",
      value: pendingValidation.toString(),
      description: "Awaiting payment review",
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "This Month",
      value: formatCurrency(monthlyRevenue),
      description: "Revenue",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-md ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
