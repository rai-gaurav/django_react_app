import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";

function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);
    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
    }, []);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/api/token/refresh", {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            console.log(error);
            setIsAuthorized(false);
        }
    };

    const auth = async () => {
        const authToken = localStorage.getItem(ACCESS_TOKEN);
        console.log(authToken);
        if (!authToken) {
            setIsAuthorized(false);
            return;
        }
        const decoded = jwtDecode(authToken);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;
        console.log(tokenExpiration);
        if (tokenExpiration < now) {
            await refreshToken();
        } else {
            setIsAuthorized(true);
            console.log(isAuthorized);
        }
    };

    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }
    console.log(isAuthorized);
    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
