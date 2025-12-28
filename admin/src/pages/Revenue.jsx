import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import { backendUrl } from '../App';
import axios from 'axios';
import { toast } from "react-toastify";
import '../components/ChristmasRevenue.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Revenue = ({token}) => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [revenueYear, setRevenueYear] = useState([]);
  const [revenueCate, setRevenueCate] = useState({});
  const [revenueSubcate, setRevenueSubcate] = useState({});

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear - 5; year <= currentYear; year++) {
    years.push(year);
  }

  const getRevenueYear = async () => {
    try {
      const res = await axios.get(backendUrl + '/api/revenue/month/' + selectedYear.toString(), {headers : {token}})
      if(res.data.success) {
        setRevenueYear(res.data.revenue)
      }else {
        toast.error(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error)
    }
  }

  const getRevenueCate = async () => {
    try {
      const res = await axios.get(backendUrl + '/api/revenue/category', {headers : {token}})
      if(res.data.success) {
        setRevenueCate(res.data.revenue)
      } else {
        toast.error(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error)
    }
  }

  const getRevenueSubcate = async () => {
    try {
      const res = await axios.get(backendUrl + '/api/revenue/subcategory', {headers : {token}})
      if(res.data.success) {
        setRevenueSubcate(res.data.revenue)
      }else {
        toast.error(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error)
    }
  }

  useEffect(() => {
    getRevenueYear()
  },[selectedYear])

  useEffect(() => {
    getRevenueCate()
    getRevenueSubcate()
  },[])

  // Shared chart options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      tooltip: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
      },
    },
  };

  const lineChartOptions = {
    ...commonOptions,
    scales: {
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: "Months",
          font: { size: 14, weight: 'bold' },
          color: '#165b33',
        },
        ticks: {
          color: '#165b33',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 215, 0, 0.2)',
        },
        title: {
          display: true,
          text: "Revenue",
          font: { size: 14, weight: 'bold' },
          color: '#165b33',
        },
        ticks: {
          callback: (value) => `$${value}`,
          color: '#165b33',
        },
      },
    },
    plugins: {
      ...commonOptions.plugins,
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `💰 Revenue Overview ${selectedYear}`,
        font: {
          size: 20,
          weight: 'bold',
        },
        padding: 20,
        color: '#c41e3a',
      },
    },
  };

  const barChartOptions = {
    ...commonOptions,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#165b33',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 215, 0, 0.2)',
        },
        ticks: {
          callback: (value) => `$${value}`,
          color: '#165b33',
        },
      },
    },
    plugins: {
      ...commonOptions.plugins,
      legend: {
        display: false,
      },
    },
  };

  const months = [
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

  return (
    <div className="my-8">
      <h1 className="christmas-card-title text-2xl mb-6">Revenue Analytics Dashboard</h1>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-[66%] christmas-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="christmas-card-title">
              📈 Monthly Revenue Trends
            </h2>
            <select
              className="christmas-year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="christmas-chart-container h-[500px]">
            <Line
              options={lineChartOptions}
              data={{
                labels: months,
                datasets: [
                  {
                    label: "Revenue",
                    data: revenueYear,
                    borderColor: "#c41e3a",
                    backgroundColor: "rgba(196, 30, 58, 0.1)",
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: "#c41e3a",
                    pointBorderColor: "#ffd700",
                    pointBorderWidth: 2,
                  },
                ],
              }}
            />
          </div>
        </div>

        <div className="flex flex-col md:w-[33%] gap-4">
          <div className="christmas-card">
            <h3 className="christmas-card-title">
              👥 Category Revenue
            </h3>
            <div className="christmas-chart-container h-[210px]">
              <Bar
                options={{
                  ...barChartOptions,
                  plugins: {
                    ...barChartOptions.plugins,
                    title: {
                      display: true,
                      text: "Revenue by Category",
                      font: { size: 16, weight: 'bold' },
                      padding: 10,
                      color: '#165b33',
                    },
                  },
                }}
                data={{
                  labels: Object.keys(revenueCate).map(key => key === 'Men' ? '👨 Men' : key === 'Women' ? '👩 Women' : '👶 Kids'),
                  datasets: [
                    {
                      label: "Revenue",
                      data: Object.values(revenueCate),
                      backgroundColor: [
                        'rgba(22, 91, 51, 0.8)',
                        'rgba(196, 30, 58, 0.8)',
                        'rgba(255, 215, 0, 0.8)',
                      ],
                      borderColor: [
                        '#165b33',
                        '#c41e3a',
                        '#ffd700',
                      ],
                      borderWidth: 2,
                      borderRadius: 8,
                    },
                  ],
                }}
              />
            </div>
          </div>

          <div className="christmas-card">
            <h3 className="christmas-card-title">
              🏷️ Subcategory Revenue
            </h3>
            <div className="christmas-chart-container h-[210px]">
              <Bar
                options={{
                  ...barChartOptions,
                  plugins: {
                    ...barChartOptions.plugins,
                    title: {
                      display: true,
                      text: "Revenue by Subcategory",
                      font: { size: 16, weight: 'bold' },
                      padding: 10,
                      color: '#165b33',
                    },
                  },
                }}
                data={{
                  labels: Object.keys(revenueSubcate),
                  datasets: [
                    {
                      label: "Revenue",
                      data: Object.values(revenueSubcate),
                      backgroundColor: [
                        'rgba(196, 30, 58, 0.8)',
                        'rgba(22, 91, 51, 0.8)',
                        'rgba(139, 0, 0, 0.8)',
                      ],
                      borderColor: [
                        '#c41e3a',
                        '#165b33',
                        '#8b0000',
                      ],
                      borderWidth: 2,
                      borderRadius: 8,
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revenue;