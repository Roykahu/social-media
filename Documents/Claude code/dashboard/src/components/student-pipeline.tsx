"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Student, StudentStage, getStudentStage, PendingRecord } from "@/lib/types";
import { bulkDeleteStudents, bulkRestoreStudents, getStudents } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StudentProfileModal } from "@/components/student-profile-modal";
import { StudentImportModal } from "@/components/student-import-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const UNDO_WINDOW_MS = 10_000;

function parseTeacherName(raw: string | null): string {
  if (!raw) return "";
  const teachers = raw.split(",").map((t) => {
    const trimmed = t.trim();
    const cut = trimmed.split(/[\n\r]|Adresse|SIRET|NDA|Domicili|Numero de Siret|N SIRET|\d{10,}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+/)[0].trim();
    return cut.replace(/[:\s]+$/, "");
  });
  const unique = [...new Set(teachers.filter(Boolean))];
  return unique.join(", ");
}

const stageBadgeColor: Record<StudentStage, string> = {
  Enrolled: "bg-slate-700/50 text-slate-300 border border-slate-600",
  "Oral Test Done": "bg-blue-900/40 text-blue-300 border border-blue-700",
  "Fiche Created": "bg-amber-900/40 text-amber-300 border border-amber-700",
  "In Progress": "bg-emerald-900/40 text-emerald-300 border border-emerald-700",
  Completed: "bg-blue-900/40 text-blue-300 border border-blue-700",
};

const stageColors = [
  "from-slate-500 to-slate-600",
  "from-blue-500 to-blue-600",
  "from-amber-500 to-amber-600",
  "from-emerald-500 to-emerald-600",
  "from-blue-500 to-blue-600",
];

const stages: StudentStage[] = [
  "Enrolled",
  "Oral Test Done",
  "Fiche Created",
  "In Progress",
  "Completed",
];

