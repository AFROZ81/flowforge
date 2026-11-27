import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { normalizeError } from "@/lib/errors";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/stores/auth.store";
import { isAdminRole } from "@/lib/auth-roles";

import { useBoardManagement } from "../hooks/useBoardManagement";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    board: {
        id: string;
        name: string;
        description?: string;
    };
};

export default function EditBoardDialog({
    open,
    onOpenChange,
    projectId,
    board,
}: Props) {
    const { update } = useBoardManagement(projectId);
    const currentUserRole = useAuthStore((state) => state.user?.role);
    const isAdmin = isAdminRole(currentUserRole);
    const [name, setName] = useState(board.name);
    const [description, setDescription] = useState(board.description ?? "");
    const [touched, setTouched] = useState(false);

    const nameError = touched && !name.trim() ? "Give the board a name." : undefined;

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!isAdmin || update.isPending) return;
        setTouched(true);

        if (!name.trim()) return;

        try {
            await update.mutateAsync({
                projectId,
                boardId: board.id,
                name: name.trim(),
                description: description.trim(),
            });

            toast.success("Board updated", { description: name.trim() });
            onOpenChange(false);
        } catch (error) {
            const { title, description: detail } = normalizeError(error, {
                title: "We couldn't update that board",
            });
            toast.error(title, { description: detail });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit board</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <FormField
                        label="Board name"
                        htmlFor="edit-board-name"
                        required
                        error={nameError}
                    >
                        {(aria) => (
                            <Input
                                {...aria}
                                value={name}
                                placeholder="Sprint 24"
                                autoComplete="off"
                                disabled={update.isPending}
                                onChange={(event) => setName(event.target.value)}
                            />
                        )}
                    </FormField>

                    <FormField
                        label="Description"
                        htmlFor="edit-board-description"
                        optional
                    >
                        {(aria) => (
                            <Input
                                {...aria}
                                value={description}
                                placeholder="What this board tracks"
                                disabled={update.isPending}
                                onChange={(event) => setDescription(event.target.value)}
                            />
                        )}
                    </FormField>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={update.isPending}
                        >
                            Cancel
                        </Button>

                        <Button type="submit" disabled={update.isPending}>
                            {update.isPending && <Loader2 className="animate-spin" />}
                            {update.isPending ? "Saving…" : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
