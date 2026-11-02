import { Link } from "react-router";
import {
  AlertCircle,
  CheckCircle2,
  CircleDot,
  FolderKanban,
} from "lucide-react";

import { Panel } from "@/components/common/panel";
import { ProjectMark } from "@/components/common/project-mark";
import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

import { useProjectProgress } from "../hooks/useProjectProgress";

/** Clamp before it reaches a CSS width — a bad percentage shouldn't overflow. */
function clampPercent(value: number): number {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
}

type StatProps = {
  icon: typeof CircleDot;
  tone: string;
  count: number;
  label: string;
};

function Stat({ icon: Icon, tone, count, label }: StatProps) {
  return (
    <span className="flex items-center gap-1 whitespace-nowrap">
      <Icon className={cn("size-3.5 shrink-0", tone)} aria-hidden="true" />
      <span className="font-medium tabular-nums text-foreground/80">
        {formatNumber(count)}
      </span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

export default function CompletionCard() {
  const { data, isLoading, error, refetch } = useProjectProgress();

  const projects = Array.isArray(data?.data) ? data.data : [];

  return (
    <Panel
      title="Project Progress"
      description="Completion across your projects"
      isLoading={isLoading}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={projects.length === 0}
      empty={{
        title: "No projects to measure yet",
        description:
          "Once you create a project and add work items, its completion rate appears here.",
        icon: FolderKanban,
        action: (
          <Link
            to="/projects"
            className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Go to Projects
          </Link>
        ),
      }}
      skeletonHeight="h-40"
      bodyClassName="space-y-5"
    >
      {projects.map((project) => {
        const progress = clampPercent(project.completionPercentage);

        return (
          <div key={project.projectId} className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <Link
                to={`/projects/${project.projectId}`}
                className="group flex min-w-0 items-center gap-2.5 rounded-md -outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
              >
                <ProjectMark
                  color={project.color}
                  keyName={project.projectKey}
                  size="md"
                />

                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-foreground group-hover:text-primary">
                    {project.projectName}
                  </span>
                  <span className="block truncate text-[11px] tracking-wide text-muted-foreground uppercase">
                    {project.projectKey}
                  </span>
                </span>
              </Link>

              <span className="shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-foreground">
                {Math.round(project.completionPercentage)}%
              </span>
            </div>

            <ProgressBar
              value={progress}
              color={project.color}
              size="sm"
              label={`${project.projectName} completion`}
            />

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
              <Stat
                icon={CircleDot}
                tone="text-info"
                count={project.activeWorkItems}
                label="active"
              />
              <Stat
                icon={CheckCircle2}
                tone="text-success"
                count={project.completedWorkItems}
                label="done"
              />
              <Stat
                icon={AlertCircle}
                tone="text-danger"
                count={project.blockedWorkItems}
                label="blocked"
              />
              {project.overdueWorkItems > 0 && (
                <Stat
                  icon={AlertCircle}
                  tone="text-warning"
                  count={project.overdueWorkItems}
                  label="overdue"
                />
              )}
            </div>
          </div>
        );
      })}
    </Panel>
  );
}
