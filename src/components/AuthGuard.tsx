import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { initializeUser } from "@/lib/db";

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
    const [isAuthResolved, setIsAuthResolved] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuth = async () => {
            const params = new URLSearchParams(window.location.search);
            const token = params.get("token");
            const sessionUserId = sessionStorage.getItem("user_id");

            if (token) {
                try {
                    const response = await fetch("https://api.mantracare.com/user/user-info", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ token }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.user_id) {
                            const userId = data.user_id.toString();
                            sessionStorage.setItem("user_id", userId);

                            // Set up User record in Neon DB
                            await initializeUser(userId);

                            // Remove token from URL
                            const url = new URL(window.location.href);
                            url.searchParams.delete("token");
                            window.history.replaceState({}, "", url.pathname + url.search);

                            setIsAuthResolved(true);
                            return;
                        }
                    }
                    throw new Error("Authentication failed");
                } catch (error) {
                    console.error("Auth error:", error);
                    window.location.href = "/token";
                }
            } else if (sessionUserId) {
                // Background check to ensure user exists
                initializeUser(sessionUserId);
                setIsAuthResolved(true);
            } else {
                window.location.href = "/token";
            }
        };

        handleAuth();
    }, [location]);

    if (!isAuthResolved) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-healing-gradient">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-secondary mb-4 ripple-pulse" />
                    <p className="text-secondary-foreground font-body">Authenticating...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
