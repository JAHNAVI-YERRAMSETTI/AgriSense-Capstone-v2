import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { registerFarmer } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSelector from "../../components/LanguageSelector/LanguageSelector";

import "./Register.css";

function Register() {
    const navigate = useNavigate();

    const { setAuthenticatedFarmer } = useAuth();
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        location: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleRegister = async (event) => {
        event.preventDefault();

        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.password.trim()
        ) {
            toast.error(t("requiredFields"));
            return;
        }

        try {
            setLoading(true);

            const data = await registerFarmer(formData);

            if (!data.success) {
                throw new Error(data.message || "Registration failed");
            }

            setAuthenticatedFarmer(data);

            toast.success(t("registrationSuccessful"));
            navigate("/dashboard");
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Registration failed";

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            <header className="register-top-navigation">
                <button
                    type="button"
                    className="register-home-button"
                    onClick={() => navigate("/")}
                >
                    <span className="register-home-logo" aria-hidden="true">
                        🌱
                    </span>
                    <span>AgriSense</span>
                </button>

                <LanguageSelector />
            </header>

            <main className="register-layout">

                {/* Left: Agricultural branding */}
                <section className="register-visual-panel">
                    <div className="register-visual-overlay" />

                    <div className="register-visual-content">
                        <span className="register-visual-badge">
                            🌿 &nbsp; Growing Together
                        </span>

                        <h1>
                            Join the Future
                            <br />
                            <span>of Farming.</span>
                        </h1>

                        <p>
                            Create your AgriSense account to explore
                            agricultural predictions, understand your
                            farm conditions, and plan smarter farming
                            decisions throughout your crop lifecycle.
                        </p>

                        <div className="register-visual-divider" />

                        <div className="register-visual-footer">
                            <span aria-hidden="true">🌱</span>

                            <div>
                                <strong>AgriSense</strong>
                                <p>
                                    Adaptive Agricultural Decision
                                    Support System
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="register-image-caption">
                        Growing a smarter, more sustainable future.
                    </div>
                </section>

                {/* Right: Registration form */}
                <section className="register-form-panel">
                    <div className="register-card">

                        <div className="register-logo" aria-hidden="true">
                            🌱
                        </div>

                        <h1 className="register-brand-title">
                            {t("appName")}
                        </h1>

                        <p className="register-subtitle">
                            {t("appSubtitle")}
                        </p>

                        <div className="register-heading">
                            <h2>{t("farmerRegistration")}</h2>
                            <p>
                                Create your account to get started.
                            </p>
                        </div>

                        <form onSubmit={handleRegister}>

                            <div className="register-form-group">
                                <label htmlFor="name">
                                    {t("name")} *
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={t("name")}
                                    autoComplete="name"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="register-form-group">
                                <label htmlFor="email">
                                    {t("email")} *
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={t("enterEmail")}
                                    autoComplete="email"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="register-form-group">
                                <label htmlFor="password">
                                    {t("password")} *
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder={t("enterPassword")}
                                    autoComplete="new-password"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="register-form-group">
                                <label htmlFor="phone">
                                    {t("phone")}
                                </label>

                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder={t("phone")}
                                    autoComplete="tel"
                                    disabled={loading}
                                />
                            </div>

                            <div className="register-form-group">
                                <label htmlFor="location">
                                    {t("location")}
                                </label>

                                <input
                                    id="location"
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder={t("location")}
                                    autoComplete="address-level2"
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="register-button"
                                disabled={loading}
                            >
                                {loading
                                    ? t("creatingAccount")
                                    : t("createAccount")}

                                {!loading && (
                                    <span aria-hidden="true"> →</span>
                                )}
                            </button>
                        </form>

                        <p className="register-login-text">
                            {t("alreadyHaveAccount")}{" "}

                            <button
                                type="button"
                                className="register-login-link"
                                onClick={() => navigate("/login")}
                            >
                                {t("login")}
                            </button>
                        </p>

                        <button
                            type="button"
                            className="register-back-home"
                            onClick={() => navigate("/")}
                        >
                            ← Back to Home
                        </button>

                        <div className="register-security-note">
                            <span aria-hidden="true">🌿</span>
                            Built for smarter farming decisions
                        </div>

                    </div>
                </section>

            </main>
        </div>
    );
}

export default Register;