export function StudentPipeline({ students, oralTests = [] }: { students: Student[]; oralTests?: PendingRecord[] }) {
  const oralTestMap = new Map<string, PendingRecord>();
  for (const ot of oralTests) {
    if (ot.studentEmail) {
      const key = ot.studentEmail.toLowerCase().trim();
      if (!oralTestMap.has(key) || (ot.id > (oralTestMap.get(key)?.id ?? ""))) {
        oralTestMap.set(key, ot);
      }
    }
  }
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [importOpen, setImportOpen] = useState(false);

  // Bulk-delete state
  const [list, setList] = useState<Student[]>(students);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedLoading, setArchivedLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionInFlight, setActionInFlight] = useState(false);
  const [undo, setUndo] = useState<{ ids: string[]; mode: "delete" | "restore"; count: number } | null>(null);

  const filtered = useMemo(
    () => list.filter((s) => s.studentFolderName?.toLowerCase().includes(search.toLowerCase())),
    [list, search],
  );

  const stageCounts = stages.map(
    (stage) => filtered.filter((s) => getStudentStage(s) === stage).length,
  );

  const visibleIds = filtered.map((s) => s.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someVisibleSelected = visibleIds.some((id) => selectedIds.has(id));

  function toggleSelectVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const id of visibleIds) next.delete(id);
      } else {
        for (const id of visibleIds) next.add(id);
      }
      return next;
    });
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function refreshList(opts: { archived: boolean }) {
    setArchivedLoading(true);
    try {
      const data = await getStudents({ archived: opts.archived });
      setList(data);
      clearSelection();
    } finally {
      setArchivedLoading(false);
    }
  }

  async function toggleArchivedView() {
    const next = !showArchived;
    setShowArchived(next);
    await refreshList({ archived: next });
  }

  function setUndoWithExpiry(payload: { ids: string[]; mode: "delete" | "restore"; count: number }) {
    setUndo(payload);
    window.setTimeout(() => {
      setUndo((current) => (current && current.ids === payload.ids ? null : current));
    }, UNDO_WINDOW_MS);
  }

  async function handleConfirmedAction() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setActionInFlight(true);
    try {
      if (showArchived) {
        const result = await bulkRestoreStudents(ids);
        setList((prev) => prev.filter((s) => !selectedIds.has(s.id)));
        clearSelection();
        setConfirmOpen(false);
        setUndoWithExpiry({ ids, mode: "restore", count: result.restoredCount });
        router.refresh();
      } else {
        const result = await bulkDeleteStudents(ids);
        setList((prev) => prev.filter((s) => !selectedIds.has(s.id)));
        clearSelection();
        setConfirmOpen(false);
        setUndoWithExpiry({ ids, mode: "delete", count: result.deletedCount });
        router.refresh();
      }
    } catch (err) {
      console.error("bulk action failed", err);
      alert("Action failed. Check console for details.");
    } finally {
      setActionInFlight(false);
    }
  }

  async function handleUndo() {
    if (!undo) return;
    try {
      if (undo.mode === "delete") {
        await bulkRestoreStudents(undo.ids);
      } else {
        await bulkDeleteStudents(undo.ids);
      }
      setUndo(null);
      await refreshList({ archived: showArchived });
      router.refresh();
    } catch (err) {
      console.error("undo failed", err);
    }
  }

  const selectedCount = selectedIds.size;
  const previewNames = useMemo(() => {
    const names: string[] = [];
    for (const s of list) {
      if (selectedIds.has(s.id)) {
        names.push(s.studentFolderName || s.email || s.id);
        if (names.length >= 5) break;
      }
    }
    return names;
  }, [list, selectedIds]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        {stages.map((stage, i) => (
          <div
            key={stage}
            className="rounded-xl bg-card border border-border p-4 text-center relative overflow-hidden"
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stageColors[i]}`} />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
              {stage}
            </p>
            <p className="text-3xl font-bold text-white mt-2">{stageCounts[i]}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border text-white placeholder:text-muted-foreground/60 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={toggleArchivedView}
          disabled={archivedLoading}
          className="bg-transparent border-border text-muted-foreground hover:text-white hover:bg-secondary"
          title={showArchived ? "Switch back to active students" : "Show archived (soft-deleted) students"}
        >
          {archivedLoading ? "Loading…" : showArchived ? "Show Active" : "Show Archived"}
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          onClick={() => setImportOpen(true)}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Import Students
        </Button>
      </div>

      {selectedCount > 0 && (
        <div className="sticky top-2 z-10 rounded-lg border border-blue-500/40 bg-blue-950/80 backdrop-blur px-4 py-2 flex items-center justify-between gap-3">
          <span className="text-sm text-white">
            <span className="font-semibold">{selectedCount}</span> selected
            {showArchived ? " from archive" : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs text-blue-300 hover:text-white underline-offset-2 hover:underline"
            >
              Clear selection
            </button>
            <Button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={actionInFlight}
              className={
                showArchived
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {showArchived ? `Restore ${selectedCount}` : `Delete ${selectedCount}`}
            </Button>
          </div>
        </div>
      )}

      {undo && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-4 py-2 flex items-center justify-between gap-3 text-sm">
          <span className="text-emerald-200">
            {undo.mode === "delete"
              ? `${undo.count} student${undo.count === 1 ? "" : "s"} archived.`
              : `${undo.count} student${undo.count === 1 ? "" : "s"} restored.`}
          </span>
          <button
            type="button"
            onClick={handleUndo}
            className="text-emerald-100 hover:text-white underline-offset-2 hover:underline font-medium"
          >
            Undo
          </button>
        </div>
      )}

      <StudentImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = !allVisibleSelected && someVisibleSelected;
                  }}
                  onChange={toggleSelectVisible}
                  aria-label="Select all visible students"
                  className="h-4 w-4 cursor-pointer accent-blue-500"
                />
              </TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Student</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Stage</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Language</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Level</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Teacher</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Progress</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Hours</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Folder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((student) => {
              const stage = getStudentStage(student);
              const isExpanded = expandedId === student.id;
              const isSelected = selectedIds.has(student.id);
              return (
                <Fragment key={student.id}>
                  <TableRow
                    className={`cursor-pointer border-b border-border/50 transition-colors ${
                      isSelected ? "bg-blue-950/40 hover:bg-blue-950/60" : "hover:bg-secondary/30"
                    }`}
                    onClick={() => setExpandedId(isExpanded ? null : student.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(student.id)}
                        aria-label={`Select ${student.studentFolderName || "student"}`}
                        className="h-4 w-4 cursor-pointer accent-blue-500"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      <button
                        className="text-left hover:text-cyan-400 transition-colors underline decoration-dotted underline-offset-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProfileEmail(student.email);
                          setProfileName(student.studentFolderName || "Unknown");
                        }}
                      >
                        {student.studentFolderName || "Unknown"}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge className={stageBadgeColor[stage]}>{stage}</Badge>
                    </TableCell>
                    <TableCell className="text-[#94a3b8]">
                      {student.language || (
                        <span className="text-muted-foreground/60">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {student.initialLevel ? (
                        <Badge className="bg-indigo-900/40 text-indigo-300 border border-indigo-700 text-xs">
                          {student.initialLevel}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/60">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-[#94a3b8]">
                      {parseTeacherName(student.teacherAssigned) || (
                        <span className="text-muted-foreground/60">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {student.progressPercent != null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                              style={{ width: `${Math.min(student.progressPercent, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-[#94a3b8]">
                            {Math.round(student.progressPercent)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-[#94a3b8]">
                      {student.completedHours != null && student.totalHours != null
                        ? `${student.completedHours}/${student.totalHours}h`
                        : "--"}
                    </TableCell>
                    <TableCell>
                      {student.folderId ? (
                        <a
                          href={`https://drive.google.com/drive/folders/${student.folderId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                          title="Open Google Drive folder"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-muted-foreground/60">--</span>
                      )}
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow key={`${student.id}-detail`}>
                      <TableCell colSpan={9} className="bg-sidebar p-5 border-b border-border">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <DocLink label="Oral Test" url={student.oralTestLink} />
                          <DocLink label="Written Test" url={student.writtenTestLink} />
                          <DocLink label="Fiche Pedagogique" url={student.fichePedagogique_url} />
                          <DocLink
                            label="Student Folder"
                            url={
                              student.folderId
                                ? `https://drive.google.com/drive/folders/${student.folderId}`
                                : null
                            }
                          />
                          {student.email && (
                            <div>
                              <span className="font-medium text-[#94a3b8]">Email:</span>{" "}
                              <span className="text-white">{student.email}</span>
                            </div>
                          )}
                          {(() => {
                            const ot = oralTestMap.get((student.email || "").toLowerCase().trim());
                            if (!ot) return null;
                            return (
                              <>
                                {ot.initial_level && (
                                  <div>
                                    <span className="font-medium text-[#94a3b8]">Oral Test Level:</span>{" "}
                                    <span className="text-white">{ot.initial_level}</span>
                                  </div>
                                )}
                                {ot.test_date && (
                                  <div>
                                    <span className="font-medium text-[#94a3b8]">Test Date:</span>{" "}
                                    <span className="text-white">{ot.test_date}</span>
                                  </div>
                                )}
                                {ot.language && (
                                  <div>
                                    <span className="font-medium text-[#94a3b8]">Language:</span>{" "}
                                    <span className="text-white">{ot.language}</span>
                                  </div>
                                )}
                                {ot.examType && (
                                  <div>
                                    <span className="font-medium text-[#94a3b8]">Exam:</span>{" "}
                                    <span className="text-white">{ot.examType}</span>
                                  </div>
                                )}
                                {ot.totalHours && (
                                  <div>
                                    <span className="font-medium text-[#94a3b8]">Total Hours:</span>{" "}
                                    <span className="text-white">{ot.totalHours}h</span>
                                  </div>
                                )}
                                {ot.trainingStartDate && (
                                  <div>
                                    <span className="font-medium text-[#94a3b8]">Training Period:</span>{" "}
                                    <span className="text-white">{ot.trainingStartDate} — {ot.trainingEndDate}</span>
                                  </div>
                                )}
                                <DocLink label="Oral Test Doc" url={ot.oralTestDocUrl} />
                              </>
                            );
                          })()}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground/60 py-8">
                  {showArchived ? "No archived students" : "No students found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <StudentProfileModal
        email={profileEmail}
        studentName={profileName}
        onClose={() => setProfileEmail(null)}
      />

      <Dialog open={confirmOpen} onOpenChange={(open) => { if (!actionInFlight) setConfirmOpen(open); }}>
        <DialogContent className="bg-card border-border text-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              {showArchived ? `Restore ${selectedCount} student${selectedCount === 1 ? "" : "s"}?` : `Archive ${selectedCount} student${selectedCount === 1 ? "" : "s"}?`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-[#94a3b8]">
            <p>
              {showArchived
                ? "Restored students will reappear in the active list. This action can be undone."
                : "Archived students are hidden from the active list but kept in the database for audit purposes. You can restore them from the archive view."}
            </p>
            {previewNames.length > 0 && (
              <ul className="rounded-md border border-border bg-secondary/30 p-3 max-h-40 overflow-auto">
                {previewNames.map((name) => (
                  <li key={name} className="text-white text-xs truncate">{name}</li>
                ))}
                {selectedCount > previewNames.length && (
                  <li className="text-muted-foreground text-xs italic">… and {selectedCount - previewNames.length} more</li>
                )}
              </ul>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                disabled={actionInFlight}
                className="bg-transparent border-border text-muted-foreground hover:bg-secondary hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmedAction}
                disabled={actionInFlight}
                className={
                  showArchived
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }
              >
                {actionInFlight ? "Working…" : showArchived ? `Restore ${selectedCount}` : `Archive ${selectedCount}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DocLink({ label, url }: { label: string; url: string | null }) {
  return (
    <div>
      <span className="font-medium text-muted-foreground">{label}:</span>{" "}
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
        >
          Open
        </a>
      ) : (
        <span className="text-red-400">Missing</span>
      )}
    </div>
  );
}
