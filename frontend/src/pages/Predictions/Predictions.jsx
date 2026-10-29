
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

import Sidebar from "../../components/Sidebar/Sidebar";
import LanguageSelector from "../../components/LanguageSelector/LanguageSelector";

import { getFarmsByFarmerId } from "../../services/farmService";
import { getFarmStateByFarmId } from "../../services/farmStateService";
import {
    getCropRecommendation,
    getRiskAnalysis,
} from "../../services/predictionService";
import { detectDisease } from "../../services/diseaseDetectionService";
import { predictYield } from "../../services/yieldPredictionService";

import "./Predictions.css";
import agricultureBanner from "../../assets/agriculture-landscape.jpg";
import cropRecommendationImage from "../../assets/crop-recommendation.png";
import yieldPredictionImage from "../../assets/yield-prediction.png";
import diseaseDetectionImage from "../../assets/disease-detection.png";

function Predictions() {
    const { farmer } = useAuth();
    const { t } = useLanguage();

    const [farms, setFarms] = useState([]);
    const [selectedFarmId, setSelectedFarmId] = useState("");

    const [farmState, setFarmState] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [yieldResult, setYieldResult] = useState(null);
    const [diseaseResult, setDiseaseResult] = useState(null);
    const [riskResult, setRiskResult] = useState(null);

    const [loadingFarms, setLoadingFarms] = useState(true);
    const [loadingState, setLoadingState] = useState(false);
    const [predicting, setPredicting] = useState(false);
    const [predictingYield, setPredictingYield] = useState(false);
    const [detectingDisease, setDetectingDisease] = useState(false);
    const [analyzingRisks, setAnalyzingRisks] = useState(false);

    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    // Load farms belonging to the logged-in farmer
    useEffect(() => {
        const loadFarms = async () => {
            if (!farmer?.userId) {
                setFarms([]);
                setSelectedFarmId("");
                setLoadingFarms(false);
                return;
            }

            try {
                setLoadingFarms(true);

                const data = await getFarmsByFarmerId(farmer.userId);
                const farmerFarms = data || [];

                setFarms(farmerFarms);

                setSelectedFarmId(
                    farmerFarms.length > 0
                        ? String(farmerFarms[0].id)
                        : ""
                );
            } catch (error) {
                console.error("Load farms error:", error);

                toast.error(
                    error.response?.data?.message ||
                    t("predictionLoadFarmsError")
                );

                setFarms([]);
                setSelectedFarmId("");
            } finally {
                setLoadingFarms(false);
            }
        };

        loadFarms();
    }, [farmer?.userId, t]);

    // Reset results and load the selected farm's state
    useEffect(() => {
        let cancelled = false;

        const loadFarmState = async () => {
            setFarmState(null);
            setPrediction(null);
            setYieldResult(null);
            setDiseaseResult(null);
            setRiskResult(null);
            setSelectedImage(null);
            setImagePreview("");

            if (!selectedFarmId) {
                setLoadingState(false);
                return;
            }

            try {
                setLoadingState(true);

                const data = await getFarmStateByFarmId(
                    selectedFarmId
                );

                if (!cancelled) {
                    setFarmState(data);
                }
            } catch (error) {
                console.error("Load farm state error:", error);

                if (!cancelled) {
                    setFarmState(null);
                }
            } finally {
                if (!cancelled) {
                    setLoadingState(false);
                }
            }
        };

        loadFarmState();

        return () => {
            cancelled = true;
        };
    }, [selectedFarmId]);

    const selectedFarm = farms.find(
        (farm) => String(farm.id) === String(selectedFarmId)
    );

    // Crop Recommendation
    const handlePrediction = async () => {
        if (!selectedFarmId) {
            toast.error(t("predictionSelectFarm"));
            return;
        }

        try {
            setPredicting(true);
            setPrediction(null);

            const result = await getCropRecommendation(selectedFarmId);

            if (!result?.success) {
                toast.error(
                    result?.message || t("predictionFailed")
                );
                return;
            }

            setPrediction(result);
            toast.success(t("predictionGenerated"));
        } catch (error) {
            console.error("Crop recommendation error:", error);

            toast.error(
                error.response?.data?.message ||
                t("predictionFailed")
            );
        } finally {
            setPredicting(false);
        }
    };

    // Yield Prediction
    const handleYieldPrediction = async () => {
        if (!selectedFarmId) {
            toast.error(t("predictionSelectFarm"));
            return;
        }

        try {
            setPredictingYield(true);
            setYieldResult(null);

            const result = await predictYield(selectedFarmId);

            if (!result?.success) {
                toast.error(
                    result?.message || t("yieldPredictionFailed")
                );
                return;
            }

            setYieldResult(result);
            toast.success(t("yieldPredictionSuccess"));
        } catch (error) {
            console.error("Yield prediction error:", error);

            toast.error(
                error.response?.data?.message ||
                t("yieldPredictionFailed")
            );
        } finally {
            setPredictingYield(false);
        }
    };

    // Risk Analysis
    const handleRiskAnalysis = async () => {
        if (!selectedFarmId) {
            toast.error(t("riskSelectFarm"));
            return;
        }

        try {
            setAnalyzingRisks(true);
            setRiskResult(null);

            const result = await getRiskAnalysis(selectedFarmId);

            if (!result?.success) {
                toast.error(t("riskLoadFailed"));
                return;
            }

            setRiskResult(result);
            toast.success(t("riskAnalysisTitle") + " ✓");
        } catch (error) {
            console.error("Risk analysis error:", error);
            toast.error(t("riskLoadFailed"));
        } finally {
            setAnalyzingRisks(false);
        }
    };

    // Disease Image Selection
    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            setSelectedImage(null);
            setImagePreview("");
            setDiseaseResult(null);
            return;
        }

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        setSelectedImage(file);
        setDiseaseResult(null);
        setImagePreview(URL.createObjectURL(file));
    };

    // Disease Detection
    const handleDiseaseDetection = async () => {
        if (!selectedFarmId) {
            toast.error(t("predictionSelectFarm"));
            return;
        }

        if (!selectedImage) {
            toast.error(t("diseaseSelectImageError"));
            return;
        }

        try {
            setDetectingDisease(true);
            setDiseaseResult(null);

            const result = await detectDisease(
                selectedFarmId,
                selectedImage
            );

            if (!result?.success) {
                toast.error(
                    result?.message || t("diseaseDetectionFailed")
                );
                return;
            }

            setDiseaseResult(result);
            toast.success(t("diseaseDetectionSuccess"));
        } catch (error) {
            console.error("Disease detection error:", error);

            toast.error(
                error.response?.data?.message ||
                t("diseaseDetectionFailed")
            );
        } finally {
            setDetectingDisease(false);
        }
    };

    const formatPercentage = (probability) =>
        `${(probability * 100).toFixed(2)}%`;

    const riskStatus = (
        riskResult?.overallStatus || "UNKNOWN"
    ).toLowerCase();

    return (

        <div className="predictions-layout">
            <Sidebar />

            <main className="predictions-main">
                <div className="predictions-page">
                    {/* Page Header */}
                    <header className="predictions-header">
                        <div>
                            <h1>{t("predictionsTitle")}</h1>
                            <p>{t("predictionsSubtitle")}</p>
                        </div>

                        <LanguageSelector />
                    </header>

<section className="predictions-hero">
    <img
        src={agricultureBanner}
        alt="Agricultural fields and farmland"
        className="predictions-hero-image"
    />

    <div className="predictions-hero-overlay" />

    <div className="predictions-hero-content">
        <span>AGRISENSE · SMART AGRICULTURE</span>
        <h2>{t("predictionsTitle")}</h2>
        <p>{t("predictionsSubtitle")}</p>
    </div>
</section>

                    {/* Farm Selection */}
                    <section className="prediction-selection-card">
                        <div className="prediction-field">
                            <label htmlFor="farm-select">
                                {t("predictionSelectFarmLabel")}
                            </label>

                            <select
                                id="farm-select"
                                value={selectedFarmId}
                                onChange={(event) =>
                                    setSelectedFarmId(event.target.value)
                                }
                                disabled={loadingFarms}
                            >
                                <option value="">
                                    {loadingFarms
                                        ? t("predictionLoadingFarms")
                                        : t("predictionChooseFarm")}
                                </option>

                                {farms.map((farm) => (
                                    <option
                                        key={farm.id}
                                        value={farm.id}
                                    >
                                        {farm.farmName} - {farm.location}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedFarm && (
                            <div className="selected-farm-info">
                                <div>
                                    <span>{t("predictionFarmName")}</span>
                                    <strong>{selectedFarm.farmName}</strong>
                                </div>

                                <div>
                                    <span>{t("predictionLocation")}</span>
                                    <strong>{selectedFarm.location}</strong>
                                </div>

                                <div>
                                    <span>{t("predictionCrop")}</span>
                                    <strong>{selectedFarm.crop}</strong>
                                </div>

                                <div>
                                    <span>{t("predictionGrowthStage")}</span>
                                    <strong>{selectedFarm.growthStage}</strong>
                                </div>
                            </div>
                        )}
                    </section>

                    {loadingState && (
                        <div className="prediction-message">
                            {t("predictionLoadingState")}
                        </div>
                    )}

                    {/* Farm State */}
                    {!loadingState && farmState && (
                        <section className="farm-state-preview">
                            <div className="section-heading">
                                <h2>
                                    {t("predictionFarmStateTitle")}
                                </h2>
                                <p>
                                    {t("predictionFarmStateSubtitle")}
                                </p>
                            </div>

                            <div className="farm-state-grid">
                                <div className="state-item">
                                    <span>{t("predictionSoilPh")}</span>
                                    <strong>{farmState.soilPh ?? "-"}</strong>
                                </div>

                                <div className="state-item">
                                    <span>{t("predictionNitrogen")}</span>
                                    <strong>{farmState.nitrogen ?? "-"}</strong>
                                </div>

                                <div className="state-item">
                                    <span>{t("predictionPhosphorus")}</span>
                                    <strong>{farmState.phosphorus ?? "-"}</strong>
                                </div>

                                <div className="state-item">
                                    <span>{t("predictionPotassium")}</span>
                                    <strong>{farmState.potassium ?? "-"}</strong>
                                </div>

                                <div className="state-item">
                                    <span>{t("predictionTemperature")}</span>
                                    <strong>{farmState.temperature ?? "-"}</strong>
                                </div>

                                <div className="state-item">
                                    <span>{t("predictionHumidity")}</span>
                                    <strong>{farmState.humidity ?? "-"}</strong>
                                </div>

                                <div className="state-item">
                                    <span>{t("predictionRainfall")}</span>
                                    <strong>{farmState.rainfall ?? "-"}</strong>
                                </div>

                                <div className="state-item">
                                    <span>{t("predictionSoilMoisture")}</span>
                                    <strong>{farmState.soilMoisture ?? "-"}</strong>
                                </div>
                            </div>
                        </section>
                    )}

                    {!loadingState && selectedFarmId && !farmState && (
                        <div className="prediction-empty">
                            <p>{t("predictionNoFarmState")}</p>
                        </div>
                    )}
                    {/* Crop Recommendation module */}
                    <section className="prediction-module prediction-module-crop">
                        <div className="prediction-module-image">
                            <img src={cropRecommendationImage} alt="Agricultural crops for crop recommendation" />
                        </div>
                    <div className="section-heading prediction-module-title">
                        <h2>{t("cropRecommendationTitle")}</h2>
                        <p>{t("cropRecommendationSubtitle")}</p>
                    </div>

                    {farmState && !loadingState && (
                        <section className="prediction-module-action">
                            <button
                                className="prediction-button"
                                onClick={handlePrediction}
                                disabled={predicting}
                            >
                                {predicting
                                    ? t("predictionGenerating")
                                    : t("predictionGenerateButton")}
                            </button>
                        </section>
                    )}

                    {prediction && (
                        <section className="prediction-result">
                            <div className="result-header">
                                <div>
                                    <h2>{t("predictionResultTitle")}</h2>
                                    <p>{t("predictionResultSubtitle")}</p>
                                </div>
                            </div>

                            <div className="recommended-crop-card">
                                <span>
                                    {t("predictionRecommendedCrop")}
                                </span>
                                <h3>
                                    {prediction.recommendedCrop || "-"}
                                </h3>
                            </div>

                            {prediction.topRecommendations?.length > 0 && (
                                <div className="top-recommendations">
                                    <h3>
                                        {t("predictionTopRecommendations")}
                                    </h3>

                                    <div className="recommendation-list">
                                        {prediction.topRecommendations.map(
                                            (recommendation, index) => (
                                                <div
                                                    className="recommendation-item"
                                                    key={recommendation.crop}
                                                >
                                                    <div className="recommendation-rank">
                                                        #{index + 1}
                                                    </div>

                                                    <div className="recommendation-details">
                                                        <div className="recommendation-name">
                                                            {recommendation.crop}
                                                        </div>

                                                        <div className="probability-bar">
                                                            <div
                                                                className="probability-fill"
                                                                style={{
                                                                    width: formatPercentage(
                                                                        recommendation.probability
                                                                    ),
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="recommendation-probability">
                                                        {formatPercentage(
                                                            recommendation.probability
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="prediction-note">
                                <strong>
                                    {t("predictionAdvisoryNoteTitle")}
                                </strong>
                                <p>{t("predictionAdvisoryNote")}</p>
                            </div>
                        </section>
                    )}
                    </section>

                    <section className="prediction-module prediction-module-yield">
                        <div className="prediction-module-image">
                            <img
                                src={yieldPredictionImage}
        alt="Agricultural field for yield prediction"
                            />
                        </div>

                    {/* Yield Prediction */}
                    {selectedFarmId && (
                        <section className="yield-prediction-card">
                            <div className="section-heading">
                                <h2>{t("yieldPrediction")}</h2>
                                <p>{t("yieldPredictionDescription")}</p>
                            </div>

                            <button
                                className="prediction-button"
                                onClick={handleYieldPrediction}
                                disabled={predictingYield}
                            >
                                {predictingYield
                                    ? t("yieldPredictionPredicting")
                                    : t("yieldPredictionButton")}
                            </button>

                            {yieldResult && (
                                <div className="yield-result">
                                    <div className="yield-result-main">
                                        <span>
                                            {t("yieldPredictionResult")}
                                        </span>

                                        <strong>
                                            {Number(
                                                yieldResult.predictedYieldKgPerHa
                                            ).toLocaleString(undefined, {
                                                maximumFractionDigits: 2,
                                            })}
                                        </strong>

                                        <small>
                                            {t("yieldPredictionUnit")}
                                        </small>
                                    </div>

                                    <div className="yield-result-details">
                                        <div>
                                            <span>{t("predictionCrop")}</span>
                                            <strong>
                                                {yieldResult.crop ||
                                                    selectedFarm?.crop ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>{t("predictionLocation")}</span>
                                            <strong>
                                                {yieldResult.district ||
                                                    selectedFarm?.location ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>{t("area")}</span>
                                            <strong>
                                                {yieldResult.area ??
                                                    selectedFarm?.area ??
                                                    "-"}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}
                    </section>

                    {/* Risk Analysis */}
                    {selectedFarmId && (
                        <section className="risk-analysis-card">
                            <div className="section-heading">
                                <h2>{t("riskAnalysisTitle")}</h2>
                                <p>{t("riskAnalysisSubtitle")}</p>
                            </div>

                            <button
                                className="prediction-button"
                                onClick={handleRiskAnalysis}
                                disabled={analyzingRisks}
                            >
                                {analyzingRisks
                                    ? t("riskAnalyzing")
                                    : t("riskAnalyzeButton")}
                            </button>

                            {riskResult && (
                                <div className="risk-analysis-result">
                                    <div className="risk-status">
                                        <span>{t("riskOverallStatus")}</span>
                                        <strong
                                            className={`risk-status-${riskStatus}`}
                                        >
                                            {t(
    riskResult.overallStatus === "LOW"
        ? "riskSeverityLow"
        : riskResult.overallStatus === "MEDIUM"
        ? "riskSeverityMedium"
        : riskResult.overallStatus === "HIGH"
        ? "riskSeverityHigh"
        : "riskSeverityUnknown"
)}
                                        </strong>
                                    </div>

                                    <p className="risk-analysis-message">
                                        {t(
                                            riskResult.overallStatus === "LOW"
                                                ? "riskLowMessage"
                                                : riskResult.overallStatus === "MEDIUM"
                                                ? "riskMediumMessage"
                                                : riskResult.overallStatus === "HIGH"
                                                ? "riskHighMessage"
                                                : "riskUnknownMessage"
                                        )}
                                    </p>

                                    {riskResult.risks?.length > 0 ? (
                                        <div className="risk-list">
                                            {riskResult.risks.map((risk, index) => (
                                                <article
                                                    className="risk-item"
                                                    key={`${risk.category}-${risk.parameter}-${index}`}
                                                >
                                                    <div className="risk-item-header">
                                                        <h3>
    {risk.parameter === "Disease Status"
        ? t("riskDiseaseStatus")
        : risk.parameter}
</h3>
                                                        <span
                                                            className={`risk-severity risk-severity-${(
                                                                risk.severity || "unknown"
                                                            ).toLowerCase()}`}
                                                        >
                                                            {t(
    risk.severity === "LOW"
        ? "riskSeverityLow"
        : risk.severity === "MEDIUM"
        ? "riskSeverityMedium"
        : risk.severity === "HIGH"
        ? "riskSeverityHigh"
        : "riskSeverityUnknown"
)}
                                                        </span>
                                                    </div>

                                                    <p>
                                                        <strong>{t("riskCategory")}:</strong>{" "}
                                                        {risk.category === "DISEASE"
    ? t("riskCategoryDisease")
    : risk.category}
                                                    </p>
                                                    <p>
                                                        <strong>{t("riskValue")}:</strong>{" "}
                                                       {risk.value === "Suspected"
    ? t("riskValueSuspected")
    : risk.value === "Confirmed"
    ? t("riskValueConfirmed")
    : risk.value ?? "—"}
                                                    </p>
                                                    <p>
                                                        <strong>{t("riskEvidence")}:</strong>{" "}
                                                       {risk.evidence === "Disease condition is suspected"
    ? t("riskEvidenceSuspected")
    : risk.evidence === "Disease condition is confirmed"
    ? t("riskEvidenceConfirmed")
    : risk.evidence || "—"}
                                                    </p>
                                                    <p>
                                                        <strong>{t("riskItemStatus")}:</strong>{" "}
                                                        {risk.status === "IDENTIFIED"
    ? t("riskStatusIdentified")
    : risk.status === "INSUFFICIENT_DATA"
    ? t("riskInsufficientData")
    : t("riskStatusUnknown")}
                                                    </p>
                                                </article>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="risk-no-findings">
                                            {t("riskNoElevatedRisks")}
                                        </p>
                                    )}

                                    <p className="risk-disclaimer">
                                        {t("riskNotValidatedNote")}
                                    </p>
                                </div>
                            )}
                        </section>
                    )}
                    
                    <section className="prediction-module prediction-module-disease">
                    <div className="prediction-module-image">
                        <img
                            src={diseaseDetectionImage}
        alt="Crop leaves for disease detection"
                        />
                    </div>

                    {/* Disease Detection */}
                    <section className="disease-detection-card">
                        <div className="section-heading">
                            <h2>{t("diseaseDetectionTitle")}</h2>
                            <p>{t("diseaseDetectionSubtitle")}</p>
                        </div>

                        <div className="disease-upload-area">
                            <label
                                htmlFor="disease-image"
                                className="disease-upload-label"
                            >
                                {t("diseaseSelectImage")}
                            </label>

                            <input
                                id="disease-image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />

                            {selectedImage && (
                                <p className="disease-file-name">
                                    {selectedImage.name}
                                </p>
                            )}
                        </div>

                        {imagePreview && (
                            <div className="disease-image-preview">
                                <img
                                    src={imagePreview}
                                    alt={t("diseaseImagePreview")}
                                />
                            </div>
                        )}

                        <button
                            className="prediction-button"
                            onClick={handleDiseaseDetection}
                            disabled={
                                detectingDisease ||
                                !selectedImage ||
                                !selectedFarmId
                            }
                        >
                            {detectingDisease
                                ? t("diseaseDetecting")
                                : t("diseaseDetectButton")}
                        </button>

                        {diseaseResult && (
                            <div className="disease-result">
                                <div className="disease-result-main">
                                    <span>
                                        {t("diseasePrediction")}
                                    </span>
                                    <h3>
                                        {diseaseResult.predictedDisease}
                                    </h3>
                                </div>

                                <div className="disease-confidence">
                                    <span>
                                        {t("diseaseConfidence")}
                                    </span>
                                    <strong>
                                        {diseaseResult.confidence}%
                                    </strong>
                                </div>

                                {diseaseResult.topPredictions?.length > 0 && (
                                    <div className="disease-top-predictions">
                                        <h3>
                                            {t("diseaseTopPredictions")}
                                        </h3>

                                        <div className="disease-prediction-list">
                                            {diseaseResult.topPredictions.map(
                                                (item, index) => (
                                                    <div
                                                        className="disease-prediction-item"
                                                        key={`${item.disease}-${index}`}
                                                    >
                                                        <span>
                                                            #{index + 1}
                                                        </span>
                                                        <strong>
                                                            {item.disease}
                                                        </strong>
                                                        <b>{item.confidence}%</b>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default Predictions;
