
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    Scale,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    HelpCircle,
} from "lucide-react";

import Sidebar from "../../components/Sidebar/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getFarmsByFarmerId } from "../../services/farmService";
import { getFarmStateByFarmId } from "../../services/farmStateService";
import { getActionsForFarm } from "../../services/agriculturalActionService";
import { validateConstraint } from "../../services/constraintValidationService";

import "./ConstraintValidation.css";

function ConstraintValidation() {
    const { farmer } = useAuth();
    const { t } = useLanguage();

    const [farms, setFarms] = useState([]);
    const [selectedFarmId, setSelectedFarmId] = useState("");
    const [farmState, setFarmState] = useState(null);

    const [actions, setActions] = useState([]);
    const [selectedActionId, setSelectedActionId] = useState("");
    const [selectedAction, setSelectedAction] = useState(null);

    const [result, setResult] = useState(null);

    const [loadingFarms, setLoadingFarms] = useState(false);
    const [loadingState, setLoadingState] = useState(false);
    const [loadingActions, setLoadingActions] = useState(false);
    const [validating, setValidating] = useState(false);

    // Display missing values honestly instead of treating them as zero.
    const displayValue = (value, unit = "") => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "Unknown";
        }

        return `${value}${unit ? ` ${unit}` : ""}`;
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "FEASIBLE":
                return "status-feasible";
            case "INFEASIBLE":
                return "status-infeasible";
            case "PARTIALLY_FEASIBLE":
                return "status-partial";
            default:
                return "status-unknown";
        }
    };

    const getStatusIcon = (status) => {
        if (status === "FEASIBLE") {
            return <CheckCircle size={18} />;
        }

        if (status === "INFEASIBLE") {
            return <AlertTriangle size={18} />;
        }

        return <HelpCircle size={18} />;
    };

    // Load farms belonging to the logged-in farmer.
    useEffect(() => {
        let cancelled = false;

        const loadFarms = async () => {
            if (!farmer?.userId) {
                setFarms([]);
                setSelectedFarmId("");
                return;
            }

            try {
                setLoadingFarms(true);

                const data = await getFarmsByFarmerId(
                    farmer.userId
                );

                if (cancelled) return;

                const farmerFarms = Array.isArray(data) ? data : [];
                setFarms(farmerFarms);

                setSelectedFarmId((currentId) => {
                    const stillExists = farmerFarms.some(
                        (farm) => String(farm.id) === String(currentId)
                    );

                    if (stillExists) return currentId;

                    return farmerFarms.length
                        ? String(farmerFarms[0].id)
                        : "";
                });
            } catch (error) {
                console.error("Failed to load farms:", error);

                if (!cancelled) {
                    setFarms([]);
                    setSelectedFarmId("");
                    toast.error(
                        t("constraintLoadFarmsFailed") ||
                        "Unable to load farms."
                    );
                }
            } finally {
                if (!cancelled) setLoadingFarms(false);
            }
        };

        loadFarms();

        return () => {
            cancelled = true;
        };
    }, [farmer?.userId, t]);

    // Load the selected farm's latest saved state.
    useEffect(() => {
        let cancelled = false;

        const loadFarmState = async () => {
            setFarmState(null);
            setActions([]);
            setSelectedActionId("");
            setSelectedAction(null);
            setResult(null);

            if (!selectedFarmId) return;

            try {
                setLoadingState(true);

                const data = await getFarmStateByFarmId(
                    selectedFarmId
                );

                if (!cancelled) {
                    setFarmState(data || null);
                }
            } catch (error) {
                console.error("Failed to load farm state:", error);

                if (!cancelled) {
                    setFarmState(null);
                    toast.error(
                        t("constraintFarmStateLoadFailed") ||
                        "Unable to load the farm state."
                    );
                }
            } finally {
                if (!cancelled) setLoadingState(false);
            }
        };

        loadFarmState();

        return () => {
            cancelled = true;
        };
    }, [selectedFarmId, t]);

    // Load candidate actions matching the selected farm's crop and stage.
    useEffect(() => {
        let cancelled = false;

        const loadActions = async () => {
            setActions([]);
            setSelectedActionId("");
            setSelectedAction(null);
            setResult(null);

            if (!farmState?.crop || !farmState?.growthStage) {
                return;
            }

            try {
                setLoadingActions(true);

                const data = await getActionsForFarm(
                    farmState.crop,
                    farmState.growthStage
                );

                if (cancelled) return;

                setActions(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to load agricultural actions:", error);

                if (!cancelled) {
                    setActions([]);
                    toast.error(
                        t("constraintActionsLoadFailed") ||
                        "Unable to load agricultural actions."
                    );
                }
            } finally {
                if (!cancelled) setLoadingActions(false);
            }
        };

        loadActions();

        return () => {
            cancelled = true;
        };
    }, [farmState?.crop, farmState?.growthStage, t]);

    const selectedFarm = farms.find(
        (farm) => String(farm.id) === String(selectedFarmId)
    );

    const handleFarmChange = (event) => {
        setSelectedFarmId(event.target.value);
        setResult(null);
    };

    const handleActionChange = (event) => {
        const actionId = event.target.value;

        setSelectedActionId(actionId);
        setResult(null);

        const action = actions.find(
            (item) => String(item.id) === String(actionId)
        );

        setSelectedAction(action || null);
    };

    const handleValidate = async () => {
        if (!selectedFarmId) {
            toast.error(
                t("constraintChooseFarm") || "Please choose a farm."
            );
            return;
        }

        if (!selectedActionId) {
            toast.error(
                t("constraintActionRequired") ||
                "Please select an agricultural action."
            );
            return;
        }

        try {
            setValidating(true);
            setResult(null);

            const response = await validateConstraint({
                farmId: Number(selectedFarmId),
                actionId: Number(selectedActionId),
            });

            setResult(response || null);

            if (response?.success) {
                toast.success(
                    t("constraintValidationCompleted") ||
                    "Constraint validation completed."
                );
            } else {
                toast.error(
                    response?.message ||
                    t("constraintValidationFailed") ||
                    "Constraint validation failed."
                );
            }
        } catch (error) {
            console.error("Constraint validation failed:", error);
            setResult(null);

            toast.error(
                error?.response?.data?.message ||
                t("constraintValidationFailed") ||
                "Unable to validate this action."
            );
        } finally {
            setValidating(false);
        }
    };

    // Requirement values and current farm resources are displayed separately.
    const resourceItems = [
        {
            key: "water",
            label: t("waterConstraint") || "Water",
            required: selectedAction?.requiredWater,
            available: farmState?.waterAvailable,
            unit: "L",
        },
        {
            key: "labour",
            label: t("labourConstraint") || "Labour",
            required: selectedAction?.requiredLabour,
            available: farmState?.labourAvailable,
            unit: "person-days",
        },
        {
            key: "budget",
            label: t("budgetConstraint") || "Budget",
            required: selectedAction?.requiredBudget,
            available: farmState?.budgetAvailable,
            unit: "₹",
        },
    ];

    return (
        <div className="constraint-page-layout">
            <Sidebar />

            <main className="constraint-page-main">
                <div className="constraint-page">
                    <div className="constraint-container">

                        {/* Page heading */}
                        <header className="constraint-header">
                            <div>
                                <div className="constraint-title-row">
                                    <Scale size={30} />
                                    <h1>
                                        {t("constraintValidationTitle") ||
                                            "Constraint / Feasibility Validation"}
                                    </h1>
                                </div>

                                <p>
                                    {t("constraintValidationDescription") ||
                                        "Check whether an agricultural action is feasible using the available farm resources."}
                                </p>
                            </div>
                        </header>

                        {/* Farm selection */}
                        <section className="constraint-card">
                            <div className="constraint-section-header">
                                <div>
                                    <h2>
                                        {t("farmState") || "Farm State"}
                                    </h2>
                                    <p>
                                        {t("constraintSelectFarmDescription") ||
                                            "Select a farm to evaluate its current conditions."}
                                    </p>
                                </div>
                            </div>

                            <div className="constraint-form-group">
                                <label htmlFor="constraint-farm">
                                    {t("constraintChooseFarm") || "Choose a farm"}
                                </label>

                                <select
                                    id="constraint-farm"
                                    value={selectedFarmId}
                                    onChange={handleFarmChange}
                                    disabled={loadingFarms}
                                >
                                    <option value="">
                                        {loadingFarms
                                            ? t("loading") || "Loading..."
                                            : t("constraintChooseFarm") ||
                                              "Choose a farm"}
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
                                <div className="farm-state-summary">
                                    <div>
                                        <span>
                                            {t("farmName") || "Farm Name"}
                                        </span>
                                        <strong>{selectedFarm.farmName}</strong>
                                    </div>

                                    <div>
                                        <span>
                                            {t("predictionLocation") || "Location"}
                                        </span>
                                        <strong>
                                            {displayValue(selectedFarm.location)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            {t("predictionCrop") || "Current Crop"}
                                        </span>
                                        <strong>
                                            {displayValue(
                                                farmState?.crop ??
                                                selectedFarm.crop
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            {t("predictionGrowthStage") ||
                                                "Growth Stage"}
                                        </span>
                                        <strong>
                                            {displayValue(
                                                farmState?.growthStage ??
                                                selectedFarm.growthStage
                                            )}
                                        </strong>
                                    </div>
                                </div>
                            )}

                            {selectedFarmId && !loadingState && !farmState && (
                                <div className="constraint-info-box">
                                    <HelpCircle size={20} />
                                    <span>
                                        Farm state is not available. Save a farm
                                        state before validating an action.
                                    </span>
                                </div>
                            )}
                        </section>

                        {/* Candidate actions */}
                        <section className="constraint-card">
                            <div className="constraint-section-header">
                                <div>
                                    <h2>
                                        {t("candidateActions") ||
                                            "Candidate Agricultural Actions"}
                                    </h2>
                                    <p>
                                        {t("candidateActionsDescription") ||
                                            "Select an action relevant to the current crop and growth stage."}
                                    </p>
                                </div>
                            </div>

                            {loadingState || loadingActions ? (
                                <div className="constraint-loading">
                                    <RefreshCw size={22} className="spin" />
                                    <span>
                                        {t("loading") || "Loading..."}
                                    </span>
                                </div>
                            ) : (
                                <div className="constraint-form-group">
                                    <label htmlFor="constraint-action">
                                        {t("selectAction") || "Select Action"}
                                    </label>

                                    <select
                                        id="constraint-action"
                                        value={selectedActionId}
                                        onChange={handleActionChange}
                                        disabled={
                                            !farmState || actions.length === 0
                                        }
                                    >
                                        <option value="">
                                            {!farmState
                                                ? "Farm state unavailable"
                                                : actions.length === 0
                                                  ? t("noApplicableActions") ||
                                                    "No applicable actions found"
                                                  : t("chooseAction") ||
                                                    "Choose an action"}
                                        </option>

                                        {actions.map((action) => (
                                            <option
                                                key={action.id}
                                                value={action.id}
                                            >
                                                {action.actionName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {selectedAction && (
                                <div className="selected-action">
                                    <div className="selected-action-header">
                                        <div>
                                            <h3>{selectedAction.actionName}</h3>
                                            <span className="reference-badge">
                                                {selectedAction.evidenceStatus ||
                                                    "Evidence status unavailable"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="selected-action-details">
                                        <div>
                                            <span>
                                                {t("actionCategory") || "Category"}
                                            </span>
                                            <strong>
                                                {displayValue(
                                                    selectedAction.category
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                {t("predictionCrop") ||
                                                    "Applicable Crop"}
                                            </span>
                                            <strong>
                                                {displayValue(
                                                    selectedAction.applicableCrop
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                {t("predictionGrowthStage") ||
                                                    "Applicable Growth Stage"}
                                            </span>
                                            <strong>
                                                {displayValue(
                                                    selectedAction.applicableGrowthStage
                                                )}
                                            </strong>
                                        </div>
                                    </div>

                                    {selectedAction.description && (
                                        <p className="action-description">
                                            {selectedAction.description}
                                        </p>
                                    )}

                                    {selectedAction.sourceReference && (
                                        <p className="action-source">
                                            <strong>
                                                {t("sourceReference") ||
                                                    "Source Reference"}:
                                            </strong>{" "}
                                            {selectedAction.sourceReference}
                                        </p>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Resource comparison */}
                        <section className="constraint-card">
                            <div className="constraint-section-header">
                                <div>
                                    <h2>
                                        {t("actionRequirements") ||
                                            "Action Requirements"}
                                    </h2>
                                    <p>
                                        Compare documented action requirements
                                        with the selected farm's saved resources.
                                        Missing values remain unknown.
                                    </p>
                                </div>
                            </div>

                            {selectedAction ? (
                                <>
                                    <div className="requirements-grid">
                                        {resourceItems.map((item) => (
                                            <div
                                                className="requirement-item"
                                                key={item.key}
                                            >
                                                <span>{item.label}</span>
                                                <strong>
                                                    {displayValue(
                                                        item.required,
                                                        item.key === "budget"
                                                            ? ""
                                                            : item.unit
                                                    )}
                                                    {item.key === "budget" &&
                                                        item.required != null &&
                                                        item.required !== "" &&
                                                        ` ₹`}
                                                </strong>
                                                <small>
                                                    Required for this action
                                                </small>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="requirements-grid">
                                        {resourceItems.map((item) => (
                                            <div
                                                className="requirement-item"
                                                key={`${item.key}-available`}
                                            >
                                                <span>
                                                    Available{" "}
                                                    {item.label.toLowerCase()}
                                                </span>
                                                <strong>
                                                    {item.key === "budget" &&
                                                    item.available != null &&
                                                    item.available !== ""
                                                        ? `₹ ${item.available}`
                                                        : displayValue(
                                                              item.available,
                                                              item.unit
                                                          )}
                                                </strong>
                                                <small>
                                                    From the saved farm state
                                                </small>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="constraint-info-box">
                                        <HelpCircle size={20} />
                                        <span>
                                            Resource comparisons are meaningful
                                            only when their units and measurement
                                            scope match. Missing requirements
                                            cannot be treated as zero.
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="constraint-info-box">
                                    <HelpCircle size={20} />
                                    <span>
                                        Select a farm and an agricultural action
                                        to view resource requirements.
                                    </span>
                                </div>
                            )}

                            <button
                                type="button"
                                className="validate-button"
                                onClick={handleValidate}
                                disabled={
                                    validating ||
                                    !selectedFarmId ||
                                    !selectedActionId ||
                                    loadingState
                                }
                            >
                                {validating ? (
                                    <>
                                        <RefreshCw
                                            size={18}
                                            className="spin"
                                        />
                                        {t("validating") || "Validating..."}
                                    </>
                                ) : (
                                    <>
                                        <Scale size={18} />
                                        {t("validateFeasibility") ||
                                            "Validate Feasibility"}
                                    </>
                                )}
                            </button>
                        </section>

                        {/* Validation result from the backend */}
                        {result && (
                            <section className="constraint-card validation-result">
                                <div className="result-header">
                                    <div>
                                        <h2>
                                            {t("validationResult") ||
                                                "Validation Result"}
                                        </h2>
                                        <p>
                                            {result.actionName ||
                                                selectedAction?.actionName ||
                                                "Selected action"}
                                        </p>
                                    </div>

                                    <div
                                        className={`overall-status ${getStatusClass(
                                            result.overallStatus
                                        )}`}
                                    >
                                        {getStatusIcon(result.overallStatus)}
                                        <span>
                                            {result.overallStatus || "UNKNOWN"}
                                        </span>
                                    </div>
                                </div>

                                {result.message && (
                                    <p className="action-description">
                                        {result.message}
                                    </p>
                                )}

                                {Array.isArray(result.constraints) &&
                                result.constraints.length > 0 ? (
                                    <div className="constraint-results">
                                        {result.constraints.map(
                                            (constraint, index) => (
                                                <div
                                                    key={`${constraint.category}-${index}`}
                                                    className="constraint-result-item"
                                                >
                                                    <div className="constraint-result-left">
                                                        {getStatusIcon(
                                                            constraint.status
                                                        )}

                                                        <div>
                                                            <strong>
                                                                {constraint.category}
                                                            </strong>
                                                            <p>
                                                                {constraint.message ||
                                                                    "No explanation provided."}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <span
                                                        className={`constraint-status ${getStatusClass(
                                                            constraint.status
                                                        )}`}
                                                    >
                                                        {constraint.status ||
                                                            "UNKNOWN"}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <div className="constraint-info-box">
                                        <HelpCircle size={20} />
                                        <span>
                                            No individual constraint results
                                            were returned by the backend.
                                        </span>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ConstraintValidation;
