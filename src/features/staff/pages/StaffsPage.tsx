import { Users } from 'lucide-react';
import { useStaffManagement } from '../hooks/useStaffManagement';
import { StaffsHeader } from '../components/StaffsHeader';
import { StaffCard } from '../components/StaffCard';
import { StaffFormDialog } from '../components/StaffFormDialog';
import { ToggleStaffDialog } from '../components/ToggleStaffDialog';
import { Card, CardContent } from '@/shared/components/ui/card';

export function StaffsPage() {
  const {
    canEdit, activeLocationId, activeLocationName, staffList, readingsCountByStaff,
    isLoadingStaff, staffError,
    dialog, editingStaff, togglingStaff,
    toggleReadingsCount, isLoadingToggleCount, isMutating,
    formError, toggleError,
    openCreate, openEdit, openToggle, closeDialog,
    submitCreate, submitEdit, confirmToggle,
  } = useStaffManagement();

  if (!activeLocationId) {
    return (
      <div className="flex flex-col">
        <StaffsHeader
          totalStaff={0}
          activeLocationName={null}
          canCreate={false}
          onCreate={openCreate}
        />
        <div className="flex flex-1 items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[--color-eucalyptus-bg]">
                <Users className="h-6 w-6 text-[--color-eucalyptus]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-base font-medium text-[--color-text-primary]">
                  Sin sede seleccionada
                </p>
                <p className="mt-1 text-sm text-[--color-text-secondary]">
                  Usa el selector de sede en la parte superior para ver su personal.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <StaffsHeader
        totalStaff={staffList.length}
        activeLocationName={activeLocationName}
        canCreate={canEdit}
        onCreate={openCreate}
      />

      <div className="flex-1 p-6">
        {staffError ? (
          <div className="rounded-md border border-[--color-danger-border] bg-[--color-danger-bg] p-4 text-sm text-[--color-danger]">
            {staffError}
          </div>
        ) : staffList.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[--color-eucalyptus-bg]">
                <Users className="h-6 w-6 text-[--color-eucalyptus]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-base font-medium text-[--color-text-primary]">
                  Aún no hay personal en esta sede
                </p>
                <p className="mt-1 text-sm text-[--color-text-secondary]">
                  Agrega personas que registrarán las lecturas de temperatura.
                </p>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={openCreate}
                  className="mt-2 text-sm font-medium text-[--color-eucalyptus] hover:underline"
                >
                  Agregar primera persona
                </button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            data-testid="staff-grid"
          >
            {staffList.map((staff) => (
              <StaffCard
                key={staff.id}
                staff={staff}
                readingsCount={readingsCountByStaff.get(staff.id) ?? 0}
                canEdit={canEdit}
                onEdit={openEdit}
                onToggle={openToggle}
              />
            ))}
          </div>
        )}

        {isLoadingStaff && staffList.length === 0 && (
          <p className="mt-4 text-center text-sm text-[--color-text-muted]">
            Cargando personal...
          </p>
        )}
      </div>

      <StaffFormDialog
        open={dialog === 'create' || dialog === 'edit'}
        mode={dialog === 'edit' ? 'edit' : 'create'}
        staff={editingStaff}
        isLoading={isMutating}
        serverError={formError}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onSubmitCreate={submitCreate}
        onSubmitEdit={submitEdit}
      />

      <ToggleStaffDialog
        open={dialog === 'toggle'}
        staff={togglingStaff}
        readingsCount={toggleReadingsCount}
        isLoadingCount={isLoadingToggleCount}
        isToggling={isMutating}
        serverError={toggleError}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onConfirm={confirmToggle}
      />
    </div>
  );
}
