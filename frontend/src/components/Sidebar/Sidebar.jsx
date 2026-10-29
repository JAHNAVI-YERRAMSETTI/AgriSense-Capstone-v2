import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

import "./Sidebar.css";

function Sidebar() {
    const navigate = useNavigate();

    const { logout } = useAuth();
    const { t } = useLanguage();

    const handleLogout = () => {
        logout();

        toast.success(t("logout"));

        navigate("/login");
    };

    return (
        <aside className="sidebar">

            {/* Brand */}
            <div className="sidebar-brand">

                <div className="sidebar-logo">
                    🌱
                </div>

                <div className="sidebar-brand-text">
                    <h1>{t("appName")}</h1>

                    <span>
                        {t("appSubtitle")}
                    </span>
                </div>

            </div>


            {/* Navigation */}
            <nav className="sidebar-navigation">

                {/* Dashboard */}
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <span className="sidebar-icon">🏠</span>
                    <span>{t("dashboard")}</span>
                </NavLink>


                {/* Farmer Profile */}
                <NavLink
                    to="/farmer-profile"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <span className="sidebar-icon">👤</span>
                    <span>{t("farmerProfile")}</span>
                </NavLink>


                {/* My Farms */}
                <NavLink
                    to="/farms"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <span className="sidebar-icon">🌾</span>
                    <span>{t("myFarms")}</span>
                </NavLink>


                {/* Farm State */}
                <NavLink
                    to="/farm-state"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <span className="sidebar-icon">🌱</span>
                    <span>{t("farmState")}</span>
                </NavLink>


                {/* Predictions */}
                <NavLink
                    to="/predictions"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <span className="sidebar-icon">🤖</span>
                    <span>{t("predictions")}</span>
                </NavLink>


                {/* Context Interpretation */}
                <NavLink
                    to="/context-interpretation"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <span className="sidebar-icon">🧠</span>
                    <span>{t("contextInterpretation")}</span>
                </NavLink>


                {/* Agricultural Action Knowledge */}
                <NavLink
                    to="/agricultural-actions"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <span className="sidebar-icon">📚</span>
                    <span>{t("agriculturalActions")}</span>
                </NavLink>


                {/* Constraint / Feasibility Validation */}
                <NavLink
                    to="/constraint-validation"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <span className="sidebar-icon">⚖️</span>
                    <span>{t("constraintValidation")}</span>
                </NavLink>


                {/* Action Plan */}
                <NavLink
                    to="/action-plan"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <span className="sidebar-icon">📋</span>
                    <span>{t("actionPlan")}</span>
                </NavLink>


                {/* Monitoring */}
                <NavLink
                    to="/monitoring"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <span className="sidebar-icon">📊</span>
                    <span>{t("monitoring")}</span>
                </NavLink>


                {/* History */}
                <NavLink
                    to="/history"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <span className="sidebar-icon">📜</span>
                    <span>{t("history")}</span>
                </NavLink>


                {/* What-If Analysis */}
                <NavLink
                    to="/what-if"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <span className="sidebar-icon">🔄</span>
                    <span>{t("whatIfAnalysis")}</span>
                </NavLink>

            </nav>


            {/* Bottom Actions */}
            <div className="sidebar-bottom">

                {/* Settings */}
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <span className="sidebar-icon">⚙️</span>
                    <span>{t("settings")}</span>
                </NavLink>


                {/* Logout */}
                <button
                    type="button"
                    className="sidebar-logout"
                    onClick={handleLogout}
                >
                    <span className="sidebar-icon">🚪</span>
                    <span>{t("logout")}</span>
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;