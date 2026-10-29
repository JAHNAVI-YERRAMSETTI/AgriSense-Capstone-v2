
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    Plus,
    BookOpen,
    RefreshCw,
    Save,
    X,
} from "lucide-react";

import Sidebar from "../../components/Sidebar/Sidebar";
import { useLanguage } from "../../context/LanguageContext";
import {
    getAllAgriculturalActions,
    addAgriculturalAction,
} from "../../services/agriculturalActionService";

import "./AgriculturalActions.css";

const INITIAL_FORM = {
    actionName: "",
    category: "",
    description: "",
    requiredWater: "",
    requiredLabour: "",
    requiredBudget: "",
    applicableCrop: "",
    applicableGrowthStage: "",
    evidenceStatus: "",
    sourceReference: "",
    active: true,
};

function AgriculturalActions() {
    const { t } = useLanguage();

    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ ...INITIAL_FORM });

    useEffect(() => {
        loadActions();
    }, []);

    const loadActions = async () => {
        try {
            setLoading(true);
            const data = await getAllAgriculturalActions();
            setActions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load agricultural actions:", error);
            toast.error(t("agriculturalActionsLoadFailed"));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleReset = () => {
        setFormData({ ...INITIAL_FORM });
    };

    const parseOptionalNumber = (value) => {
        if (value === "" || value === null || value === undefined) {
            return null;
        }

        const number = Number(value);

        return Number.isFinite(number) ? number : NaN;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.actionName.trim()) {
            toast.error(t("agriculturalActionNameRequired"));
            return;
        }

        if (!formData.applicableCrop.trim()) {
            toast.error(t("agriculturalActionCropRequired"));
            return;
        }

        if (!formData.applicableGrowthStage.trim()) {
            toast.error(t("agriculturalActionGrowthStageRequired"));
            return;
        }

        const requiredWater = parseOptionalNumber(formData.requiredWater);
        const requiredLabour = parseOptionalNumber(formData.requiredLabour);
        const requiredBudget = parseOptionalNumber(formData.requiredBudget);

        const requirements = [
            ["Water", requiredWater],
            ["Labour", requiredLabour],
            ["Budget", requiredBudget],
        ];

        for (const [label, value] of requirements) {
            if (Number.isNaN(value)) {
                toast.error(`${label} requirement must be a valid number.`);
                return;
            }

            if (value !== null && value < 0) {
                toast.error(`${label} requirement cannot be negative.`);
                return;
            }
        }

        // The current backend entity uses Integer for requiredLabour.
        if (
            requiredLabour !== null &&
            !Number.isInteger(requiredLabour)
        ) {
            toast.error("Labour requirement must be a whole number.");
            return;
        }

        const payload = {
            actionName: formData.actionName.trim(),
            category: formData.category.trim(),
            description: formData.description.trim(),
            requiredWater,
            requiredLabour,
            requiredBudget,
            applicableCrop: formData.applicableCrop.trim(),
            applicableGrowthStage: formData.applicableGrowthStage.trim(),
            evidenceStatus: formData.evidenceStatus.trim(),
            sourceReference: formData.sourceReference.trim(),
            active: formData.active,
        };

        try {
            setSaving(true);

            await addAgriculturalAction(payload);

            toast.success(t("agriculturalActionAdded"));
            handleReset();
            setShowForm(false);
            await loadActions();
        } catch (error) {
            console.error("Failed to add agricultural action:", error);

            toast.error(
                error.response?.data?.message ||
                t("agriculturalActionAddFailed")
            );
        } finally {
            setSaving(false);
        }
    };

    const renderOptionalValue = (value, unit) => {
        if (value === null || value === undefined || value === "") {
            return "Unknown";
        }

        return `${value} ${unit}`;
    };

    return (
        <div className="agricultural-actions-layout">
            <Sidebar />

            <main className="agricultural-actions-main">
                <div className="agricultural-actions-page">
                    <div className="agricultural-actions-container">
                        {/* Page header */}
                        <div className="agricultural-actions-header">
                            <div>
                                <div className="page-title-row">
                                    <BookOpen size={30} />
                                    <h1>{t("agriculturalActionsTitle")}</h1>
                                </div>

                                <p>
                                    {t("agriculturalActionsSubtitle")}
                                </p>
                            </div>

                            <div className="header-actions">
                                <button
                                    type="button"
                                    className="secondary-action-button"
                                    onClick={loadActions}
                                    disabled={loading}
                                >
                                    <RefreshCw
                                        size={17}
                                        className={loading ? "spin" : ""}
                                    />
                                    {t("refresh")}
                                </button>

                                <button
                                    type="button"
                                    className="primary-action-button"
                                    onClick={() => setShowForm((value) => !value)}
                                    disabled={saving}
                                >
                                    {showForm ? (
                                        <X size={18} />
                                    ) : (
                                        <Plus size={18} />
                                    )}

                                    {showForm
                                        ? t("cancel")
                                        : t("addAgriculturalAction")}
                                </button>
                            </div>
                        </div>

                        {/* Knowledge base information */}
                        <div className="knowledge-info-box">
                            <BookOpen size={21} />

                            <div>
                                <strong>
                                    {t("agriculturalActionsKnowledgeBase")}
                                </strong>

                                <p>
                                    {t("agriculturalActionsKnowledgeDescription")}
                                </p>
                            </div>
                        </div>

                        {/* Add agricultural action */}
                        {showForm && (
                            <div className="action-form-card">
                                <div className="section-heading">
                                    <h2>{t("addAgriculturalAction")}</h2>
                                    <p>
                                        {t("agriculturalActionFormDescription")}
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {/* Basic information */}
                                    <div className="form-section">
                                        <h3>{t("actionBasicInformation")}</h3>

                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label htmlFor="actionName">
                                                    {t("actionName")}
                                                </label>

                                                <input
                                                    id="actionName"
                                                    type="text"
                                                    name="actionName"
                                                    value={formData.actionName}
                                                    onChange={handleChange}
                                                    placeholder={t("enterActionName")}
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="category">
                                                    {t("actionCategory")}
                                                </label>

                                                <input
                                                    id="category"
                                                    type="text"
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleChange}
                                                    placeholder={t("enterActionCategory")}
                                                />
                                            </div>

                                            <div className="form-group full-width">
                                                <label htmlFor="description">
                                                    {t("actionDescription")}
                                                </label>

                                                <textarea
                                                    id="description"
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                    placeholder={t("enterActionDescription")}
                                                    rows={4}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Applicability */}
                                    <div className="form-section">
                                        <h3>{t("actionApplicability")}</h3>

                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label htmlFor="applicableCrop">
                                                    {t("applicableCrop")}
                                                </label>

                                                <input
                                                    id="applicableCrop"
                                                    type="text"
                                                    name="applicableCrop"
                                                    value={formData.applicableCrop}
                                                    onChange={handleChange}
                                                    placeholder={t("enterApplicableCrop")}
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="applicableGrowthStage">
                                                    {t("applicableGrowthStage")}
                                                </label>

                                                <input
                                                    id="applicableGrowthStage"
                                                    type="text"
                                                    name="applicableGrowthStage"
                                                    value={formData.applicableGrowthStage}
                                                    onChange={handleChange}
                                                    placeholder={t("enterGrowthStage")}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Resource requirements */}
                                    <div className="form-section">
                                        <h3>
                                            {t("actionResourceRequirements")}
                                        </h3>

                                        <p className="form-note">
                                            Enter requirements only when
                                            supported by a verified source or
                                            a documented project assumption.
                                            Leave unavailable values empty.
                                            Empty values remain Unknown; they
                                            are not treated as zero.
                                        </p>

                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label htmlFor="requiredWater">
                                                    Water required (L)
                                                </label>

                                                <input
                                                    id="requiredWater"
                                                    type="number"
                                                    name="requiredWater"
                                                    value={formData.requiredWater}
                                                    onChange={handleChange}
                                                    min="0"
                                                    step="any"
                                                    placeholder="Unknown if unavailable"
                                                />

                                                <small>
                                                    The water unit and
                                                    measurement period must
                                                    match Farm State.
                                                </small>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="requiredLabour">
                                                    Labour required
                                                    (person-days)
                                                </label>

                                                <input
                                                    id="requiredLabour"
                                                    type="number"
                                                    name="requiredLabour"
                                                    value={formData.requiredLabour}
                                                    onChange={handleChange}
                                                    min="0"
                                                    step="1"
                                                    placeholder="Unknown if unavailable"
                                                />

                                                <small>
                                                    Current backend supports
                                                    whole person-day values.
                                                </small>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="requiredBudget">
                                                    Budget required (₹)
                                                </label>

                                                <input
                                                    id="requiredBudget"
                                                    type="number"
                                                    name="requiredBudget"
                                                    value={formData.requiredBudget}
                                                    onChange={handleChange}
                                                    min="0"
                                                    step="any"
                                                    placeholder="Unknown if unavailable"
                                                />

                                                <small>
                                                    Estimated expenditure for
                                                    the defined action scope.
                                                </small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Evidence */}
                                    <div className="form-section">
                                        <h3>{t("actionEvidence")}</h3>

                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label htmlFor="evidenceStatus">
                                                    {t("evidenceStatus")}
                                                </label>

                                                <input
                                                    id="evidenceStatus"
                                                    type="text"
                                                    name="evidenceStatus"
                                                    value={formData.evidenceStatus}
                                                    onChange={handleChange}
                                                    placeholder={t("selectEvidenceStatus")}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="sourceReference">
                                                    {t("sourceReference")}
                                                </label>

                                                <input
                                                    id="sourceReference"
                                                    type="text"
                                                    name="sourceReference"
                                                    value={formData.sourceReference}
                                                    onChange={handleChange}
                                                    placeholder={t("enterSourceReference")}
                                                />

                                                <small>
                                                    Use an actual source you
                                                    have checked. Do not invent
                                                    a citation.
                                                </small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active status */}
                                    <div className="form-section">
                                        <label className="checkbox-row">
                                            <input
                                                type="checkbox"
                                                name="active"
                                                checked={formData.active}
                                                onChange={handleChange}
                                            />

                                            <span>{t("actionActive")}</span>
                                        </label>
                                    </div>

                                    {/* Form actions */}
                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            className="secondary-action-button"
                                            onClick={() => {
                                                handleReset();
                                                setShowForm(false);
                                            }}
                                            disabled={saving}
                                        >
                                            <X size={17} />
                                            {t("cancel")}
                                        </button>

                                        <button
                                            type="submit"
                                            className="primary-action-button"
                                            disabled={saving}
                                        >
                                            <Save size={17} />
                                            {saving
                                                ? t("saving")
                                                : t("save")}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Existing agricultural actions */}
                        <div className="actions-card">
                            <div className="section-heading">
                                <h2>
                                    {t("agriculturalActionsList")}
                                </h2>

                                <p>
                                    {t("agriculturalActionsListDescription")}
                                </p>
                            </div>

                            {loading ? (
                                <div className="empty-state">
                                    <RefreshCw className="spin" size={25} />
                                    <p>{t("loading")}</p>
                                </div>
                            ) : actions.length === 0 ? (
                                <div className="empty-state">
                                    <BookOpen size={35} />
                                    <p>{t("noAgriculturalActions")}</p>
                                </div>
                            ) : (
                                <div className="actions-table-wrapper">
                                    <table className="actions-table">
                                        <thead>
                                            <tr>
                                                <th>{t("actionName")}</th>
                                                <th>{t("actionCategory")}</th>
                                                <th>{t("applicableCrop")}</th>
                                                <th>{t("applicableGrowthStage")}</th>
                                                <th>Resource requirements</th>
                                                <th>{t("evidenceStatus")}</th>
                                                <th>{t("status")}</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {actions.map((action) => (
                                                <tr key={action.id}>
                                                    <td>
                                                        <div className="action-name-cell">
                                                            <strong>
                                                                {action.actionName}
                                                            </strong>

                                                            {action.description && (
                                                                <small>
                                                                    {action.description}
                                                                </small>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        {action.category || "—"}
                                                    </td>

                                                    <td>
                                                        {action.applicableCrop || "—"}
                                                    </td>

                                                    <td>
                                                        {action.applicableGrowthStage || "—"}
                                                    </td>

                                                    <td>
                                                        <small>
                                                            Water:{" "}
                                                            {renderOptionalValue(
                                                                action.requiredWater,
                                                                "L"
                                                            )}
                                                            <br />
                                                            Labour:{" "}
                                                            {renderOptionalValue(
                                                                action.requiredLabour,
                                                                "person-days"
                                                            )}
                                                            <br />
                                                            Budget:{" "}
                                                            {renderOptionalValue(
                                                                action.requiredBudget,
                                                                "₹"
                                                            )}
                                                        </small>
                                                    </td>

                                                    <td>
                                                        <span className="evidence-badge">
                                                            {action.evidenceStatus || "—"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={
                                                                action.active
                                                                    ? "status-badge active"
                                                                    : "status-badge inactive"
                                                            }
                                                        >
                                                            {action.active
                                                                ? t("active")
                                                                : t("inactive")}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AgriculturalActions;
