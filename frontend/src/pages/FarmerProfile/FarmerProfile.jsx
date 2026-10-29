import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import Sidebar from "../../components/Sidebar/Sidebar";
import LanguageSelector from "../../components/LanguageSelector/LanguageSelector";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

import {
    getFarmerById,
    updateFarmer
} from "../../services/farmerService";

import "./FarmerProfile.css";
import farmerField from "../../assets/farmer-field.jpg";
function FarmerProfile() {
    const { farmer, setAuthenticatedFarmer } = useAuth();
    const { t } = useLanguage();

    const [profile, setProfile] = useState({
        id: "",
        name: "",
        email: "",
        phone: "",
        location: ""
    });

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            if (!farmer?.userId) {
                setLoading(false);
                return;
            }

            try {
                const data = await getFarmerById(farmer.userId);

                setProfile({
                    id: data.id,
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    location: data.location || ""
                });
            } catch (error) {
                console.error(error);

                toast.error(
                    error.response?.data?.message ||
                    t("profileLoadFailed")
                );
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [farmer?.userId, t]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleEdit = () => {
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);

        // Reload original data when cancelling edits
        if (farmer?.userId) {
            getFarmerById(farmer.userId)
                .then((data) => {
                    setProfile({
                        id: data.id,
                        name: data.name || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        location: data.location || ""
                    });
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    };

    const handleSave = async () => {
        if (!profile.name.trim()) {
            toast.error(t("nameRequired"));
            return;
        }

        try {
            setSaving(true);

            const updated = await updateFarmer(
                farmer.userId,
                {
                    name: profile.name.trim(),
                    phone: profile.phone.trim(),
                    location: profile.location.trim()
                }
            );

            setProfile({
                id: updated.id,
                name: updated.name || "",
                email: updated.email || "",
                phone: updated.phone || "",
                location: updated.location || ""
            });

            // Update shared farmer information
            // so Dashboard immediately reflects the changes.
            setAuthenticatedFarmer({
                ...farmer,
                userId: updated.id,
                name: updated.name,
                email: updated.email,
                phone: updated.phone,
                location: updated.location
            });

            setEditing(false);

            toast.success(t("profileUpdated"));
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                t("profileUpdateFailed")
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-layout">
                <Sidebar />

                <main className="profile-main">
                    <div className="profile-loading">
                        {t("loading")}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="profile-layout">
            <Sidebar />

            <main className="profile-main">

                <header className="profile-header">
                    <div>
                        <h1>{t("farmerProfile")}</h1>

                        <p>
                            {t("farmerProfileSubtitle")}
                        </p>
                    </div>

                    <LanguageSelector />
                </header>

<section className="profile-hero">
    <img
        src={farmerField}
        alt="Farmer working in a green agricultural field"
        className="profile-hero-image"
    />

    <div className="profile-hero-overlay" />

    <div className="profile-hero-content">
        <span>AGRISENSE · FARMER PROFILE</span>
        <h2>{t("farmerProfile")}</h2>
        <p>{t("farmerProfileSubtitle")}</p>
    </div>
</section>

                <section className="profile-card">

                    <div className="profile-card-header">

                        <div className="profile-avatar">
                            👤
                        </div>

                        <div>
                            <h2>{profile.name}</h2>

                            <p>{profile.email}</p>
                        </div>

                    </div>


                    <div className="profile-form">

                        <div className="profile-form-group">
                            <label htmlFor="profile-name">
                                {t("name")}
                            </label>

                            <input
                                id="profile-name"
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                disabled={!editing}
                            />
                        </div>


                        <div className="profile-form-group">
                            <label htmlFor="profile-email">
                                {t("email")}
                            </label>

                            <input
                                id="profile-email"
                                type="email"
                                value={profile.email}
                                disabled
                            />

                            <small>
                                {t("emailCannotChange")}
                            </small>
                        </div>


                        <div className="profile-form-group">
                            <label htmlFor="profile-phone">
                                {t("phone")}
                            </label>

                            <input
                                id="profile-phone"
                                type="tel"
                                name="phone"
                                value={profile.phone}
                                onChange={handleChange}
                                disabled={!editing}
                            />
                        </div>


                        <div className="profile-form-group">
                            <label htmlFor="profile-location">
                                {t("location")}
                            </label>

                            <input
                                id="profile-location"
                                type="text"
                                name="location"
                                value={profile.location}
                                onChange={handleChange}
                                disabled={!editing}
                            />
                        </div>

                    </div>


                    <div className="profile-actions">

                        {!editing ? (
                            <button
                                type="button"
                                className="profile-edit-button"
                                onClick={handleEdit}
                            >
                                {t("editProfile")}
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="profile-cancel-button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    {t("cancel")}
                                </button>

                                <button
                                    type="button"
                                    className="profile-save-button"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving
                                        ? t("saving")
                                        : t("saveChanges")}
                                </button>
                            </>
                        )}

                    </div>

                </section>

            </main>
        </div>
    );
}

export default FarmerProfile;