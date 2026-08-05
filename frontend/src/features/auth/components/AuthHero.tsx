import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const features = [
    "Real-time collaboration",
    "Kanban boards",
    "Enterprise security",
];

export default function AuthHero() {
    return (
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:flex flex-col justify-between rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-12 text-white"
        >
            <div>
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                        <ArrowRight className="h-6 w-6" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold">
                            FlowForge
                        </h1>

                        <p className="text-sm text-blue-100">
                            Enterprise Project Management
                        </p>
                    </div>
                </div>

                <h2 className="mt-16 text-5xl font-bold leading-tight">
                    Build Better.
                    <br />
                    Deliver Faster.
                </h2>

                <p className="mt-6 max-w-md text-lg text-blue-100">
                    A modern collaboration platform designed for
                    teams that build software together.
                </p>
            </div>

            <div className="space-y-4">
                {features.map((feature) => (
                    <div
                        key={feature}
                        className="flex items-center gap-3"
                    >
                        <CheckCircle2 className="h-5 w-5" />

                        <span>{feature}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}