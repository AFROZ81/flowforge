import AuthHero from "../components/AuthHero";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-50">

            <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-10 p-8 lg:grid-cols-2">

                <AuthHero />

                <div className="flex items-center justify-center">

                    <LoginForm />

                </div>

            </div>

        </div>
    );
}