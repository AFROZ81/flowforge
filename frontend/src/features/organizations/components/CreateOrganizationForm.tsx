import { useState } from "react";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { normalizeError } from "@/lib/errors";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toOrganizationSlug } from "@/features/auth/lib/organization-slug";
import { useCreateOrganization } from "../hooks/useOrganizations";

type Props = {
    onCreated?: (organization: {
        id: string;
        accessToken: string;
        expiresAtUtc: string;
        organizationId: string | null;
    }) => void;
};

export default function CreateOrganizationForm({ onCreated }: Props) {
    const [name, setName] = useState("");
    const createOrganization = useCreateOrganization();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmed = name.trim();

        if (trimmed.length < 2) {
            toast.error("Give the workspace a name of at least 2 characters.");
            return;
        }

        try {
            const created = await createOrganization.mutateAsync({
                name: trimmed,
                slug: toOrganizationSlug(trimmed),
            });

            toast.success("Workspace created", {
                description: `You are now the owner of ${created.name}.`,
            });

            onCreated?.(created);
        } catch (error) {
            const { title, description } = normalizeError(error, {
                title: "We couldn't create that workspace",
            });

            toast.error(title, { description });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
                <Label htmlFor="workspace-name">Workspace name</Label>
                <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="workspace-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Acme Studio"
                        autoComplete="organization"
                        disabled={createOrganization.isPending}
                        className="pl-9"
                        required
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={createOrganization.isPending}
            >
                {createOrganization.isPending ? (
                    <>
                        <Loader2 className="size-4 animate-spin" />
                        Creating workspace…
                    </>
                ) : (
                    "Create workspace"
                )}
            </Button>
        </form>
    );
}
