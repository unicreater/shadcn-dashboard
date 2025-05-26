import { Carrot, CreditCard, DollarSign } from "lucide-react";

export const formatYearlyProfit = (revenue: any[]) => {
  try {
    // Format the total revenue with comma separator
    const formattedTotalRevenue = parseFloat(
      revenue[0].totalprofit
    ).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    let yearPercentageChange = 100;
    // Calculate the percentage change in profit
    if (revenue.length > 1) {
      yearPercentageChange =
        ((revenue[0].totalprofit - revenue[1] ? revenue[1].totalprofit : 0) /
        revenue[1]
          ? revenue[1].totalprofit
          : 0) * 100;
    }

    const totalRevenue = {
      label: "Total Revenue",
      amount: `$${formattedTotalRevenue}`,
      description: `${revenue[0].year}`,
      icon: DollarSign,
      indicator: true,
    };

    if (totalRevenue) return totalRevenue;
  } catch (err) {
    console.error(err);
  }
};
export const formatMonthlyProfit = (revenue: any[]) => {
  try {
    // console.log(`revenue: ${JSON.stringify(revenue)}`);
    // Format the total revenue with comma separator
    const formattedTotalSales = parseFloat(
      revenue[0].totalprofit
    ).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    let monthPercentageChange = 100;

    // Calculate the percentage change in profit
    if (revenue[1]) {
      monthPercentageChange =
        ((revenue[0].totalprofit - revenue[1].totalprofit) /
          revenue[1].totalprofit) *
        100;
    }

    const totalSales = {
      label: "Sales",
      amount: `+${formattedTotalSales}`,
      description: `${
        monthPercentageChange > 0 ? "+" : ""
      }${monthPercentageChange.toFixed(0)}% from last month`,
      icon: CreditCard,
      indicator: monthPercentageChange > 0,
    };

    if (totalSales) return totalSales;
  } catch (err) {
    console.error(err);
  }
};
export const formatMonthlyTotalSales = (revenue: any[]) => {
  try {
    // Format the total revenue with comma separator
    const formattedTotalSales = parseInt(revenue[0].totalsales);

    // Calculate the percentage change in profit
    let monthPercentageChange = 100;

    if (revenue[1]) {
      monthPercentageChange =
        ((revenue[0].totalsales - revenue[1].totalsales) /
          revenue[1].totalsales) *
        100;
    }

    if (!monthPercentageChange || monthPercentageChange === Infinity) {
      monthPercentageChange = 100;
    }

    const totalSales = {
      label: "Total Orders this month",
      amount: `${formattedTotalSales}`,
      description: `${
        monthPercentageChange > 0 ? "+" : ""
      }${monthPercentageChange.toFixed(0)}% from last month`,
      icon: Carrot,
      indicator: monthPercentageChange > 0,
    };

    if (totalSales) return totalSales;
  } catch (err) {
    console.error(err);
  }
};
export const formatWeeklyTotalSales = (revenue: any[]) => {
  try {
    // Format the total revenue with comma separator
    const formattedTotalSales = parseInt(revenue[0].totalsales);

    // Calculate the percentage change in profit
    let weeklyPercentageChange =
      ((revenue[0].totalsales - revenue[1].totalsales) /
        revenue[1].totalsales) *
      100;

    if (!weeklyPercentageChange || weeklyPercentageChange === Infinity) {
      weeklyPercentageChange = 100;
    }

    const totalSales = {
      label: "Total Orders this week",
      amount: `${formattedTotalSales}`,
      description: `${
        weeklyPercentageChange > 0 ? "+" : ""
      }${weeklyPercentageChange.toFixed(0)}% from last week`,
      icon: Carrot,
      indicator: weeklyPercentageChange > 0,
    };

    if (totalSales) return totalSales;
  } catch (err) {
    console.error(err);
  }
};
export const formatDailyTotalSales = (revenue: any[]) => {
  try {
    // Format the total revenue with comma separator
    const formattedTotalSales = parseInt(revenue[0].totalsales);

    // Calculate the percentage change in profit
    let dailyPercentageChange =
      ((revenue[0].totalsales - revenue[1].totalsales) /
        revenue[1].totalsales) *
      100;

    if (!dailyPercentageChange || dailyPercentageChange === Infinity) {
      dailyPercentageChange = 100;
    }

    const totalSales = {
      label: "Total Orders today",
      amount: `${formattedTotalSales}`,
      description: `${
        dailyPercentageChange > 0 ? "+" : ""
      }${dailyPercentageChange.toFixed(0)}% from yesterday`,
      icon: Carrot,
      indicator: dailyPercentageChange > 0,
    };

    if (totalSales) return totalSales;
  } catch (err) {
    console.error(err);
  }
};
export const formatMonthlyAverageSales = (revenue: any[]) => {
  try {
    // Format the total revenue with comma separator
    const formattedMonthlyAverageSales = parseFloat(
      revenue[0].averageprofitbymonth
    ).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    // Calculate the percentage change in profit
    const monthPercentageChange =
      ((revenue[0].averageprofitbymonth - revenue[1].averageprofitbymonth) /
        revenue[1].averageprofitbymonth) *
      100;

    const totalSales = {
      label: "Average Sales",
      amount: `$${formattedMonthlyAverageSales}`,
      description: `${
        monthPercentageChange > 0 ? "+" : ""
      }${monthPercentageChange.toFixed(0)}% from last month`,
      icon: Carrot,
      indicator: monthPercentageChange > 0,
    };

    if (totalSales) return totalSales;
  } catch (err) {
    console.error(err);
  }
};
