import { useEffect, useState } from "react";

import { toast } from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

import Sidebar from "../../components/Sidebar/Sidebar";
import LanguageSelector from "../../components/LanguageSelector/LanguageSelector";

import { getFarmsByFarmerId } from "../../services/farmService";

import {
    getFarmStateByFarmId,
    addFarmState,
    updateFarmState
} from "../../services/farmStateService";

import "./FarmState.css";
import farmFields from "../../assets/farm-fields.jpg";

function FarmState() {

    const { farmer } = useAuth();
    const { t } = useLanguage();

    const [farms, setFarms] = useState([]);
    const [selectedFarmId, setSelectedFarmId] = useState("");

    const [farmState, setFarmState] = useState(null);

    const [loadingFarms, setLoadingFarms] = useState(true);
    const [loadingState, setLoadingState] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        crop: "",
        growthStage: "",

        soilMoisture: "",
        soilPh: "",

        nitrogen: "",
        phosphorus: "",
        potassium: "",

        temperature: "",
        humidity: "",
        rainfall: "",

        waterAvailable: "",
        labourAvailable: "",
        budgetAvailable: "",

        cropHealth: "",
        diseaseStatus: ""
    });


    /*
     * Load only farms belonging to the logged-in farmer.
     */
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

                const data = await getFarmsByFarmerId(
                    farmer.userId
                );

                const farmerFarms = data || [];

                setFarms(farmerFarms);

                if (farmerFarms.length > 0) {

                    setSelectedFarmId(
                        String(farmerFarms[0].id)
                    );

                } else {

                    setSelectedFarmId("");

                }

            } catch (error) {

                console.error(error);

                toast.error(
                    error.response?.data?.message ||
                    t("farmsLoadFailed")
                );

                setFarms([]);
                setSelectedFarmId("");

            } finally {

                setLoadingFarms(false);

            }
        };

        loadFarms();

    }, [farmer?.userId, t]);


    /*
     * Reset the form when a selected farm
     * does not have a Farm State yet.
     */
    const resetFormForSelectedFarm = () => {

        const selectedFarm = farms.find(
            (farm) =>
                String(farm.id) === String(selectedFarmId)
        );

        setFormData({

            crop: selectedFarm?.crop || "",
            growthStage: selectedFarm?.growthStage || "",

            soilMoisture: "",
            soilPh: "",

            nitrogen: "",
            phosphorus: "",
            potassium: "",

            temperature: "",
            humidity: "",
            rainfall: "",

            waterAvailable: "",
            labourAvailable: "",
            budgetAvailable: "",

            cropHealth: "",
            diseaseStatus: ""

        });
    };


    /*
     * Load Farm State whenever selected farm changes.
     */
    useEffect(() => {

        const loadFarmState = async () => {

            if (!selectedFarmId) {

                setFarmState(null);
                return;
            }

            /*
             * Clear the previous farm's state immediately.
             * This prevents an old farmState.id from being
             * used while the new farm is loading.
             */
            setFarmState(null);

            try {

                setLoadingState(true);

                const data = await getFarmStateByFarmId(
                    selectedFarmId
                );

                /*
                 * If backend returns null,
                 * this farm does not have a state yet.
                 */
                if (!data) {

                    setFarmState(null);
                    resetFormForSelectedFarm();

                    return;
                }

                setFarmState(data);

                setFormData({

                    crop: data.crop || "",
                    growthStage: data.growthStage || "",

                    soilMoisture: data.soilMoisture ?? "",
                    soilPh: data.soilPh ?? "",

                    nitrogen: data.nitrogen ?? "",
                    phosphorus: data.phosphorus ?? "",
                    potassium: data.potassium ?? "",

                    temperature: data.temperature ?? "",
                    humidity: data.humidity ?? "",
                    rainfall: data.rainfall ?? "",

                    waterAvailable: data.waterAvailable ?? "",
                    labourAvailable: data.labourAvailable ?? "",
                    budgetAvailable: data.budgetAvailable ?? "",

                    cropHealth: data.cropHealth || "",
                    diseaseStatus: data.diseaseStatus || ""

                });

            } catch (error) {

                console.error(error);

                if (error.response?.status === 404) {

                    setFarmState(null);
                    resetFormForSelectedFarm();

                } else {

                    toast.error(
                        error.response?.data?.message ||
                        t("farmStateLoadFailed")
                    );

                }

            } finally {

                setLoadingState(false);

            }
        };

        loadFarmState();

    }, [selectedFarmId, farms, t]);


    /*
     * Handle farm selection.
     */
    const handleFarmChange = (event) => {

        const farmId = event.target.value;

        /*
         * Change selected farm.
         */
        setSelectedFarmId(farmId);

        /*
         * Clear previous farm state immediately.
         * This prevents accidental update of the
         * previous farm's Farm State.
         */
        setFarmState(null);

        /*
         * Clear the form while the new farm state
         * is being loaded.
         */
        const selectedFarm = farms.find(
            (farm) =>
                String(farm.id) === String(farmId)
        );

        setFormData({

            crop: selectedFarm?.crop || "",
            growthStage: selectedFarm?.growthStage || "",

            soilMoisture: "",
            soilPh: "",

            nitrogen: "",
            phosphorus: "",
            potassium: "",

            temperature: "",
            humidity: "",
            rainfall: "",

            waterAvailable: "",
            labourAvailable: "",
            budgetAvailable: "",

            cropHealth: "",
            diseaseStatus: ""

        });
    };


    /*
     * Handle form field changes.
     */
    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({

            ...previous,
            [name]: value

        }));

    };


    /*
     * Save Farm State.
     */
    const handleSave = async (event) => {

        event.preventDefault();

        if (!selectedFarmId) {

            toast.error(t("pleaseSelectFarm"));

            return;
        }

        try {

            setSaving(true);

            const farmStateData = {

                farm: {
                    id: Number(selectedFarmId)
                },

                crop:
                    formData.crop.trim() || null,

                growthStage:
                    formData.growthStage.trim() || null,

                soilMoisture:
                    formData.soilMoisture === ""
                        ? null
                        : Number(formData.soilMoisture),

                soilPh:
                    formData.soilPh === ""
                        ? null
                        : Number(formData.soilPh),

                /*
                 * Soil nutrients required by the
                 * Crop Recommendation ML model.
                 */
                nitrogen:
                    formData.nitrogen === ""
                        ? null
                        : Number(formData.nitrogen),

                phosphorus:
                    formData.phosphorus === ""
                        ? null
                        : Number(formData.phosphorus),

                potassium:
                    formData.potassium === ""
                        ? null
                        : Number(formData.potassium),

                temperature:
                    formData.temperature === ""
                        ? null
                        : Number(formData.temperature),

                humidity:
                    formData.humidity === ""
                        ? null
                        : Number(formData.humidity),

                rainfall:
                    formData.rainfall === ""
                        ? null
                        : Number(formData.rainfall),

                waterAvailable:
                    formData.waterAvailable === ""
                        ? null
                        : Number(formData.waterAvailable),

                labourAvailable:
                    formData.labourAvailable === ""
                        ? null
                        : Number(formData.labourAvailable),

                budgetAvailable:
                    formData.budgetAvailable === ""
                        ? null
                        : Number(formData.budgetAvailable),

                cropHealth:
                    formData.cropHealth.trim() || null,

                diseaseStatus:
                    formData.diseaseStatus.trim() || null

            };

            let response;

            /*
             * If a Farm State already exists for this
             * selected farm, update it.
             */
            if (farmState?.id) {

                response = await updateFarmState(
                    farmState.id,
                    farmStateData
                );

                toast.success(
                    t("farmStateUpdated")
                );

            } else {

                /*
                 * Otherwise create a new Farm State.
                 */
                response = await addFarmState(
                    farmStateData
                );

                toast.success(
                    t("farmStateCreated")
                );
            }

            /*
             * Store the newly created/updated state.
             */
            setFarmState(response);

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                t("farmStateSaveFailed")
            );

        } finally {

            setSaving(false);

        }
    };


    const selectedFarm = farms.find(
        (farm) =>
            String(farm.id) === String(selectedFarmId)
    );


    return (

        <div className="farm-state-layout">

            <Sidebar />

            <main className="farm-state-main">

                {/* Header */}

                <header className="farm-state-header">

                    <div>

                        <h1>
                            {t("farmState")}
                        </h1>

                        <p>
                            {t("farmStateSubtitle")}
                        </p>

                    </div>

                    <LanguageSelector />

                </header>

                <section className="farm-state-hero">
    <img
        src={farmFields}
        alt="Green agricultural fields"
        className="farm-state-hero-image"
    />

    <div className="farm-state-hero-overlay" />

    <div className="farm-state-hero-content">
        <span>AGRISENSE · FIELD MONITORING</span>
        <h2>{t("farmState")}</h2>
        <p>{t("farmStateSubtitle")}</p>
    </div>
</section>


                {/* No farms */}

                {!loadingFarms && farms.length === 0 && (

                    <section className="farm-state-empty">

                        <div className="farm-state-empty-icon">
                            🌱
                        </div>

                        <h2>
                            {t("noFarmAvailable")}
                        </h2>

                        <p>
                            {t("addFarmFirst")}
                        </p>

                    </section>

                )}


                {/* Loading farms */}

                {loadingFarms && (

                    <section className="farm-state-message">

                        {t("loadingYourFarms")}

                    </section>

                )}


                {!loadingFarms && farms.length > 0 && (

                    <>

                        {/* Farm selector */}

                        <section className="farm-selector-card">

                            <div>

                                <label htmlFor="farm-select">

                                    {t("selectFarm")}

                                </label>

                                <p>

                                    {t("selectFarmDescription")}

                                </p>

                            </div>

                            <select
                                id="farm-select"
                                value={selectedFarmId}
                                onChange={handleFarmChange}
                            >

                                {farms.map((farm) => (

                                    <option
                                        key={farm.id}
                                        value={farm.id}
                                    >

                                        {farm.farmName} — {farm.location}

                                    </option>

                                ))}

                            </select>

                        </section>


                        {/* Selected Farm Summary */}

                        {selectedFarm && (

                            <section className="selected-farm-card">

                                <div className="selected-farm-icon">
                                    🌾
                                </div>

                                <div>

                                    <h2>
                                        {selectedFarm.farmName}
                                    </h2>

                                    <p>
                                        {selectedFarm.location}
                                    </p>

                                </div>


                                <div className="selected-farm-info">

                                    <span>
                                        {t("crop")}
                                    </span>

                                    <strong>
                                        {selectedFarm.crop || "—"}
                                    </strong>

                                </div>


                                <div className="selected-farm-info">

                                    <span>
                                        {t("area")}
                                    </span>

                                    <strong>
                                        {selectedFarm.area} acres
                                    </strong>

                                </div>


                                <div className="selected-farm-info">

                                    <span>
                                        {t("growthStage")}
                                    </span>

                                    <strong>
                                        {selectedFarm.growthStage || "—"}
                                    </strong>

                                </div>

                            </section>

                        )}


                        {/* Farm State Loading */}

                        {loadingState ? (

                            <section className="farm-state-message">

                                {t("loadingFarmState")}

                            </section>

                        ) : (

                            <form
                                className="farm-state-form"
                                onSubmit={handleSave}
                            >

                                {/* Crop Information */}

                                <section className="state-section">

                                    <div className="state-section-header">

                                        <div className="state-section-icon">
                                            🌱
                                        </div>

                                        <div>

                                            <h2>
                                                {t("cropInformation")}
                                            </h2>

                                            <p>
                                                {t(
                                                    "cropInformationDescription"
                                                )}
                                            </p>

                                        </div>

                                    </div>


                                    <div className="state-grid">

                                        <div className="state-form-group">

                                            <label>
                                                {t("crop")}
                                            </label>

                                            <input
                                                type="text"
                                                name="crop"
                                                value={formData.crop}
                                                onChange={handleChange}
                                                placeholder={t("cropExample")}
                                            />

                                        </div>


                                        <div className="state-form-group">

                                            <label>
                                                {t("growthStage")}
                                            </label>

                                            <select
                                                name="growthStage"
                                                value={formData.growthStage}
                                                onChange={handleChange}
                                            >

                                                <option value="">
                                                    {t("selectStage")}
                                                </option>

                                                <option value="Seedling">
                                                    {t("seedling")}
                                                </option>

                                                <option value="Vegetative">
                                                    {t("vegetative")}
                                                </option>

                                                <option value="Flowering">
                                                    {t("flowering")}
                                                </option>

                                                <option value="Fruiting">
                                                    {t("fruiting")}
                                                </option>

                                                <option value="Maturity">
                                                    {t("maturity")}
                                                </option>

                                                <option value="Harvest">
                                                    {t("harvest")}
                                                </option>

                                            </select>

                                        </div>

                                    </div>

                                </section>


                                {/* Soil Conditions */}

                                <section className="state-section">

                                    <div className="state-section-header">

                                        <div className="state-section-icon">
                                            🪨
                                        </div>

                                        <div>

                                            <h2>
                                                {t("soilConditions")}
                                            </h2>

                                            <p>
                                                {t(
                                                    "soilConditionsDescription"
                                                )}
                                            </p>

                                        </div>

                                    </div>


                                    <div className="state-grid state-grid-three">

                                        {/* Soil Moisture */}

                                        <div className="state-form-group">

                                            <label>
                                                {t("soilMoisture")}
                                            </label>

                                            <input
                                                type="number"
                                                name="soilMoisture"
                                                value={
                                                    formData.soilMoisture
                                                }
                                                onChange={handleChange}
                                                step="0.01"
                                            />

                                            <small>
                                                {t("measuredMoisture")}
                                            </small>

                                        </div>


                                        {/* Soil pH */}

                                        <div className="state-form-group">

                                            <label>
                                                {t("soilPh")}
                                            </label>

                                            <input
                                                type="number"
                                                name="soilPh"
                                                value={formData.soilPh}
                                                onChange={handleChange}
                                                min="0"
                                                max="14"
                                                step="0.01"
                                            />

                                            <small>
                                                {t("phScale")}
                                            </small>

                                        </div>


                                        {/* Nitrogen */}

                                        <div className="state-form-group">

                                            <label>
                                                {t("nitrogen")}
                                            </label>

                                            <input
                                                type="number"
                                                name="nitrogen"
                                                value={formData.nitrogen}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                placeholder={t(
                                                    "nitrogenUnit"
                                                )}
                                            />

                                        </div>


                                        {/* Phosphorus */}

                                        <div className="state-form-group">

                                            <label>
                                                {t("phosphorus")}
                                            </label>

                                            <input
                                                type="number"
                                                name="phosphorus"
                                                value={formData.phosphorus}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                placeholder={t(
                                                    "phosphorusUnit"
                                                )}
                                            />

                                        </div>


                                        {/* Potassium */}

                                        <div className="state-form-group">

                                            <label>
                                                {t("potassium")}
                                            </label>

                                            <input
                                                type="number"
                                                name="potassium"
                                                value={formData.potassium}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                placeholder={t(
                                                    "potassiumUnit"
                                                )}
                                            />

                                        </div>

                                    </div>

                                </section>


                                {/* Weather Conditions */}

                                <section className="state-section">

                                    <div className="state-section-header">

                                        <div className="state-section-icon">
                                            ☁️
                                        </div>

                                        <div>

                                            <h2>
                                                {t("weatherConditions")}
                                            </h2>

                                            <p>
                                                {t(
                                                    "weatherConditionsDescription"
                                                )}
                                            </p>

                                        </div>

                                    </div>


                                    <div className="state-grid state-grid-three">

                                        <div className="state-form-group">

                                            <label>
                                                {t("temperature")}
                                            </label>

                                            <input
                                                type="number"
                                                name="temperature"
                                                value={
                                                    formData.temperature
                                                }
                                                onChange={handleChange}
                                                placeholder={t(
                                                    "temperatureUnit"
                                                )}
                                                step="0.01"
                                            />

                                        </div>


                                        <div className="state-form-group">

                                            <label>
                                                {t("humidity")}
                                            </label>

                                            <input
                                                type="number"
                                                name="humidity"
                                                value={
                                                    formData.humidity
                                                }
                                                onChange={handleChange}
                                                placeholder={t(
                                                    "humidityUnit"
                                                )}
                                                min="0"
                                                max="100"
                                                step="0.01"
                                            />

                                        </div>


                                        <div className="state-form-group">

                                            <label>
                                                {t("rainfall")}
                                            </label>

                                            <input
                                                type="number"
                                                name="rainfall"
                                                value={
                                                    formData.rainfall
                                                }
                                                onChange={handleChange}
                                                placeholder={t(
                                                    "rainfallUnit"
                                                )}
                                                min="0"
                                                step="0.01"
                                            />

                                        </div>

                                    </div>

                                </section>


                                {/* Available Resources */}

                                <section className="state-section">

                                    <div className="state-section-header">

                                        <div className="state-section-icon">
                                            💧
                                        </div>

                                        <div>

                                            <h2>
                                                {t("availableResources")}
                                            </h2>

                                            <p>
                                                {t(
                                                    "availableResourcesDescription"
                                                )}
                                            </p>

                                        </div>

                                    </div>


                                    <div className="state-grid state-grid-three">

                                        <div className="state-form-group">

                                            <label>
                                                {t("waterAvailable")}
                                            </label>

                                            <input
                                                type="number"
                                                name="waterAvailable"
                                                value={
                                                    formData.waterAvailable
                                                }
                                                onChange={handleChange}
                                                placeholder={t(
                                                    "waterQuantity"
                                                )}
                                                min="0"
                                                step="0.01"
                                            />

                                        </div>


                                        <div className="state-form-group">

                                            <label>
                                                {t("labourAvailable")}
                                            </label>

                                            <input
                                                type="number"
                                                name="labourAvailable"
                                                value={
                                                    formData.labourAvailable
                                                }
                                                onChange={handleChange}
                                                placeholder={t(
                                                    "workersCount"
                                                )}
                                                min="0"
                                                step="1"
                                            />

                                        </div>


                                        <div className="state-form-group">

                                            <label>
                                                {t("budgetAvailable")}
                                            </label>

                                            <input
                                                type="number"
                                                name="budgetAvailable"
                                                value={
                                                    formData.budgetAvailable
                                                }
                                                onChange={handleChange}
                                                placeholder={t(
                                                    "availableBudget"
                                                )}
                                                min="0"
                                                step="0.01"
                                            />

                                        </div>

                                    </div>

                                </section>


                                {/* Crop Health */}

                                <section className="state-section">

                                    <div className="state-section-header">

                                        <div className="state-section-icon">
                                            ❤️
                                        </div>

                                        <div>

                                            <h2>
                                                {t("cropHealth")}
                                            </h2>

                                            <p>
                                                {t(
                                                    "cropHealthDescription"
                                                )}
                                            </p>

                                        </div>

                                    </div>


                                    <div className="state-grid">

                                        <div className="state-form-group">

                                            <label>
                                                {t("cropHealth")}
                                            </label>

                                            <select
                                                name="cropHealth"
                                                value={
                                                    formData.cropHealth
                                                }
                                                onChange={handleChange}
                                            >

                                                <option value="">
                                                    {t("selectCondition")}
                                                </option>

                                                <option value="Healthy">
                                                    {t("healthy")}
                                                </option>

                                                <option value="Moderate">
                                                    {t("moderate")}
                                                </option>

                                                <option value="Poor">
                                                    {t("poor")}
                                                </option>

                                                <option value="Unknown">
                                                    {t("unknown")}
                                                </option>

                                            </select>

                                        </div>


                                        <div className="state-form-group">

                                            <label>
                                                {t("diseaseStatus")}
                                            </label>

                                            <select
                                                name="diseaseStatus"
                                                value={
                                                    formData.diseaseStatus
                                                }
                                                onChange={handleChange}
                                            >

                                                <option value="">
                                                    {t("selectStatus")}
                                                </option>

                                                <option value="No known disease">
                                                    {t("noKnownDisease")}
                                                </option>

                                                <option value="Suspected">
                                                    {t("suspected")}
                                                </option>

                                                <option value="Confirmed">
                                                    {t("confirmed")}
                                                </option>

                                                <option value="Unknown">
                                                    {t("unknown")}
                                                </option>

                                            </select>

                                        </div>

                                    </div>

                                </section>


                                {/* Save */}

                                <div className="farm-state-actions">

                                    <button
                                        type="submit"
                                        className="save-state-button"
                                        disabled={
                                            saving || loadingState
                                        }
                                    >

                                        {saving
                                            ? t("saving")
                                            : farmState
                                                ? t("updateFarmState")
                                                : t("createFarmState")}

                                    </button>

                                </div>

                            </form>

                        )}

                    </>

                )}

            </main>

        </div>

    );
}

export default FarmState;