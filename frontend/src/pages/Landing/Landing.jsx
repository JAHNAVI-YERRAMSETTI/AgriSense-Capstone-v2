import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSelector from "../../components/LanguageSelector/LanguageSelector";

import "./Landing.css";

function Landing() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const { t } = useLanguage();

    const handleGetStarted = () => {
        if (isLoggedIn) {
            navigate("/dashboard");
        } else {
            navigate("/register");
        }
    };

    return (
        <div className="landing-page">

            {/* Navbar */}
            <nav className="landing-navbar">

                <div
                    className="landing-brand"
                    onClick={() =>
                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        })
                    }
                >
                    <div className="landing-brand-logo">
                        🌱
                    </div>

                    <div>
                        <h2>{t("appName")}</h2>
                        <span>SMART FARMING</span>
                    </div>
                </div>

                <div className="landing-nav-links">

                    <a href="#home">Home</a>

                    <a href="#about">About</a>

                    <a href="#features">Features</a>

                    <a href="#how-it-works">
                        How It Works
                    </a>

                </div>

                <div className="landing-nav-actions">

                    <LanguageSelector />

                    {isLoggedIn ? (
                        <button
                            type="button"
                            className="landing-login-button"
                            onClick={() =>
                                navigate("/dashboard")
                            }
                        >
                            Dashboard
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="landing-login-button"
                                onClick={() =>
                                    navigate("/login")
                                }
                            >
                                Login
                            </button>

                            <button
                                type="button"
                                className="landing-register-button"
                                onClick={() =>
                                    navigate("/register")
                                }
                            >
                                Register
                            </button>
                        </>
                    )}

                </div>

            </nav>


            {/* Hero */}
            <section
                id="home"
                className="landing-hero"
            >

                <div className="landing-hero-content">

                    <div className="landing-badge">
                        🌾 Intelligent Agriculture
                    </div>

                    <h1>
                        Smarter Decisions.
                        <br />
                        <span>Better Farming.</span>
                    </h1>

                    <p>
                        AgriSense is an adaptive agricultural
                        decision support system that helps farmers
                        understand their farm conditions and make
                        informed decisions throughout the crop
                        lifecycle.
                    </p>

                    <div className="landing-hero-actions">

                        <button
                            type="button"
                            className="landing-primary-button"
                            onClick={handleGetStarted}
                        >
                            Get Started →
                        </button>

                        <a
                            href="#how-it-works"
                            className="landing-secondary-button"
                        >
                            Explore AgriSense
                        </a>

                    </div>

                </div>


                <div className="landing-hero-visual">

                    <div className="landing-visual-card">

                        <div className="landing-visual-icon">
                            🌱
                        </div>

                        <h3>
                            Adaptive Farm Intelligence
                        </h3>

                        <p>
                            Farm State → Predictions →
                            Decisions → Action Plan
                        </p>

                        <div className="landing-mini-flow">

                            <span>🌾 Farm</span>

                            <b>→</b>

                            <span>🤖 AI</span>

                            <b>→</b>

                            <span>📋 Plan</span>

                        </div>

                    </div>

                </div>

            </section>


            {/* About */}
            <section
                id="about"
                className="landing-section landing-about"
            >

                <div className="landing-section-heading">

                    <span>ABOUT AGRISENSE</span>

                    <h2>
                        From Farm Data to
                        <br />
                        Actionable Decisions
                    </h2>

                    <p>
                        AgriSense combines farmer information,
                        farm conditions, weather information,
                        machine learning predictions and
                        decision logic to support agricultural
                        planning.
                    </p>

                </div>

                <div className="landing-about-grid">

                    <div className="landing-info-card">
                        <div>🌱</div>
                        <h3>Farm-Aware</h3>
                        <p>
                            Maintains the current state of each
                            farmer's farm and crop.
                        </p>
                    </div>

                    <div className="landing-info-card">
                        <div>🤖</div>
                        <h3>AI Supported</h3>
                        <p>
                            Uses prediction models to support
                            agricultural decisions.
                        </p>
                    </div>

                    <div className="landing-info-card">
                        <div>🔄</div>
                        <h3>Adaptive</h3>
                        <p>
                            Decisions can change as farm
                            conditions change.
                        </p>
                    </div>

                </div>

            </section>


            {/* Features */}
            <section
                id="features"
                className="landing-section landing-features"
            >

                <div className="landing-section-heading">

                    <span>KEY FEATURES</span>

                    <h2>
                        Everything Connected
                        <br />
                        Around Your Farm
                    </h2>

                </div>

                <div className="landing-feature-grid">

                    <div className="landing-feature-card">
                        <span>🌾</span>
                        <h3>Farm Management</h3>
                        <p>
                            Maintain farm, crop and growth-stage
                            information.
                        </p>
                    </div>

                    <div className="landing-feature-card">
                        <span>🌱</span>
                        <h3>Farm State</h3>
                        <p>
                            Track soil, weather, resources and
                            crop health information.
                        </p>
                    </div>

                    <div className="landing-feature-card">
                        <span>🤖</span>
                        <h3>Predictions</h3>
                        <p>
                            Agricultural prediction modules will
                            provide decision-support information.
                        </p>
                    </div>

                    <div className="landing-feature-card">
                        <span>📋</span>
                        <h3>Action Planning</h3>
                        <p>
                            Convert farm conditions and decisions
                            into actionable plans.
                        </p>
                    </div>

                    <div className="landing-feature-card">
                        <span>📊</span>
                        <h3>Monitoring</h3>
                        <p>
                            Monitor changes after actions are
                            executed.
                        </p>
                    </div>

                    <div className="landing-feature-card">
                        <span>🔄</span>
                        <h3>Dynamic Replanning</h3>
                        <p>
                            Update decisions when the farm state
                            changes.
                        </p>
                    </div>

                </div>

            </section>


            {/* How it works */}
            <section
                id="how-it-works"
                className="landing-section landing-how"
            >

                <div className="landing-section-heading">

                    <span>HOW IT WORKS</span>

                    <h2>
                        A Continuous Decision
                        <br />
                        Support Cycle
                    </h2>

                </div>

                <div className="landing-process">

                    <div className="landing-process-item">
                        <div>1</div>
                        <span>👤</span>
                        <h3>Farmer</h3>
                        <p>
                            Farmer provides information.
                        </p>
                    </div>

                    <div className="landing-process-arrow">
                        →
                    </div>

                    <div className="landing-process-item">
                        <div>2</div>
                        <span>🌾</span>
                        <h3>Farm State</h3>
                        <p>
                            Current farm conditions are maintained.
                        </p>
                    </div>

                    <div className="landing-process-arrow">
                        →
                    </div>

                    <div className="landing-process-item">
                        <div>3</div>
                        <span>🤖</span>
                        <h3>Predictions</h3>
                        <p>
                            Data is analyzed for decision support.
                        </p>
                    </div>

                    <div className="landing-process-arrow">
                        →
                    </div>

                    <div className="landing-process-item">
                        <div>4</div>
                        <span>📋</span>
                        <h3>Action Plan</h3>
                        <p>
                            Recommended actions are generated.
                        </p>
                    </div>

                </div>

            </section>


            {/* CTA */}
            <section className="landing-cta">

                <h2>
                    Start Building a Smarter Farm
                </h2>

                <p>
                    Create your farmer account and begin
                    managing your agricultural information.
                </p>

                <button
                    type="button"
                    onClick={handleGetStarted}
                >
                    Get Started →
                </button>

            </section>


            {/* Footer */}
            <footer className="landing-footer">

                <div>
                    <strong>🌱 AgriSense</strong>
                    <p>
                        Adaptive Agricultural Decision
                        Support System
                    </p>
                </div>

                <p>
                    © 2026 AgriSense
                </p>

            </footer>

        </div>
    );
}

export default Landing;