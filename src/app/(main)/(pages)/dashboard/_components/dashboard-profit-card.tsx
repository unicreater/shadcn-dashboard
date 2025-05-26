import Card, { CardProps } from "@/components/simple-card";
import { generateDashboardSales } from "@/utils/dashboardUtils";
import React from "react";
import {
  getDailyTotalSales,
  getMonthlyAverageSales,
  getMonthlyProfit,
  getMonthlyTotalSales,
  getWeeklyTotalSales,
  getYearlyProfit,
} from "../_actions/dashboard-connections";
import {
  formatDailyTotalSales,
  formatMonthlyAverageSales,
  formatMonthlyProfit,
  formatMonthlyTotalSales,
  formatWeeklyTotalSales,
  formatYearlyProfit,
} from "../_actions/dashboard-actions";

type Props = {};

const DashboardProfitCard = async (props: Props) => {
  const cardData: CardProps[] = [];

  const yearlyProfit = await getYearlyProfit();
  if (yearlyProfit) {
    const formattedYearlyProfit = formatYearlyProfit(yearlyProfit)!;
    // console.log(
    //   `formattedYearlyProfit : ${JSON.stringify(formattedYearlyProfit)}`
    // );
    cardData.push(formattedYearlyProfit);
  }

  const monthlyProfit = await getMonthlyProfit();

  if (monthlyProfit) {
    const formattedMonthlyProfit = formatMonthlyProfit(monthlyProfit)!;

    cardData.push(formattedMonthlyProfit);
  }

  const monthlyTotalSales = await getMonthlyTotalSales();

  if (monthlyTotalSales) {
    const formattedMonthlyTotalSales =
      formatMonthlyTotalSales(monthlyTotalSales)!;
    cardData.push(formattedMonthlyTotalSales);
  }

  const weeklyTotalSales = await getWeeklyTotalSales();

  if (weeklyTotalSales) {
    const formattedWeeklyTotalSales = formatWeeklyTotalSales(weeklyTotalSales)!;
    cardData.push(formattedWeeklyTotalSales);
  }

  const dailyTotalSales = await getDailyTotalSales();

  if (dailyTotalSales) {
    const formattedDailyTotalSales = formatDailyTotalSales(dailyTotalSales)!;
    cardData.push(formattedDailyTotalSales);
  }

  // const monthlyAverageSales = await getMonthlyAverageSales();

  // if (monthlyAverageSales) {
  //   const formattedMonthlyAverageSales =
  //     formatMonthlyAverageSales(monthlyAverageSales)!;
  //   cardData.push(formattedMonthlyAverageSales);
  // }

  // console.log(`cardData: ${JSON.stringify(cardData)}`);

  return (
    <section className="grid w-full grid-cols-1 gap-4 gap-x-8 transition-all sm:grid-cols-2 xl:grid-cols-4">
      {cardData.map((d, i) => (
        <Card
          key={i}
          amount={d.amount}
          description={d.description}
          icon={d.icon}
          label={d.label}
          indicator={d.indicator}
        />
      ))}
    </section>
  );
};

export default DashboardProfitCard;
