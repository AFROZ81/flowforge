import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { normalizeError } from "@/lib/errors";

import { useCreateBoard } from "../hooks/useCreateBoard";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
};

export default function CreateBoardDialog({
    open,
    onOpenChange,
    projectId,
}: Props) {
    const mutation = useCreateBoard();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [touched, setTouched] = useState(false);

    const clearDraft = () => {
        setName("");
        setDescription("");
        setTouched(false);
    };

    /*
     * Every close route — Escape, backdrop, Cancel, success — funnels
     * through here, so a half-typed board never survives to the next visit.
     */
    const handleOpenChange = (next: boolean) => {
        if (!next) clearDraft();

        onOpenChange(next);
    };

    const nameError =
        touched && !name.trim() ? "Give the board a name." : undefined;

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setTouched(true);

        if (!name.trim()) return;

        try {
            await mutation.mutateAsync({
                projectId,
                name: name.trim(),
                description: description.trim(),
            });

            toast.success("Board created", { description: name.trim() });
            handleOpenChange(false);
        } catch (error) {
            const { title, description: detail } = normalizeError(error, {
                title: "We couldn't create that board",
            });

            toast.error(title, { description: detail });
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create board</DialogTitle>

                    <DialogDescription>
                        A board holds the columns your work moves through.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <FormField
                        label="Board name"
                        htmlFor="board-name"
                        required
                        error={nameError}
                    >
                        {(aria) => (
                            <Input
                                {...aria}
                                value={name}
                                placeholder="Sprint 24"
                                autoComplete="off"
                                disabled={mutation.isPending}
                                onChange={(e) => setName(e.target.value)}
                            />
                        )}
                    </FormField>

                    <FormField
                        label="Description"
                        htmlFor="board-description"
                        optional
                    >
                        {(aria) => (
                            <Input
                                {...aria}
                                value={description}
                                placeholder="What this board tracks"
                                disabled={mutation.isPending}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                            />
                        )}
                    </FormField>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={mutation.isPending}
                        >
                            Cancel
                        </Button>

                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && (
                                <Loader2 className="animate-spin" />
                            )}
                            {mutation.isPending ? "Creating…" : "Create board"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
