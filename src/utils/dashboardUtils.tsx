import { Activity, CreditCard, DollarSign, Users } from "lucide-react";
import {
  fetchTotalProfitByMonthByAgentFromDb,
  fetchTotalProfitByMonthFromDb,
  fetchTotalProfitByWeekFromDb,
  fetchTotalProfitByYearFromDb,
} from "./databaseUtils";

export async function generateDashboardRevenue(): Promise<any> {
  try {
    const fetchRevenueFromDb = await fetchTotalProfitByYearFromDb();

    if (!fetchRevenueFromDb) {
      throw new Error("Failed to fetch revenue data.");
    }

    // Format the total revenue with comma separator
    const formattedTotalRevenue = parseFloat(
      fetchRevenueFromDb[0].totalprofit
    ).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    let yearPercentageChange = 100;
    // Calculate the percentage change in profit
    if (fetchRevenueFromDb.length > 1) {
      yearPercentageChange =
        ((fetchRevenueFromDb[0].totalprofit - fetchRevenueFromDb[1]
          ? fetchRevenueFromDb[1].totalprofit
          : 0) / fetchRevenueFromDb[1]
          ? fetchRevenueFromDb[1].totalprofit
          : 0) * 100;
    }

    const totalRevenue = {
      label: "Total Revenue",
      amount: `$${formattedTotalRevenue}`,
      description: `${fetchRevenueFromDb[0].year}`,
      icon: DollarSign,
    };

    return totalRevenue;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function generateDashboardSales(): Promise<any> {
  // This function will return the current and previous month's sales

  try {
    const fetchSalesFromDb = await fetchTotalProfitByMonthFromDb();

    if (!fetchSalesFromDb) {
      throw new Error("Failed to fetch sales data.");
    }

    const formattedTotalSales = parseFloat(
      fetchSalesFromDb[0].totalprofit
    ).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Calculate the percentage change in profit
    const monthPercentageChange =
      ((fetchSalesFromDb[0].totalprofit - fetchSalesFromDb[1].totalprofit) /
        fetchSalesFromDb[1].totalprofit) *
      100;

    const totalSales = {
      label: "Sales",
      amount: `+${formattedTotalSales}`,
      description: `${
        monthPercentageChange > 0 ? "+" : ""
      }${monthPercentageChange.toFixed(0)}% from last month`,
      icon: CreditCard,
    };

    return totalSales;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function generateDashboardBarChart(): Promise<any> {
  try {
    // This function will return the current and previous month's sales
    const fetchSalesFromDb = await fetchTotalProfitByMonthFromDb();

    if (!fetchSalesFromDb) {
      throw new Error("Failed to fetch bar chart data.");
    }

    const mappedData = fetchSalesFromDb.map((data) => {
      return {
        name: data.name,
        total: parseFloat(data.totalprofit),
      };
    });

    return mappedData;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function generateDashboardAreaChart(): Promise<any> {
  try {
    // This function will return the current and previous month's sales
    const fetchSalesFromDb = await fetchTotalProfitByWeekFromDb();

    if (!fetchSalesFromDb) {
      throw new Error("Failed to fetch bar chart data.");
    }

    const mappedData = fetchSalesFromDb.map((data) => {
      return {
        name: data.name,
        total: parseFloat(data.totalprofit),
      };
    });

    return mappedData;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function generateDashboardAgentBarChart(
  policyId: number
): Promise<any> {
  try {
    // This function will return the current and previous month's sales
    const totalSalesByAgent = await fetchTotalProfitByMonthByAgentFromDb(
      policyId
    );

    if (!totalSalesByAgent) {
      throw new Error("Failed to fetch bar chart data.");
    }

    const mappedData = totalSalesByAgent.map((data) => {
      return {
        name: data.name,
        total: parseFloat(data.totalprofit),
      };
    });

    return mappedData;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
