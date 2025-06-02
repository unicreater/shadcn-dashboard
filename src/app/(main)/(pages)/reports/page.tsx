// import BarChart from "@/components/charts/bar-chart";
// import Card, { CardContent, CardProps } from "@/components/simple-card";
// import CustomizedLabelLineChart from "@/components/CustomizedLabelLineChart";
// import PageTitle from "@/components/page-title";
// import PieChart from "@/components/charts/pie-chart";
// import {
//   generateDashboardBarChart,
//   generateDashboardRevenue,
//   generateDashboardSales,
// } from "@/utils/dashboardUtils";
// import { fetchAgentPoliciesFromDb } from "@/utils/databaseUtils";
// import { getSalesPast12Months } from "@/utils/functionUtils";

// interface BarChartDataItem {
//   title: string;
//   props: {
//     name: string;
//     total: number;
//   }[];
// }

// export default async function Home() {
//   const cardData: CardProps[] = [];
//   const barChartData: BarChartDataItem[] = [];

//   const totalRevenue = await generateDashboardRevenue();
//   cardData.push(totalRevenue);

//   const totalSales = await generateDashboardSales();
//   cardData.push(totalSales);

//   // const barChartData = await generateDashboardBarChart();
//   const totalRevenueByMonth = await generateDashboardBarChart();

//   const formattedTotalRevenueByMonth =
//     getSalesPast12Months(totalRevenueByMonth);

//   barChartData.push({
//     title: "Revenue",
//     props: formattedTotalRevenueByMonth,
//   });

//   const agentPolicies = await fetchAgentPoliciesFromDb();

//   // for (const policy of agentPolicies) {
//   //   const policyRevenue = await generateDashboardAgentBarChart(policy.id);

//   //   const formattedPolicyRevenue = getSalesPast12Months(policyRevenue);

//   //   if (!policyRevenue) {
//   //     continue;
//   //   }

//   //   barChartData.push({
//   //     title: policy.code,
//   //     props: formattedPolicyRevenue,
//   //   });
//   // }

//   return (
//     <div className="flex flex-col gap-5 w-full">
//       <PageTitle title="Dashboard" />
//       <section className="grid w-full grid-cols-1 gap-4 gap-x-8 transition-all sm:grid-cols-2 xl:grid-cols-4">
//         {cardData.map((d, i) => (
//           <Card
//             key={i}
//             amount={d.amount}
//             description={d.description}
//             icon={d.icon}
//             label={d.label}
//           />
//         ))}
//       </section>
//       <section className="grid grid-cols-1 gap-4 transition-all lg:grid-cols-2">
//         {barChartData.map((d, i) => (
//           <CardContent key={i} className="flex justify-between gap-4">
//             <p className="p4 font-semibold">{d.title}</p>
//             <BarChart data={d.props} />
//           </CardContent>
//         ))}
//         <CardContent className="flex justify-between gap-4">
//           <p className="p4 font-semibold">Revenue By Policy</p>
//           {/* <PieChart /> */}
//         </CardContent>

//         <CardContent className="flex justify-between gap-4">
//           <p className="p4 font-semibold">Revenue By Policy</p>
//           <CustomizedLabelLineChart />
//         </CardContent>
//       </section>
//     </div>
//   );
// }

export default async function Home() {
  // const [dbData] = await Promise.all([fetchAllUsersFromDb()]);
  return (
    <div className="flex flex-col gap-5 w-full">
      {/* <PageTitle title="Users" /> */}
      <div className="space-y-2">Not configured yet</div>
      {/* <DataTable columns={userColumns} data={dbData} /> */}
    </div>
  );
}
