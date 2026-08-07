import { useState } from "react";
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
    const [description, setDescription] =
        useState("");

    async function handleSubmit() {
        if (!name.trim()) return;

        await mutation.mutateAsync({
            projectId,
            name,
            description,
        });

        setName("");
        setDescription("");

        onOpenChange(false);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent>

                <DialogHeader>

                    <DialogTitle>
                        Create Board
                    </DialogTitle>

                    <DialogDescription>
                        Create a new board for
                        this project.
                    </DialogDescription>

                </DialogHeader>

                <div className="space-y-4">

                    <Input
                        placeholder="Board Name"
                        value={name}
                        onChange={(e) =>
                            setName(
                                e.target.value
                            )
                        }
                    />

                    <Input
                        placeholder="Description"
                        value={description}
                        onChange={(e) =>
                            setDescription(
                                e.target.value
                            )
                        }
                    />

                </div>

                <DialogFooter>

                    <Button
                        variant="outline"
                        onClick={() =>
                            onOpenChange(false)
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={
                            mutation.isPending
                        }
                    >
                        Create
                    </Button>

                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}