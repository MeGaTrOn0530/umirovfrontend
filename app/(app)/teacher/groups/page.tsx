"use client";

import * as React from "react";
import { toast } from "sonner";
import { FolderKanban, Pencil, Plus, Trash2, UserPlus, Users } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { groupService } from "@/services/groupService";
import { teacherService } from "@/services/teacherService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Group, UserPublic } from "@/types";
import { useLocale } from "@/components/providers/locale-provider";
import { t } from "@/lib/i18n";

export default function TeacherGroupsPage() {
  const { locale } = useLocale();
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [students, setStudents] = React.useState<UserPublic[]>([]);
  const [members, setMembers] = React.useState<UserPublic[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [membersLoading, setMembersLoading] = React.useState(false);
  const [selectedGroupId, setSelectedGroupId] = React.useState<string>("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Group | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Group | null>(null);
  const [memberToAdd, setMemberToAdd] = React.useState<string>("");
  const [form, setForm] = React.useState({ name: "", code: "" });

  const loadGroups = React.useCallback(async () => {
    setLoading(true);
    try {
      const [groupData, studentData] = await Promise.all([
        groupService.list(),
        teacherService.listStudents(),
      ]);
      setGroups(groupData);
      setStudents(studentData);
      setSelectedGroupId((prev) => prev || groupData[0]?.id || "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t(locale, "toast.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [locale]);

  const loadMembers = React.useCallback(
    async (groupId: string) => {
      setMembersLoading(true);
      try {
        const data = await groupService.listMembers(groupId);
        setMembers(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t(locale, "toast.loadFailed"));
      } finally {
        setMembersLoading(false);
      }
    },
    [locale]
  );

  React.useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  React.useEffect(() => {
    if (selectedGroupId) {
      loadMembers(selectedGroupId);
    }
  }, [selectedGroupId, loadMembers]);

  const availableStudents = students.filter(
    (student) => !members.some((member) => member.id === student.id)
  );

  const handleCreate = async () => {
    try {
      const created = await groupService.create(form);
      setGroups((prev) => [created, ...prev]);
      setCreateOpen(false);
      setForm({ name: "", code: "" });
      toast.success(t(locale, "toast.groupCreated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t(locale, "toast.createFailed"));
    }
  };

  const handleUpdate = async () => {
    if (!editTarget) return;
    try {
      const updated = await groupService.update(editTarget.id, form);
      setGroups((prev) => prev.map((group) => (group.id === updated.id ? updated : group)));
      setEditTarget(null);
      setForm({ name: "", code: "" });
      toast.success(t(locale, "toast.groupUpdated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t(locale, "toast.updateFailed"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await groupService.remove(deleteTarget.id);
      setGroups((prev) => prev.filter((group) => group.id !== deleteTarget.id));
      if (selectedGroupId === deleteTarget.id) {
        setSelectedGroupId("");
        setMembers([]);
      }
      setDeleteTarget(null);
      toast.success(t(locale, "toast.groupDeleted"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t(locale, "toast.deleteFailed"));
    }
  };

  const handleAddMember = async () => {
    if (!selectedGroupId || !memberToAdd) return;
    try {
      await groupService.addMember(selectedGroupId, memberToAdd);
      const added = students.find((student) => student.id === memberToAdd);
      if (added) setMembers((prev) => [...prev, added]);
      setMemberToAdd("");
      toast.success(t(locale, "toast.memberAdded"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t(locale, "toast.updateFailed"));
    }
  };

  const handleRemoveMember = async (studentId: string) => {
    if (!selectedGroupId) return;
    try {
      await groupService.removeMember(selectedGroupId, studentId);
      setMembers((prev) => prev.filter((member) => member.id !== studentId));
      toast.success(t(locale, "toast.memberRemoved"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t(locale, "toast.updateFailed"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t(locale, "pages.groupsTitle")}
        description={t(locale, "pages.groupsDesc")}
        icon={<FolderKanban className="h-4 w-4" />}
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t(locale, "pages.createGroup")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t(locale, "pages.createGroup")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder={t(locale, "pages.groupName")}
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <Input
                  placeholder={t(locale, "pages.groupCode")}
                  value={form.code}
                  onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
                />
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>{t(locale, "common.create")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              {t(locale, "pages.groupsTitle")}
            </CardTitle>
            <Badge variant="secondary">{groups.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={`sk-${index}`} className="h-10 w-full" />
                ))}
              </div>
            ) : groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t(locale, "pages.noGroups")}</p>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                    selectedGroupId === group.id
                      ? "border-primary/30 bg-primary/5"
                      : "border-transparent hover:bg-muted"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedGroupId(group.id)}
                    className="flex-1 text-left"
                  >
                    <p className="font-medium">{group.name}</p>
                    <p className="text-xs text-muted-foreground">{group.code}</p>
                  </button>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditTarget(group);
                        setForm({ name: group.name, code: group.code });
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(group)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t(locale, "pages.manageMembers")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedGroupId ? (
              <p className="text-sm text-muted-foreground">{t(locale, "pages.selectGroup")}</p>
            ) : (
              <>
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <Select value={memberToAdd} onValueChange={setMemberToAdd}>
                    <SelectTrigger className="md:w-72">
                      <SelectValue placeholder={t(locale, "pages.selectStudent")} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddMember} disabled={!memberToAdd}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t(locale, "pages.addMember")}
                  </Button>
                </div>

                {membersLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={`skm-${index}`} className="h-9 w-full" />
                    ))}
                  </div>
                ) : members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t(locale, "pages.noStudents")}</p>
                ) : (
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-medium">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.username}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          {t(locale, "pages.removeMember")}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(locale, "pages.editGroup")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder={t(locale, "pages.groupName")}
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <Input
              placeholder={t(locale, "pages.groupCode")}
              value={form.code}
              onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate}>{t(locale, "common.update")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(locale, "common.delete")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t(locale, "pages.deleteGroupHint").replace(
              "{name}",
              deleteTarget?.name ?? ""
            )}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t(locale, "common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t(locale, "common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
