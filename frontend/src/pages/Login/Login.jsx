import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSelector from "../../components/LanguageSelector/LanguageSelector";

import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const { login } = useAuth();
    const { t } = useLanguage();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();

        if (!email.trim() || !password.trim()) {
            toast.error(t("enterEmailPassword"));
            return;
        }

        try {
            setLoading(true);

            await login(email, password);

            toast.success(t("loginSuccessful"));
            navigate("/dashboard");
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                t("invalidCredentials");

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            {/* Top navigation */}
            <header className="login-top-navigation">
                <button
                    type="button"
                    className="login-home-button"
                    onClick={() => navigate("/")}
                >
                    <span className="login-home-logo">
                        🌱
                    </span>
                    <span>AgriSense</span>
                </button>

                <LanguageSelector />
            </header>

            <main className="login-layout">

                {/* Left: Agricultural branding */}
                <section className="login-visual-panel">
                    <div className="login-visual-overlay" />

                    <div className="login-visual-content">
                        <span className="login-visual-badge">
                            🌿 Intelligent Agriculture
                        </span>

                        <h1>
                            Smarter Decisions.
                            <br />
                            <span>Better Farming.</span>
                        </h1>

                        <p>
                            Understand your farm conditions,
                            explore agricultural predictions,
                            and make informed decisions throughout
                            your crop lifecycle.
                        </p>

                        <div className="login-visual-divider" />

                        <div className="login-visual-footer">
                            <span>🌱</span>
                            <div>
                                <strong>AgriSense</strong>
                                <p>
                                    Adaptive Agricultural Decision
                                    Support System
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="login-image-caption">
                        Growing a smarter, more sustainable future.
                    </div>
                </section>

                {/* Right: Login form */}
                <section className="login-form-panel">
                    <div className="login-card">

                        <div className="login-logo">
                            🌱
                        </div>

                        <h2 className="login-brand-title">
                            {t("appName")}
                        </h2>

                        <p className="login-subtitle">
                            {t("appSubtitle")}
                        </p>

                        <div className="login-heading">
                            <h3>{t("farmerLogin")}</h3>
                            <p>
                                Welcome back! Please enter your details.
                            </p>
                        </div>

                        <form onSubmit={handleLogin}>

                            <div className="login-form-group">
                                <label htmlFor="email">
                                    {t("email")}
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder={t("enterEmail")}
                                    autoComplete="email"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="login-form-group">
                                <label htmlFor="password">
                                    {t("password")}
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder={t("enterPassword")}
                                    autoComplete="current-password"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="login-button"
                                disabled={loading}
                            >
                                {loading
                                    ? t("loggingIn")
                                    : t("login")}
                                {!loading && (
                                    <span aria-hidden="true"> →</span>
                                )}
                            </button>
                        </form>

                        <p className="login-register-text">
                            {t("noAccount")}{" "}

                            <button
                                type="button"
                                className="login-register-link"
                                onClick={() => navigate("/register")}
                            >
                                {t("register")}
                            </button>
                        </p>

                        <button
                            type="button"
                            className="login-back-home"
                            onClick={() => navigate("/")}
                        >
                            ← Back to Home
                        </button>

                        <div className="login-security-note">
                            <span aria-hidden="true">🌿</span>
                            Built for smarter farming decisions
                        </div>

                    </div>
                </section>

            </main>
        </div>
    );
}

export default Login;