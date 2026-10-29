import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ConstraintValidation from "./pages/ConstraintValidation/ConstraintValidation";
import FarmerProfile from "./pages/FarmerProfile/FarmerProfile";
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import MyFarms from "./pages/MyFarms/MyFarms";
import FarmState from "./pages/FarmState/FarmState";
import Predictions from "./pages/Predictions/Predictions";
import ContextInterpretation from "./pages/ContextInterpretation/ContextInterpretation";
import AgriculturalActions from "./pages/AgriculturalActions/AgriculturalActions";

function ProtectedRoute({ children }) {

    const {
        isLoggedIn,
        authReady
    } = useAuth();


    /*
     * Wait until the authentication state
     * has been restored from sessionStorage.
     */
    if (!authReady) {

        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                Loading...
            </div>
        );
    }


    /*
     * Only redirect when we know the user
     * is actually logged out.
     */
    if (!isLoggedIn) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    return children;
}


function App() {

    return (
        <Routes>

            {/* =========================
                Public Landing Page
            ========================= */}

            <Route
                path="/"
                element={<Landing />}
            />


            {/* =========================
                Public Authentication
            ========================= */}

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />


            {/* =========================
                Protected Application
            ========================= */}

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />


            <Route
                path="/farms"
                element={
                    <ProtectedRoute>
                        <MyFarms />
                    </ProtectedRoute>
                }
            />


            <Route
                path="/farm-state"
                element={
                    <ProtectedRoute>
                        <FarmState />
                    </ProtectedRoute>
                }
            />


            <Route
                path="/farmer-profile"
                element={
                    <ProtectedRoute>
                        <FarmerProfile />
                    </ProtectedRoute>
                }
            />


            <Route
                path="/predictions"
                element={
                    <ProtectedRoute>
                        <Predictions />
                    </ProtectedRoute>
                }
            />


            {/* =========================
                Context Interpretation
            ========================= */}

            <Route
                path="/context-interpretation"
                element={
                    <ProtectedRoute>
                        <ContextInterpretation />
                    </ProtectedRoute>
                }
            />
{/* =========================
    Constraint / Feasibility Validation
========================= */}

<Route
    path="/constraint-validation"
    element={
        <ProtectedRoute>
            <ConstraintValidation />
        </ProtectedRoute>
    }
/>
<Route
    path="/agricultural-actions"
    element={
        <ProtectedRoute>
            <AgriculturalActions />
        </ProtectedRoute>
    }
/>


            {/* =========================
                Unknown Routes
            ========================= */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />


        </Routes>
    );
}


export default App;