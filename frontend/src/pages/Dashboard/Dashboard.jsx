import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Sprout,
    Tractor,
    Leaf,
    BrainCircuit,
    ArrowRight,
    UserRound,
    MapPinned,
    ClipboardList,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";

import Sidebar from "../../components/Sidebar/Sidebar";
import LanguageSelector from "../../components/LanguageSelector/LanguageSelector";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getFarmsByFarmerId } from "../../services/farmService";
import { getFarmStateByFarmId } from "../../services/farmStateService";
import farmHero from "../../assets/farm-hero.jpg";
import "./Dashboard.css";

function Dashboard() {
    const { farmer } = useAuth();
    const { t } = useLanguage();

    const [farms, setFarms] = useState([]);
    const [farmStateCount, setFarmStateCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadDashboard = async () => {
            if (!farmer?.userId) {
                setFarms([]);
                setFarmStateCount(null);
                setLoading(false);
                setError("Farmer session information is unavailable.");
                return;
            }

            setLoading(true);
            setError("");

            try {
                const response = await getFarmsByFarmerId(
                    farmer.userId
                );

                if (!active) return;

                const farmList = Array.isArray(response)
                    ? response
                    : Array.isArray(response?.data)
                      ? response.data
                      : null;

                if (!farmList) {
                    throw new Error(
                        "The farms API returned an unexpected response."
                    );
                }

                setFarms(farmList);

                if (farmList.length === 0) {
                    setFarmStateCount(0);
                    return;
                }

                const stateResults = await Promise.allSettled(
                    farmList.map((farm) =>
                        getFarmStateByFarmId(
                            farm.id ?? farm.farmId
                        )
                    )
                );

                if (!active) return;

                const successfulStates = stateResults.filter(
                    (result) => result.status === "fulfilled"
                );

                const statesAvailable = successfulStates.reduce(
                    (count, result) => {
                        const data = result.value;
                        if (Array.isArray(data)) {
                            return count + data.length;
                        }
                        if (data && typeof data === "object") {
                            return count + 1;
                        }
                        return count;
                    },
                    0
                );

                const allRequestsSucceeded = stateResults.every(
                    (result) => result.status === "fulfilled"
                );

                setFarmStateCount(
                    allRequestsSucceeded ? statesAvailable : null
                );
            } catch (err) {
                if (!active) return;

                console.error("Dashboard loading failed:", err);
                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load dashboard data."
                );
            } finally {
                if (active) setLoading(false);
            }
        };

        loadDashboard();

        return () => {
            active = false;
        };
    }, [farmer?.userId]);

    const workflow = [
        {
            title: t("farmer"),
            description: "Your profile",
            icon: UserRound,
            path: "/farmer-profile",
        },
        {
            title: t("farm"),
            description: t("manageFarmCrop"),
            icon: Tractor,
            path: "/farms",
        },
        {
            title: t("farmState"),
            description: t("manageFarmState"),
            icon: Sprout,
            path: "/farm-state",
        },
        {
            title: t("predictions"),
            description: t("agriculturalPredictions"),
            icon: BrainCircuit,
            path: "/predictions",
        },
        {
            title: t("actionPlan"),
            description: "Decision workflow",
            icon: ClipboardList,
            path: "/agricultural-actions",
        },
    ];

    const cards = [
        {
            title: t("farmer"),
            value: farmer?.name || "—",
            description: farmer?.email || "Profile information",
            icon: UserRound,
            className: "farmer",
            path: "/farmer-profile",
        },
        {
            title: t("farm"),
            value: loading ? "…" : error ? "—" : String(farms.length),
            description: loading
                ? "Loading farms"
                : error
                  ? "Farm data unavailable"
                  : farms.length === 1
                    ? "Registered farm"
                    : "Registered farms",
            icon: Tractor,
            className: "farm",
            path: "/farms",
        },
        {
            title: t("farmState"),
            value:
                loading || farmStateCount === null
                    ? "—"
                    : String(farmStateCount),
            description:
                loading
                    ? "Loading farm states"
                    : farmStateCount === null
                      ? "Farm state data unavailable"
                      : "Available farm state records",
            icon: Leaf,
            className: "state",
            path: "/farm-state",
        },
        {
            title: t("predictions"),
            value: "—",
            description: "Open predictions to view available results",
            icon: BrainCircuit,
            className: "prediction",
            path: "/predictions",
        },
    ];

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div className="dashboard-heading">
                        <span className="dashboard-eyebrow">
                            AGRISENSE / OVERVIEW
                        </span>
                        <h1>
                            {t("welcome")},{" "}
                            {farmer?.name || t("farmer")}
                        </h1>
                        <p>{t("agriculturalDecisionSupport")}</p>
                    </div>

                    <div className="dashboard-header-actions">
                        <span className="dashboard-status">
                            <span className="status-dot" />
                            {farmer ? "Signed in" : "Session unavailable"}
                        </span>
                        <LanguageSelector />
                    </div>
                </header>
