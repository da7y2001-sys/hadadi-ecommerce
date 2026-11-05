import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiTrendingUp,
  FiShoppingBag,
  FiUsers,
  FiBox,
  FiCreditCard,
  FiChevronRight,
} from "react-icons/fi";
import api from "../../services/api";
import { ErrorState } from "../../components";
import RiyalSymbol from "../../components/common/RiyalSymbol";
import AdminNotificationBell from "../../components/Admin/AdminNotificationBell";
import { useLanguage } from "../../context/LanguageContext";
import "./AdminDashboard.css";

function getOrderStatusLabel(status, t) {
  if (!status) return "";
  const key = `status${status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}`;
  const translated = t(key);
  return translated && translated !== key ? translated : status;
}

function AdminDashboard() {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Initial dashboard data fetch
  useEffect(() => {
    let isActive = true;

    Promise.all([
      api.get("/admin/products"),
      api.get("/admin/orders"),
      api.get("/admin/users"),
    ])
      .then(([productsRes, ordersRes, usersRes]) => {
        if (!isActive) return;

        setProducts(productsRes.data || []);
        setOrders(ordersRes.data || []);
        setUsers(usersRes.data || []);
      })
      .catch(() => {
        if (isActive) {
          setError("Could not load dashboard data. Please try again.");
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [retryCount]);

  // Calculations based strictly on real backend data
  const {
    totalRevenue,
    todayRevenue,
    revenueGrowth,
    weeklyChartData,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    recentOrders,
  } = useMemo(() => {
    const totalRev = orders.reduce(
      (sum, ord) => sum + Number(ord.total || 0),
      0
    );

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    let todaySum = 0;
    let yesterdaySum = 0;

    orders.forEach((ord) => {
      const orderDate = new Date(ord.createdAt);
      if (orderDate >= todayStart) {
        todaySum += Number(ord.total || 0);
      } else if (orderDate >= yesterdayStart && orderDate < todayStart) {
        yesterdaySum += Number(ord.total || 0);
      }
    });

    let growthPct = null;
    if (yesterdaySum > 0 && todaySum > 0) {
      growthPct = Math.round(((todaySum - yesterdaySum) / yesterdaySum) * 100);
    }

    // 7-day revenue aggregation from real database timestamps
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(todayStart);
      targetDate.setDate(targetDate.getDate() - i);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = orders.filter((ord) => {
        const d = new Date(ord.createdAt);
        return d >= targetDate && d < nextDate;
      });

      const dayTotal = dayOrders.reduce(
        (sum, ord) => sum + Number(ord.total || 0),
        0
      );

      const dayName = targetDate.toLocaleDateString(
        isRTL ? "ar-SA" : "en-US",
        { weekday: "short" }
      );

      days.push({
        dayName,
        dateFormatted: targetDate.toLocaleDateString(
          isRTL ? "ar-SA" : "en-US",
          { month: "short", day: "numeric" }
        ),
        amount: dayTotal,
        count: dayOrders.length,
      });
    }

    const maxAmount = Math.max(...days.map((d) => d.amount), 1);
    const chartData = days.map((day) => ({
      ...day,
      heightPct:
        day.amount > 0
          ? Math.max(Math.round((day.amount / maxAmount) * 100), 12)
          : 6,
    }));

    const proc = orders.filter((o) => o.status === "Processing").length;
    const ship = orders.filter((o) => o.status === "Shipped").length;
    const deliv = orders.filter((o) => o.status === "Delivered").length;
    const canc = orders.filter((o) => o.status === "Cancelled").length;

    const recent = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return {
      totalRevenue: totalRev,
      todayRevenue: todaySum,
      revenueGrowth: growthPct,
      weeklyChartData: chartData,
      processingOrders: proc,
      shippedOrders: ship,
      deliveredOrders: deliv,
      cancelledOrders: canc,
      recentOrders: recent,
    };
  }, [orders, isRTL]);

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-spinner" />
        <p>{t("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load dashboard"
        message={error}
        onRetry={() => {
          setLoading(true);
          setError("");
          setRetryCount((count) => count + 1);
        }}
      />
    );
  }

  // Display Today's Revenue if today has activity; otherwise display Total Revenue
  const hasTodayActivity = todayRevenue > 0;
  const heroRevenueValue = hasTodayActivity ? todayRevenue : totalRevenue;
  const heroRevenueLabel = hasTodayActivity
    ? t("todayRevenue")
    : t("totalRevenueTitle");

  return (
    <div className="admin-dashboard-wrapper">
      {/* 1. Header Bar with Overview title & Notification Bell */}
      <header className="dashboard-top-bar">
        <div>
          <h1 className="dashboard-main-title">{t("adminDashboardOverview")}</h1>
          <p className="dashboard-sub-title">{t("dashboardSubtitle")}</p>
        </div>

        <AdminNotificationBell />
      </header>

      {/* 2. Main Dark Navy Revenue Card (matching reference design) */}
      <section className="hero-revenue-card">
        <div className="hero-revenue-top">
          <span className="hero-revenue-label">{heroRevenueLabel}</span>
          <div className="hero-trend-badge" aria-hidden="true">
            <FiTrendingUp />
          </div>
        </div>

        <div className="hero-revenue-amount">
          <span className="hero-amount-number">
            {heroRevenueValue.toLocaleString()}
          </span>
          <span className="hero-currency">
            <RiyalSymbol />
          </span>
        </div>

        <div className="hero-revenue-footer">
          {revenueGrowth !== null ? (
            <div className="hero-growth-tag">
              <FiTrendingUp />
              <span>
                {revenueGrowth > 0 ? `+${revenueGrowth}%` : `${revenueGrowth}%`}{" "}
                {t("vsYesterday")}
              </span>
            </div>
          ) : (
            <div className="hero-growth-tag neutral">
              <span>{t("allTimeRevenue")}</span>
            </div>
          )}
        </div>
      </section>

      {/* 3. 4 KPI Metric Cards (2x2 grid matching reference design) */}
      <section className="kpi-grid">
        {/* Card 1: Orders */}
        <div className="kpi-card kpi-purple">
          <div className="kpi-icon-bubble">
            <FiShoppingBag />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">{t("dashboardOrders")}</span>
            <strong className="kpi-value">{orders.length}</strong>
            <span className="kpi-hint">
              {processingOrders} {t("statusProcessing")}
            </span>
          </div>
        </div>

        {/* Card 2: Users */}
        <div className="kpi-card kpi-peach">
          <div className="kpi-icon-bubble">
            <FiUsers />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">{t("dashboardUsers")}</span>
            <strong className="kpi-value">{users.length}</strong>
            <span className="kpi-hint">{t("registeredAccountsHint")}</span>
          </div>
        </div>

        {/* Card 3: Products */}
        <div className="kpi-card kpi-mint">
          <div className="kpi-icon-bubble">
            <FiBox />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">{t("dashboardProducts")}</span>
            <strong className="kpi-value">{products.length}</strong>
            <span className="kpi-hint">{t("activeCatalogItemsHint")}</span>
          </div>
        </div>

        {/* Card 4: Total Sales */}
        <div className="kpi-card kpi-blue">
          <div className="kpi-icon-bubble">
            <FiCreditCard />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">{t("dashboardTotalSales")}</span>
            <strong className="kpi-value">
              {totalRevenue.toLocaleString()} <RiyalSymbol />
            </strong>
            <span className="kpi-hint">
              {deliveredOrders} {t("statusDelivered")}
            </span>
          </div>
        </div>
      </section>

      {/* 4. Revenue Analytics 7-day Bar Chart (matching reference design) */}
      <section className="dashboard-analytics-card">
        <div className="card-section-header">
          <h3>{t("revenue7Days")}</h3>
          <Link to="/admin/orders" className="section-view-all">
            {t("viewAllLink")} <FiChevronRight />
          </Link>
        </div>

        <div className="weekly-chart-container">
          <div className="weekly-bars-wrapper">
            {weeklyChartData.map((bar, index) => (
              <div className="chart-bar-column" key={index}>
                <div className="chart-bar-track">
                  <div
                    className="chart-bar-fill"
                    style={{ height: `${bar.heightPct}%` }}
                    data-amount={`${bar.amount.toLocaleString()} SAR`}
                  >
                    <div className="chart-tooltip">
                      <strong>{bar.amount.toLocaleString()} SAR</strong>
                      <span>{bar.dateFormatted}</span>
                    </div>
                  </div>
                </div>
                <span className="chart-day-label">{bar.dayName}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Dual Section: Recent Orders & Order Status (matching "Most Active" style) */}
      <div className="dashboard-dual-grid">
        {/* Left: Recent Orders List */}
        <section className="dashboard-content-card">
          <div className="card-section-header">
            <h3>{t("recentOrdersTitle")}</h3>
            <Link to="/admin/orders" className="section-view-all">
              {t("viewAllLink")} <FiChevronRight />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="dashboard-empty-note">{t("noOrdersYet")}</p>
          ) : (
            <div className="dashboard-orders-list">
              {recentOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="dashboard-order-row"
                  onClick={() => navigate("/admin/orders")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate("/admin/orders")}
                >
                  <div className="order-row-leading">
                    <div className="order-row-icon">
                      <FiShoppingBag />
                    </div>
                    <div className="order-row-details">
                      <strong className="order-row-id" dir="ltr">
                        #{ord._id.slice(-6)}
                      </strong>
                      <span className="order-row-customer">
                        {ord.user?.name || ord.shippingAddress?.fullName || t("anonymousCustomer")}
                      </span>
                    </div>
                  </div>

                  <div className="order-row-trailing">
                    <strong className="order-row-price">
                      {Number(ord.total || 0).toLocaleString()} <RiyalSymbol />
                    </strong>
                    <span className={`order-status-pill status-${ord.status?.toLowerCase()}`}>
                      {getOrderStatusLabel(ord.status, t)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right: Order Status Distribution */}
        <section className="dashboard-content-card">
          <div className="card-section-header">
            <h3>{t("orderStatusDistribution")}</h3>
            <Link to="/admin/orders" className="section-view-all">
              {t("viewAllLink")} <FiChevronRight />
            </Link>
          </div>

          <div className="status-breakdown-list">
            <div className="status-breakdown-item">
              <div className="status-item-meta">
                <span className="status-dot status-processing" />
                <span className="status-title">{t("statusProcessing")}</span>
              </div>
              <strong className="status-count">{processingOrders}</strong>
            </div>

            <div className="status-breakdown-item">
              <div className="status-item-meta">
                <span className="status-dot status-shipped" />
                <span className="status-title">{t("statusShipped")}</span>
              </div>
              <strong className="status-count">{shippedOrders}</strong>
            </div>

            <div className="status-breakdown-item">
              <div className="status-item-meta">
                <span className="status-dot status-delivered" />
                <span className="status-title">{t("statusDelivered")}</span>
              </div>
              <strong className="status-count">{deliveredOrders}</strong>
            </div>

            <div className="status-breakdown-item">
              <div className="status-item-meta">
                <span className="status-dot status-cancelled" />
                <span className="status-title">{t("statusCancelled")}</span>
              </div>
              <strong className="status-count">{cancelledOrders}</strong>
            </div>
          </div>

          <div className="status-bar-composite">
            {orders.length > 0 && (
              <>
                <div
                  className="bar-chunk chunk-processing"
                  style={{ width: `${(processingOrders / orders.length) * 100}%` }}
                />
                <div
                  className="bar-chunk chunk-shipped"
                  style={{ width: `${(shippedOrders / orders.length) * 100}%` }}
                />
                <div
                  className="bar-chunk chunk-delivered"
                  style={{ width: `${(deliveredOrders / orders.length) * 100}%` }}
                />
                <div
                  className="bar-chunk chunk-cancelled"
                  style={{ width: `${(cancelledOrders / orders.length) * 100}%` }}
                />
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
