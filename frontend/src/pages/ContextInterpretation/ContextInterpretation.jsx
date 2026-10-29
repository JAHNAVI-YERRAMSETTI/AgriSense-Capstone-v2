import { useEffect, useMemo, useState } from "react";
import {
    Leaf,
    CloudSun,
    Droplets,
    Users,
    Wheat,
    Bug,
    AlertTriangle,
    CheckCircle2,
    Info,
    RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";

import Sidebar from "../../components/Sidebar/Sidebar";
import LanguageSelector from "../../components/LanguageSelector/LanguageSelector";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

import { getFarmsByFarmerId } from "../../services/farmService";
import {
    getContextInterpretation
} from "../../services/contextInterpretationService";

import "./ContextInterpretation.css";


const CATEGORY_CONFIG = {
    SOIL: {
        icon: Leaf,
        titleKey: "contextSoil",
        descriptionKey: "contextSoilDescription"
    },
    WEATHER: {
        icon: CloudSun,
        titleKey: "contextWeather",
        descriptionKey: "contextWeatherDescription"
    },
    WATER: {
        icon: Droplets,
        titleKey: "contextWater",
        descriptionKey: "contextWaterDescription"
    },
    RESOURCES: {
        icon: Users,
        titleKey: "contextResources",
        descriptionKey: "contextResourcesDescription"
    },
    CROP: {
        icon: Wheat,
        titleKey: "contextCrop",
        descriptionKey: "contextCropDescription"
    },
    DISEASE: {
        icon: Bug,
        titleKey: "contextDisease",
        descriptionKey: "contextDiseaseDescription"
    }
};


const getSeverityClass = (severity) => {
    switch (severity) {
        case "HIGH":
            return "context-severity-high";

        case "MEDIUM":
            return "context-severity-medium";

        case "LOW":
            return "context-severity-low";

        default:
            return "context-severity-unknown";
    }
};


const getSeverityIcon = (severity) => {
    switch (severity) {
        case "HIGH":
            return <AlertTriangle size={16} />;

        case "MEDIUM":
            return <AlertTriangle size={16} />;

        case "LOW":
            return <CheckCircle2 size={16} />;

        default:
            return <Info size={16} />;
    }
};


const ContextInterpretation = () => {

    const { farmer } = useAuth();
    const { t } = useLanguage();

    const [farms, setFarms] = useState([]);
    const [selectedFarmId, setSelectedFarmId] = useState("");

    const [contextResult, setContextResult] = useState(null);

    const [loadingFarms, setLoadingFarms] = useState(true);
    const [loadingContext, setLoadingContext] = useState(false);


    // ==========================================
    // LOAD FARMER FARMS
    // ==========================================

    useEffect(() => {

        const loadFarms = async () => {

            if (!farmer?.userId) {
                setFarms([]);
                setLoadingFarms(false);
                return;
            }

            try {

                setLoadingFarms(true);

                const data =
                    await getFarmsByFarmerId(
                        farmer.userId
                    );

                setFarms(data || []);

                if (data?.length > 0) {
                    setSelectedFarmId(
                        String(data[0].id)
                    );
                }

            } catch (error) {

                console.error(
                    "Failed to load farms:",
                    error
                );

                toast.error(
                    t("contextFarmLoadFailed")
                );

            } finally {

                setLoadingFarms(false);
            }
        };

        loadFarms();

    }, [farmer, t]);


    // ==========================================
    // LOAD CONTEXT
    // ==========================================

    const loadContext = async () => {

        if (!selectedFarmId) {
            toast.error(
                t("predictionSelectFarm")
            );
            return;
        }

        try {

            setLoadingContext(true);

            const result =
                await getContextInterpretation(
                    selectedFarmId
                );

            if (!result?.success) {

                setContextResult(null);

                toast.error(
                    result?.message ||
                    t("contextLoadFailed")
                );

                return;
            }

            setContextResult(result);

        } catch (error) {

            console.error(
                "Context interpretation error:",
                error
            );

            setContextResult(null);

            toast.error(
                error.response?.data?.message ||
                t("contextLoadFailed")
            );

        } finally {

            setLoadingContext(false);
        }
    };


    // ==========================================
    // AUTOMATICALLY LOAD SELECTED FARM CONTEXT
    // ==========================================

    useEffect(() => {

        if (!selectedFarmId) {
            setContextResult(null);
            return;
        }

        loadContext();

    }, [selectedFarmId]);


    // ==========================================
    // GROUP CONTEXT BY CATEGORY
    // ==========================================

    const groupedContext = useMemo(() => {

        const groups = {};

        if (!contextResult?.context) {
            return groups;
        }

        contextResult.context.forEach((item) => {

            if (!groups[item.category]) {
                groups[item.category] = [];
            }

            groups[item.category].push(item);
        });

        return groups;

    }, [contextResult]);


    // ==========================================
    // SELECTED FARM
    // ==========================================

    const selectedFarm = farms.find(
        (farm) =>
            String(farm.id) ===
            String(selectedFarmId)
    );


    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="app-layout">

            <Sidebar />

            <main className="main-content context-page">

                <div className="page-header">

                    <div>
                        <h1>
                            {t("contextInterpretation")}
                        </h1>

                        <p>
                            {t("contextInterpretationDescription")}
                        </p>
                    </div>

                    <LanguageSelector />

                </div>


                {/* =====================================
                    FARM SELECTION
                ====================================== */}

                <section className="context-card">

                    <div className="context-card-header">

                        <div>
                            <h2>
                                {t("contextSelectFarm")}
                            </h2>

                            <p>
                                {t("contextSelectFarmDescription")}
                            </p>
                        </div>

                    </div>


                    <div className="context-farm-selection">

                        <select
                            value={selectedFarmId}
                            onChange={(event) =>
                                setSelectedFarmId(
                                    event.target.value
                                )
                            }
                            disabled={loadingFarms}
                        >

                            <option value="">
                                {loadingFarms
                                    ? t("contextLoadingFarms")
                                    : t("contextChooseFarm")}
                            </option>

                            {farms.map((farm) => (

                                <option
                                    key={farm.id}
                                    value={farm.id}
                                >
                                    {farm.farmName} -{" "}
                                    {farm.location}
                                </option>

                            ))}

                        </select>


                        <button
                            className="context-refresh-button"
                            onClick={loadContext}
                            disabled={
                                !selectedFarmId ||
                                loadingContext
                            }
                        >

                            <RefreshCw
                                size={17}
                                className={
                                    loadingContext
                                        ? "context-spin"
                                        : ""
                                }
                            />

                            {loadingContext
                                ? t("contextRefreshing")
                                : t("contextRefresh")}

                        </button>

                    </div>


                    {/* SELECTED FARM SUMMARY */}

                    {selectedFarm && (
                        <div className="context-farm-summary">

                            <div>
                                <span>
                                    {t("farmName")}
                                </span>

                                <strong>
                                    {selectedFarm.farmName}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    {t("location")}
                                </span>

                                <strong>
                                    {selectedFarm.location}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    {t("predictionCrop")}
                                </span>

                                <strong>
                                    {selectedFarm.crop}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    {t("growthStage")}
                                </span>

                                <strong>
                                    {selectedFarm.growthStage}
                                </strong>
                            </div>

                        </div>
                    )}

                </section>


                {/* =====================================
                    LOADING
                ====================================== */}

                {loadingContext && (
                    <div className="context-loading">

                        <RefreshCw
                            size={28}
                            className="context-spin"
                        />

                        <p>
                            {t("contextLoading")}
                        </p>

                    </div>
                )}


                {/* =====================================
                    CONTEXT RESULTS
                ====================================== */}

                {!loadingContext &&
                    contextResult && (

                        <div className="context-results">

                            <div className="context-result-header">

                                <div>
                                    <h2>
                                        {t("contextAnalysis")}
                                    </h2>

                                    <p>
                                        {t(
                                            "contextAnalysisDescription"
                                        )}
                                    </p>
                                </div>

                                <div className="context-status-success">

                                    <CheckCircle2 size={18} />

                                    {t("contextAnalysisComplete")}

                                </div>

                            </div>


                            <div className="context-category-grid">

                                {Object.entries(
                                    CATEGORY_CONFIG
                                ).map(
                                    ([
                                        category,
                                        config
                                    ]) => {

                                        const items =
                                            groupedContext[
                                                category
                                            ] || [];

                                        if (
                                            items.length ===
                                            0
                                        ) {
                                            return null;
                                        }

                                        const Icon =
                                            config.icon;

                                        return (

                                            <section
                                                className="context-category-card"
                                                key={category}
                                            >

                                                <div className="context-category-header">

                                                    <div className="context-category-icon">

                                                        <Icon
                                                            size={22}
                                                        />

                                                    </div>

                                                    <div>

                                                        <h3>
                                                            {t(
                                                                config.titleKey
                                                            )}
                                                        </h3>

                                                        <p>
                                                            {t(
                                                                config.descriptionKey
                                                            )}
                                                        </p>

                                                    </div>

                                                </div>


                                                <div className="context-item-list">

                                                    {items.map(
                                                        (
                                                            item,
                                                            index
                                                        ) => (

                                                            <div
                                                                className="context-item"
                                                                key={`${item.parameter}-${index}`}
                                                            >

                                                                <div className="context-item-main">

                                                                    <span className="context-item-parameter">
                                                                        {item.parameter}
                                                                    </span>

                                                                    <strong className="context-item-value">
                                                                        {item.value ??
                                                                            "—"}
                                                                    </strong>

                                                                </div>


                                                                <div className="context-item-bottom">

                                                                    <span className="context-item-interpretation">
                                                                        {item.interpretation}
                                                                    </span>


                                                                    <span
                                                                        className={`context-severity ${getSeverityClass(
                                                                            item.severity
                                                                        )}`}
                                                                    >

                                                                        {getSeverityIcon(
                                                                            item.severity
                                                                        )}

                                                                        {item.severity}

                                                                    </span>

                                                                </div>

                                                            </div>

                                                        )
                                                    )}

                                                </div>

                                            </section>

                                        );
                                    }
                                )}

                            </div>


                            {/* =================================
                                INFORMATION NOTE
                            ================================== */}

                            <div className="context-information-note">

                                <Info size={20} />

                                <div>

                                    <strong>
                                        {t(
                                            "contextInterpretationNoteTitle"
                                        )}
                                    </strong>

                                    <p>
                                        {t(
                                            "contextInterpretationNote"
                                        )}
                                    </p>

                                </div>

                            </div>

                        </div>
                    )}


                {/* =====================================
                    NO FARM
                ====================================== */}

                {!loadingFarms &&
                    farms.length === 0 && (

                        <div className="context-empty">

                            <Leaf size={42} />

                            <h3>
                                {t("contextNoFarms")}
                            </h3>

                            <p>
                                {t("contextNoFarmsDescription")}
                            </p>

                        </div>
                    )}

            </main>

        </div>
    );
};

export default ContextInterpretation;