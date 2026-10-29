import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import Sidebar from "../../components/Sidebar/Sidebar";
import LanguageSelector from "../../components/LanguageSelector/LanguageSelector";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

import {
    getFarmsByFarmerId,
    addFarm,
    updateFarm,
    deleteFarm
} from "../../services/farmService";
import farmFields from "../../assets/farm-fields.jpg";
import agricultureLandscape from "../../assets/agriculture-landscape.jpg";
import farmerField from "../../assets/farmer-field.jpg";
import "./MyFarms.css";

function MyFarms() {
    const { farmer } = useAuth();
    const { t } = useLanguage();

    const emptyForm = {
        farmName: "",
        location: "",
        area: "",
        crop: "",
        variety: "",
        growthStage: ""
    };

    const [farms, setFarms] = useState([]);
    const [form, setForm] = useState(emptyForm);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editingFarmId, setEditingFarmId] = useState(null);

    const loadFarms = async () => {
        if (!farmer?.userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const data = await getFarmsByFarmerId(
                farmer.userId
            );

            setFarms(data || []);
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                t("farmsLoadFailed")
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFarms();
    }, [farmer?.userId]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleAddClick = () => {
        setEditingFarmId(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const handleEdit = (farm) => {
        setEditingFarmId(farm.id);

        setForm({
            farmName: farm.farmName || "",
            location: farm.location || "",
            area: farm.area ?? "",
            crop: farm.crop || "",
            variety: farm.variety || "",
            growthStage: farm.growthStage || ""
        });

        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingFarmId(null);
        setForm(emptyForm);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (
            !form.farmName.trim() ||
            !form.location.trim() ||
            !form.area ||
            !form.crop.trim()
        ) {
            toast.error(t("farmRequiredFields"));
            return;
        }

        try {
            setSaving(true);

            const farmData = {
                farmer: {
                    id: farmer.userId
                },
                farmName: form.farmName.trim(),
                location: form.location.trim(),
                area: Number(form.area),
                crop: form.crop.trim(),
                variety: form.variety.trim(),
                growthStage: form.growthStage.trim()
            };

            if (editingFarmId) {
                await updateFarm(
                    editingFarmId,
                    farmData
                );

                toast.success(t("farmUpdated"));
            } else {
                await addFarm(farmData);

                toast.success(t("farmAdded"));
            }

            handleCancel();
            await loadFarms();

        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                t("farmSaveFailed")
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (farmId) => {
        const confirmed = window.confirm(
            t("confirmFarmDelete")
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteFarm(farmId);

            toast.success(t("farmDeleted"));

            await loadFarms();
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                t("farmDeleteFailed")
            );
        }
    };

    return (
        <div className="farms-layout">

            <Sidebar />

            <main className="farms-main">

                <header className="farms-header">

                    <div>
                        <h1>{t("myFarms")}</h1>

                        <p>
                            {t("myFarmsSubtitle")}
                        </p>
                    </div>

                    <LanguageSelector />

                </header>

<section className="farms-hero">
    <img
        src={agricultureLandscape}
        alt="Aerial view of agricultural fields"
        className="farms-hero-image"
    />
    <div className="farms-hero-overlay" />
    <div className="farms-hero-content">
        <span>YOUR AGRICULTURAL SPACE</span>
        <h2>{t("myFarms")}</h2>
        <p>{t("myFarmsSubtitle")}</p>
    </div>
</section>

                <section className="farms-content">

                    <div className="farms-toolbar">

                        <div>
                            <h2>{t("farmList")}</h2>

                            <p>
                                {t("farmCount")}: {farms.length}
                            </p>
                        </div>

                        <button
                            type="button"
                            className="farm-add-button"
                            onClick={handleAddClick}
                        >
                            + {t("addFarm")}
                        </button>

                    </div>


                    {showForm && (
                        <section className="farm-form-card">

                            <h2>
                                {editingFarmId
                                    ? t("editFarm")
                                    : t("addFarm")}
                            </h2>

                            <form onSubmit={handleSubmit}>

                                <div className="farm-form-grid">

                                    <div className="farm-form-group">
                                        <label>
                                            {t("farmName")}
                                        </label>

                                        <input
                                            type="text"
                                            name="farmName"
                                            value={form.farmName}
                                            onChange={handleChange}
                                        />
                                    </div>


                                    <div className="farm-form-group">
                                        <label>
                                            {t("location")}
                                        </label>

                                        <input
                                            type="text"
                                            name="location"
                                            value={form.location}
                                            onChange={handleChange}
                                        />
                                    </div>


                                    <div className="farm-form-group">
                                        <label>
                                            {t("area")}
                                        </label>

                                        <input
                                            type="number"
                                            name="area"
                                            value={form.area}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>


                                    <div className="farm-form-group">
                                        <label>
                                            {t("crop")}
                                        </label>

                                        <input
                                            type="text"
                                            name="crop"
                                            value={form.crop}
                                            onChange={handleChange}
                                        />
                                    </div>


                                    <div className="farm-form-group">
                                        <label>
                                            {t("variety")}
                                        </label>

                                        <input
                                            type="text"
                                            name="variety"
                                            value={form.variety}
                                            onChange={handleChange}
                                        />
                                    </div>


                                    <div className="farm-form-group">
                                        <label>
                                            {t("growthStage")}
                                        </label>

                                        <input
                                            type="text"
                                            name="growthStage"
                                            value={form.growthStage}
                                            onChange={handleChange}
                                        />
                                    </div>

                                </div>


                                <div className="farm-form-actions">

                                    <button
                                        type="button"
                                        className="farm-cancel-button"
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        {t("cancel")}
                                    </button>

                                    <button
                                        type="submit"
                                        className="farm-save-button"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? t("saving")
                                            : t("saveFarm")}
                                    </button>

                                </div>

                            </form>

                        </section>
                    )}


                    {loading ? (
                        <div className="farms-loading">
                            {t("loading")}
                        </div>
                    ) : farms.length === 0 ? (

                        <div className="farms-empty">

                            <div className="farms-empty-icon">
                                🌾
                            </div>

                            <h3>
                                {t("noFarms")}
                            </h3>

                            <p>
                                {t("noFarmsDescription")}
                            </p>

                            <button
                                type="button"
                                onClick={handleAddClick}
                                className="farm-add-button"
                            >
                                + {t("addFarm")}
                            </button>

                        </div>

                    ) : (

                        <div className="farm-grid">

{farms.map((farm, index) => (

                                <article
                                    className="farm-card"
                                    key={farm.id}
                                >
<div className="farm-card-image">
    <img
        src={farmFields}
        alt="Agricultural fields"
        loading="lazy"
    />
    <span className="farm-image-label">
        {farm.crop || t("crop")}
    </span>
</div>

                                    <div className="farm-card-header">

                                        <div className="farm-card-icon">
                                            🌾
                                        </div>

                                        <div>
                                            <h3>
                                                {farm.farmName}
                                            </h3>

                                            <p>
                                                {farm.location}
                                            </p>
                                        </div>

                                    </div>


                                    <div className="farm-details">

                                        <div>
                                            <span>
                                                {t("area")}
                                            </span>

                                            <strong>
                                                {farm.area} acres
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                {t("crop")}
                                            </span>

                                            <strong>
                                                {farm.crop}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                {t("variety")}
                                            </span>

                                            <strong>
                                                {farm.variety || "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                {t("growthStage")}
                                            </span>

                                            <strong>
                                                {farm.growthStage || "-"}
                                            </strong>
                                        </div>

                                    </div>


                                    <div className="farm-card-actions">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleEdit(farm)
                                            }
                                            className="farm-edit-button"
                                        >
                                            {t("editFarm")}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(farm.id)
                                            }
                                            className="farm-delete-button"
                                        >
                                            {t("deleteFarm")}
                                        </button>

                                    </div>

                                </article>

                            ))}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default MyFarms;