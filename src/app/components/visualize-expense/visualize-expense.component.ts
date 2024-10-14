import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';

interface Expense {
  name: string;
  totalAmount: number;
  taxAmount: number;
  category: string;
  date: string;
  paymentType: string;
  comments: string;
}

interface CategoryData {
  name: string;
  y: number;
}

@Component({
  selector: 'app-visualize-expense',
  templateUrl: './visualize-expense.component.html',
  styleUrls: ['./visualize-expense.component.scss'],
})
export class VisualizeExpenseComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  pieChartOptions!: Highcharts.Options;
  barChartOptions!: Highcharts.Options;
  lineChartOptions!: Highcharts.Options;
  tableData: Expense[] = []; // Specify the type for table data
  stackedBarChartOptions!: Highcharts.Options;
  movingAverageLineOptions!: Highcharts.Options;
  heatmapOptions!: Highcharts.Options;

  constructor() {}

  ngOnInit() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    const username = loggedInUser.username;
    this.fetchExpenses(username);
  }

  fetchExpenses(username: string): void {
    const expensesKey = `expenses_${username}`;
    const expenses: Expense[] = JSON.parse(localStorage.getItem(expensesKey) || '[]');
    
    this.tableData = expenses; // Store expenses for table view

    // Set up the chart options with fetched expenses
    this.pieChartOptions = this.getPieChartOptions(expenses);
    this.barChartOptions = this.getBarChartOptions(expenses);
    this.lineChartOptions = this.getLineChartOptions(expenses);
    this.stackedBarChartOptions = this.getStackedBarChartOptions(expenses);
    this.movingAverageLineOptions = this.getMovingAverageLineOptions(expenses);
    this.heatmapOptions = this.getHeatmapOptions(expenses);
  }

  getPieChartOptions(expenses: Expense[]): Highcharts.Options {
    const categoryData: CategoryData[] = this.getCategoryData(expenses);
    return {
      chart: { type: 'pie' },
      title: { text: 'Category Summary' },
      series: [
        {
          name: 'Expenses',
          type: 'pie',
          data: categoryData.map(item => ({ name: item.name, y: item.y })),
        },
      ],
    } as Highcharts.Options;
  }

  getBarChartOptions(expenses: Expense[]): Highcharts.Options {
    const categories = [...new Set(expenses.map(expense => expense.category))];
    const data = categories.map(category => {
      const totalAmount = expenses
        .filter(expense => expense.category === category)
        .reduce((sum, expense) => sum + expense.totalAmount, 0);
      return totalAmount;
    });

    return {
      chart: { type: 'column' },
      title: { text: 'Monthly Summary' },
      xAxis: { categories: categories },
      yAxis: { title: { text: 'Total Spending Amount' } },
      series: [
        {
          name: 'Amount',
          type: 'column',
          data: data,
          color: '#3CB371',
        },
      ],
    } as Highcharts.Options;
  }

  getLineChartOptions(expenses: Expense[]): Highcharts.Options {
    const categories = expenses.map(expense => expense.date);
    const data = expenses.map(expense => expense.totalAmount);

    return {
      chart: { type: 'line' },
      title: { text: 'Expense Trend' },
      xAxis: { categories: categories },
      yAxis: { title: { text: 'Total Amount' } },
      series: [
        {
          name: 'Expenses',
          type: 'line',
          data: data,
          color: '#FF810C',
        },
      ],
    } as Highcharts.Options;
  }

  getStackedBarChartOptions(expenses: Expense[]): Highcharts.Options {
    const categories = [...new Set(expenses.map(expense => expense.date))]; // Dates for x-axis
    const categoryMap: { [key: string]: number[] } = {};

    expenses.forEach(expense => {
      const date = expense.date;
      const category = expense.category;
      if (!categoryMap[category]) {
        categoryMap[category] = Array(categories.length).fill(0);
      }
      const index = categories.indexOf(date);
      if (index > -1) {
        categoryMap[category][index] += expense.totalAmount;
      }
    });

    const series = Object.entries(categoryMap).map(([category, data]) => ({
      name: category,
      data: data,
      stack: 'total',
    }));

    return {
      chart: { type: 'column' },
      title: { text: 'Stacked Monthly Expenses by Category' },
      xAxis: { categories: categories },
      yAxis: { title: { text: 'Total Amount' } },
      series: series,
    } as Highcharts.Options;
  }

  getMovingAverageLineOptions(expenses: Expense[]): Highcharts.Options {
    const data = expenses.map(expense => expense.totalAmount);
    const movingAverage = this.calculateMovingAverage(data);

    return {
      chart: { type: 'line' },
      title: { text: 'Expense Trend with Moving Average' },
      xAxis: { categories: expenses.map(expense => expense.date) },
      yAxis: { title: { text: 'Total Amount' } },
      series: [
        {
          name: 'Expenses',
          type: 'line',
          data: data,
          color: '#FF810C',
        },
        {
          name: 'Moving Average',
          type: 'line',
          data: movingAverage,
          color: '#FFD700',
          dashStyle: 'ShortDash',
        },
      ],
    } as Highcharts.Options;
  }

  calculateMovingAverage(data: number[], period: number = 3): number[] {
    const movingAverage: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        movingAverage.push(0); // Push 0 or a suitable default instead of null
      } else {
        const avg = data.slice(i - period + 1, i + 1).reduce((sum, value) => sum + value, 0) / period;
        movingAverage.push(avg);
      }
    }
    return movingAverage;
  }

  getHeatmapOptions(expenses: any[]) {
    const heatmapData: any[] = [];
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const day = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      const categoryIndex = day === 0 ? 6 : day - 1; // Adjusting index for heatmap to start from Mon
      heatmapData.push([categoryIndex, expense.category, expense.totalAmount]);
    });
  
    return {
      chart: { type: 'heatmap', plotBorderWidth: 1 },
      title: { text: 'Heatmap of Expenses by Day and Category' },
      xAxis: { categories: daysOfWeek },
      yAxis: { categories: [...new Set(expenses.map(exp => exp.category))] },
      colorAxis: {
        min: 0,
        minColor: '#FFFFFF',
        maxColor: '#FF0000',
      },
      series: [{
        type: 'heatmap',  // Add this line
        name: 'Expenses',
        borderWidth: 1,
        data: heatmapData,
        dataLabels: {
          enabled: true,
          color: '#000000',
        },
      }],
    } as Highcharts.Options;
  }
  

  getCategoryData(expenses: Expense[]): CategoryData[] {
    const categoryMap = expenses.reduce((acc: { [key: string]: number }, expense: Expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.totalAmount;
      return acc;
    }, {});

    return Object.entries(categoryMap).map(([name, totalAmount]) => ({
      name,
      y: totalAmount,
    }));
  }
}
