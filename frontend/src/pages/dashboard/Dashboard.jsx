import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FaArrowDown,
  FaArrowUp,
  FaBox,
  FaShoppingCart,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";

const sales = [
  { day: "Mon", revenue: 4200 },
  { day: "Tue", revenue: 5800 },
  { day: "Wed", revenue: 4900 },
  { day: "Thu", revenue: 7200 },
  { day: "Fri", revenue: 6500 },
  { day: "Sat", revenue: 9100 },
  { day: "Sun", revenue: 8400 },
];

const metrics = [
  { label: "Total revenue", value: "$48,294", change: "12.8%", positive: true, icon: FaArrowUp, tone: "blue" },
  { label: "Orders", value: "1,284", change: "8.2%", positive: true, icon: FaShoppingCart, tone: "purple" },
  { label: "Customers", value: "8,549", change: "2.4%", positive: true, icon: FaUsers, tone: "green" },
  { label: "Products", value: "348", change: "1.1%", positive: false, icon: FaBox, tone: "orange" },
];

const orders = [
  { id: "#SV-1048", customer: "Olivia Martin", date: "Oct 28, 2026", amount: "$249.00", status: "Delivered" },
  { id: "#SV-1047", customer: "Jackson Lee", date: "Oct 28, 2026", amount: "$129.50", status: "Processing" },
  { id: "#SV-1046", customer: "Isabella Nguyen", date: "Oct 27, 2026", amount: "$399.00", status: "Shipped" },
  { id: "#SV-1045", customer: "William Kim", date: "Oct 27, 2026", amount: "$89.99", status: "Pending" },
];

const Dashboard = () => (
  <section className="dashboard-page">
    <div className="page-heading">
      <div>
        <p className="eyebrow">OVERVIEW</p>
        <h1>Dashboard</h1>
        <p className="muted-copy">Here&apos;s what&apos;s happening with your store today.</p>
      </div>
      <span className="date-chip">Last 7 days</span>
    </div>

    <div className="metric-grid">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <article className="metric-card" key={metric.label}>
            <div className={`metric-icon ${metric.tone}`}><Icon aria-hidden="true" /></div>
            <p className="metric-label">{metric.label}</p>
            <div className="metric-value-row">
              <strong>{metric.value}</strong>
              <span className={`metric-change ${metric.positive ? "positive" : "negative"}`}>
                {metric.positive ? <FaArrowUp aria-hidden="true" /> : <FaArrowDown aria-hidden="true" />}
                {metric.change}
              </span>
            </div>
            <p className="metric-caption">vs. previous 7 days</p>
          </article>
        );
      })}
    </div>

    <div className="dashboard-grid">
      <section className="panel sales-panel">
        <div className="panel-heading">
          <div><h2>Sales overview</h2><p className="muted-copy">Revenue performance this week</p></div>
          <strong className="chart-total">$46,100</strong>
        </div>
        <div className="chart-wrap" role="img" aria-label="Area chart showing revenue for the last seven days">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sales} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#edf0f5" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#8290a5", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8290a5", fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fill="url(#salesFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel activity-panel">
        <div className="panel-heading"><div><h2>Store activity</h2><p className="muted-copy">A quick look at your store</p></div></div>
        <div className="activity-item">
          <span className="activity-icon blue"><FaShoppingCart aria-hidden="true" /></span>
          <div><strong>24 new orders</strong><p>Orders placed today</p></div>
        </div>
        <div className="activity-item">
          <span className="activity-icon green"><FaUserPlus aria-hidden="true" /></span>
          <div><strong>18 new customers</strong><p>Joined your store today</p></div>
        </div>
        <div className="activity-item">
          <span className="activity-icon orange"><FaBox aria-hidden="true" /></span>
          <div><strong>3 low-stock products</strong><p>Restock to avoid missed sales</p></div>
        </div>
        <div className="stock-notice"><strong>Inventory attention</strong><p>Review products with fewer than 10 items in stock.</p></div>
      </section>
    </div>

    <section className="panel orders-panel">
      <div className="panel-heading">
        <div><h2>Recent orders</h2><p className="muted-copy">The latest activity from your customers</p></div>
        <Link className="text-link" to="/admin/orders">View all orders</Link>
      </div>
      <div className="table-responsive">
        <table className="table custom-table mb-0">
          <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="order-id">{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.date}</td>
                <td className="order-amount">{order.amount}</td>
                <td><span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </section>
);

export default Dashboard;