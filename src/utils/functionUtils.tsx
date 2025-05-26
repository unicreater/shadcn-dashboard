import { Order, OrderReport } from "@/components/model/model";

export function generateLastAndCurrentWeek() {
  // Get the start and end dates for the previous week
  const currentDate = new Date(); // Current date
  const dayOfWeek = currentDate.getDay(); // Get the day of the week (0 = Sunday, 6 = Saturday)

  const currentWeekStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
  ); // Start of current week
  const currentWeekEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() + (6 - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  ); // End of current week
  const previousWeekStart = new Date(
    currentWeekStart.getFullYear(),
    currentWeekStart.getMonth(),
    currentWeekStart.getDate() - 7
  ); // Start of previous week
  const previousWeekEnd = new Date(
    currentWeekEnd.getFullYear(),
    currentWeekEnd.getMonth(),
    currentWeekEnd.getDate() - 7
  ); // End of previous week

  return {
    previousWeekStart,
    previousWeekEnd,
    currentWeekStart,
    currentWeekEnd,
  };
}
export function generateLastAndCurrentMonth() {
  const currentDate = new Date(); // Current date
  const currentMonthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ); // Start of current month
  const currentMonthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ); // End of current month
  const previousMonthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  ); // Start of previous month
  const previousMonthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  ); // End of previous month

  return {
    previousMonthStart,
    previousMonthEnd,
    currentMonthStart,
    currentMonthEnd,
  };
}

export function generateWeeklyReport(
  data: OrderReport[],
  previousWeekStart: Date,
  previousWeekEnd: Date,
  currentWeekStart: Date,
  currentWeekEnd: Date
) {
  // Filter orders in the previous week
  const previousWeekOrders = data.filter((order) => {
    const orderDate = new Date(order.deliveryDate);
    return orderDate >= previousWeekStart && orderDate <= previousWeekEnd;
  });

  // Filter orders in the current week
  const currentWeekOrders = data.filter((order) => {
    const orderDate = new Date(order.deliveryDate);
    return orderDate >= currentWeekStart && orderDate <= currentWeekEnd;
  });

  // Calculate the total cost for previous week orders
  const previousWeekTotalCost = previousWeekOrders.reduce(
    (total, order) => total + order.totalCost,
    0
  );

  // Calculate the total cost for current week orders
  const currentWeekTotalCost = currentWeekOrders.reduce(
    (total, order) => total + order.totalCost,
    0
  );

  // Calculate the percentage change in profit
  const weekPercentageChange =
    previousWeekTotalCost === 0
      ? 100 // Or use 100% or a max cap like 999%
      : ((currentWeekTotalCost - previousWeekTotalCost) /
          previousWeekTotalCost) *
        100;

  // Format the week's percentage change without decimals
  const formattedWeekPercentageChange = weekPercentageChange.toFixed(0);

  return {
    currentWeekTotalCost: currentWeekTotalCost,
    weekPercentageChange: formattedWeekPercentageChange,
  };
}

export function generateMonthlyReport(
  data: OrderReport[],
  previousMonthStart: Date,
  previousMonthEnd: Date,
  currentMonthStart: Date,
  currentMonthEnd: Date
) {
  // Filter orders in the previous month
  const previousMonthOrders = data.filter((order) => {
    const orderDate = new Date(order.deliveryDate);
    return orderDate >= previousMonthStart && orderDate <= previousMonthEnd;
  });

  // Filter orders in the current month
  const currentMonthOrders = data.filter((order) => {
    const orderDate = new Date(order.deliveryDate);
    return orderDate >= currentMonthStart && orderDate <= currentMonthEnd;
  });

  // Calculate the total cost for previous month orders
  const previousMonthTotalCost = previousMonthOrders.reduce(
    (total, order) => total + order.totalCost,
    0
  );

  // Calculate the total cost for current month orders
  const currentMonthTotalCost = currentMonthOrders.reduce(
    (total, order) => total + order.totalCost,
    0
  );

  // Calculate the percentage change in profit
  const monthPercentageChange =
    previousMonthTotalCost === 0
      ? 100 // Or use 100% or a max cap like 999%
      : ((currentMonthTotalCost - previousMonthTotalCost) /
          previousMonthTotalCost) *
        100;

  // Format the month's percentage change without decimals
  const formattedMonthPercentageChange = monthPercentageChange.toFixed(0);

  return {
    currentMonthTotalCost: currentMonthTotalCost,
    monthPercentageChange: formattedMonthPercentageChange,
  };
}

