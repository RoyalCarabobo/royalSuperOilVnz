import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useState } from "react";


export function useAuth() {
    const [loadng, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)
    const router = useRouter()

    const singIn = async (email, password) => {
        setLoading(true);
        setErrorMsg(null);
        try {
            await authService.login(email, password);
            router.push('/dashboard');
            router.refresh();
        } catch (err) {
            setErrorMsg("Credenciales inválidas. Contacte al administrador.");
        } finally {
            setLoading (false);
        }
    };

    return {singIn, loadng, errorMsg};
}