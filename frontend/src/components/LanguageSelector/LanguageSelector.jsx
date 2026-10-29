import { useLanguage } from "../../context/LanguageContext";

import "./LanguageSelector.css";

function LanguageSelector() {
    const { language, changeLanguage } = useLanguage();

    return (
        <div className="language-selector">
            <span className="language-icon">🌐</span>

            <select
                value={language}
                onChange={(event) =>
                    changeLanguage(event.target.value)
                }
                aria-label="Select language"
            >
                <option value="en">English</option>
                <option value="te">తెలుగు</option>
                <option value="hi">हिन्दी</option>
            </select>
        </div>
    );
}

export default LanguageSelector;