<section className="dashboard-hero">
    <img
        src={farmHero}
        alt="Green agricultural fields"
        className="dashboard-hero-image"
    />

    <div className="dashboard-hero-overlay" />

    <div className="dashboard-hero-content">
        <span className="dashboard-hero-tag">
            AGRISENSE • SMART AGRICULTURE
        </span>

        <h2>Grow smarter with AgriSense</h2>

        <p>
            Understand your farm, explore agricultural predictions,
            and plan your next farming decisions.
        </p>

        <Link to="/farms" className="dashboard-hero-button">
            Explore your farms <ArrowRight size={17} />
        </Link>
    </div>
</section>
                <section className="dashboard-intro">
                    <div className="dashboard-intro-icon">
                        <Sprout size={27} strokeWidth={1.8} />
                    </div>
                    <div>
                        <h2>Your farm at a glance</h2>
                        <p>
                            Review your farm records and continue your
                            agricultural decision workflow.
                        </p>
                    </div>
                    <Link to="/farms" className="dashboard-primary-link">
                        View farms <ArrowRight size={16} />
                    </Link>
                </section>

                {error && (
                    <div className="dashboard-alert" role="alert">
                        <AlertCircle size={19} />
                        <div>
                            <strong>Some dashboard data could not load</strong>
                            <p>{error}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            aria-label="Retry dashboard loading"
                        >
                            <RefreshCw size={17} />
                        </button>
                    </div>
                )}

                {!error && !loading && farms.length === 0 && (
                    <div className="dashboard-empty">
                        <MapPinned size={21} />
                        <div>
                            <strong>No farms found</strong>
                            <p>
                                There are no farms returned for this account.
                                Add a farm to continue.
                            </p>
                        </div>
                        <Link to="/farms">
                            Manage farms <ArrowRight size={16} />
                        </Link>
                    </div>
                )}

                <section className="dashboard-cards">
                    {cards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <Link
                                to={card.path}
                                className="dashboard-card"
                                key={card.className}
                            >
                                <div
                                    className={`dashboard-card-icon ${card.className}`}
                                >
                                    <Icon size={22} strokeWidth={1.8} />
                                </div>

                                <div className="dashboard-card-content">
                                    <p className="dashboard-card-label">
                                        {card.title}
                                    </p>
                                    <h3>{card.value}</h3>
                                    <span>{card.description}</span>
                                </div>

                                <ArrowRight
                                    className="dashboard-card-arrow"
                                    size={18}
                                />
                            </Link>
                        );
                    })}
                </section>

                <section className="dashboard-flow">
                    <div className="dashboard-section-header">
                        <div>
                            <span className="dashboard-eyebrow">
                                WORKFLOW
                            </span>
                            <h2>{t("decisionFlow")}</h2>
                            <p>{t("decisionFlowDescription")}</p>
                        </div>
                        <span className="workflow-label">
                            <CheckCircle2 size={15} />
                            Connected modules
                        </span>
                    </div>

                    <div className="decision-flow-container">
                        {workflow.map((step, index) => {
                            const Icon = step.icon;

                            return (
                                <div
                                    className="decision-flow-item"
                                    key={step.path}
                                >
                                    <Link
                                        to={step.path}
                                        className="flow-step"
                                    >
                                        <span className="flow-step-number">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <span className="flow-step-icon">
                                            <Icon size={22} strokeWidth={1.8} />
                                        </span>
                                        <strong>{step.title}</strong>
                                        <small>{step.description}</small>
                                    </Link>

                                    {index < workflow.length - 1 && (
                                        <ArrowRight
                                            className="flow-arrow"
                                            size={20}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <p className="dashboard-flow-note">
                        Select a module to open it. Predictions and
                        recommendations depend on available farm data and
                        integrated model results.
                    </p>
                </section>

                <footer className="dashboard-footer">
                    <span>AgriSense</span>
                    <span>
                        Adaptive, context-aware agricultural decision support
                    </span>
                </footer>
            </main>
        </div>
    );
}

export default Dashboard;