export function getSalesPast12Months(data: any[]) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Convert the raw data to a map for easier manipulation
  const dataMap = new Map();

  data.forEach((item) => {
    dataMap.set(item.name, item.totalprofit);
  });

  // Get the current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Create an array to hold the final bar chart data
  const barChartMonths = [];

  // Loop through the past 12 months, starting from the current month
  for (let i = 0; i < 12; i++) {
    const month = (currentMonth - i + 12) % 12; // Handle wraparound to previous year
    const yearOffset = currentMonth - i < 0 ? 1 : 0; // If the calculated month goes negative, it means we're in the previous year

    const year = (currentYear - yearOffset) % 100; // Get last two digits of the year

    const monthKey = `${monthNames[(month === 0 ? 12 : month) - 1]} ${year}`;
    const total = dataMap.get(monthKey) || 0;

    barChartMonths.unshift({ name: monthKey, total });
  }

  return barChartMonths;
}
export function formatTotalRevenueWeekByPolicy(data: any[]) {
  // Convert the raw data to a map for easier manipulation
  const dataMap = new Map();
  const agentCodes = new Set();
  const itemNames = new Set();

  // Find all distinct names except for 'No Agent'
  data.forEach((item) => {
    itemNames.add(item.name);
  });

  // Find all distinct agent codes except for 'No Agent'
  data.forEach((item) => {
    const agentCode = item.agentcode;
    if (agentCode !== "No Agent") {
      agentCodes.add(agentCode);
    }
  });

  data.forEach((item) => {
    const itemName = item.name;
    const agentCode = item.agentcode;
    const totalProfit = item.totalprofit;

    if (!dataMap.has(itemName)) {
      dataMap.set(itemName, { total: {} });
    }

    // Add agentCode and totalProfit to the corresponding item in the dataMap
    const itemData = dataMap.get(itemName);
    // console.log(`agentCode: ${itemName} totalProfit: ${totalProfit}`);
    if (agentCode !== "No Agent") {
      itemData.total[agentCode] = totalProfit;
      // console.log(`itemData: ${JSON.stringify(itemData)}`);
    }
  });

  // itemNames.forEach((item) => {
  //   const filteredItems = data.filter((item) => item.name === item);
  //   console.log(`filteredItems: ${filteredItems}`);
  // });

  // const objFromMap = Object.fromEntries(dataMap);
  // console.log(`ob: ${JSON.stringify(objFromMap)}`);

  // Get the current month and year
  // const currentDate = new Date();
  // const currentMonth = currentDate.getMonth() + 1;
  // const currentYear = currentDate.getFullYear();

  // // Create an array to hold the final bar chart data
  // const barChartMonths = [];

  // // Loop through the past 12 months, starting from the current month
  // for (let i = 0; i < 12; i++) {
  //   const month = (currentMonth - i + 12) % 12; // Handle wraparound to previous year
  //   const year = (currentYear - Math.floor((currentMonth + i) / 12)) % 100; // % 100 to get the last two digits only

  //   const monthKey = `${monthNames[(month === 0 ? 12 : month) - 1]} ${year}`;
  //   const total = dataMap.get(monthKey) || 0;

  //   barChartMonths.unshift({ name: monthKey, total });
  // }

  // return barChartMonths;
}

export function formatTotalSalesByPolicy(
  data: { name: string; value: string }[]
) {
  // Format data to have name: string, and value: number

  const formattedData = data.map((item) => ({
    name: item.name,
    value: Number(item.value),
  }));

  return formattedData;
}
