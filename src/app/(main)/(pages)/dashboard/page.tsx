import PageTitle from "@/components/page-title";
import DashboardProfitCard from "./_components/dashboard-profit-card";
import DashboardGraph from "./_components/dashboard-graph";

const DashboardPage = async () => {
  return (
    <div className="flex flex-col gap-4 relative">
      <PageTitle title="Dashboard" />
      <div className="flex flex-col gap-10 p-6">
        <DashboardProfitCard />
        <DashboardGraph />
      </div>
    </div>
  );
};

export default DashboardPage;
