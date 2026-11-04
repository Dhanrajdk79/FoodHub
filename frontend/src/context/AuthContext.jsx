
import {
    createContext,
    useContext,
    useState
} from "react";

import { logoutUser } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("user");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            return null;
        }
    });

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        logoutUser();
        setUser(null);
    };

    const isAuthenticated = Boolean(
        user && localStorage.getItem("token")
    );

    const isAdmin = isAuthenticated && user.role === "admin";
    const isCustomer = isAuthenticated && user.role === "customer";

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated,
                isAdmin,
                isCustomer
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
};
