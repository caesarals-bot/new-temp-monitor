import { Thermometer } from 'lucide-react';
import { useEquipmentManagement } from '../hooks/useEquipmentManagement';
import { EquipmentsHeader } from '../components/EquipmentsHeader';
import { EquipmentCard } from '../components/EquipmentCard';
import { EquipmentFormDialog } from '../components/EquipmentFormDialog';
import { DeleteEquipmentDialog } from '../components/DeleteEquipmentDialog';
import { Card, CardContent } from '@/shared/components/ui/card';

export function EquipmentsPage() {
  const {
    canEdit, activeLocationId, activeLocationName, equipmentList,
    isLoadingEquipment, equipmentError,
    dialog, editingEquipment, deletingEquipment,
    deleteReadingsCount, isLoadingDeleteCount, isMutating,
    formError, deleteError,
    openCreate, openEdit, openDelete, closeDialog,
    submitCreate, submitEdit, confirmDelete,
  } = useEquipmentManagement();

  if (!activeLocationId) {
    return (
      <div className="flex flex-col">
        <EquipmentsHeader
          totalEquipment={0}
          activeLocationName={null}
          canCreate={false}
          onCreate={openCreate}
        />
        <div className="flex flex-1 items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[--color-eucalyptus-bg]">
                <Thermometer className="h-6 w-6 text-[--color-eucalyptus]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-base font-medium text-[--color-text-primary]">
                  Sin sede seleccionada
                </p>
                <p className="mt-1 text-sm text-[--color-text-secondary]">
                  Usa el selector de sede en la parte superior para ver sus equipos.
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
      <EquipmentsHeader
        totalEquipment={equipmentList.length}
        activeLocationName={activeLocationName}
        canCreate={canEdit}
        onCreate={openCreate}
      />

      <div className="flex-1 p-6">
        {equipmentError ? (
          <div className="rounded-md border border-[--color-danger-border] bg-[--color-danger-bg] p-4 text-sm text-[--color-danger]">
            {equipmentError}
          </div>
        ) : equipmentList.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[--color-eucalyptus-bg]">
                <Thermometer className="h-6 w-6 text-[--color-eucalyptus]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-base font-medium text-[--color-text-primary]">
                  Aún no hay equipos en esta sede
                </p>
                <p className="mt-1 text-sm text-[--color-text-secondary]">
                  Crea equipos para registrar las lecturas de temperatura.
                </p>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={openCreate}
                  className="mt-2 text-sm font-medium text-[--color-eucalyptus] hover:underline"
                >
                  Agregar primer equipo
                </button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            data-testid="equipment-grid"
          >
            {equipmentList.map((equipment) => (
              <EquipmentCard
                key={equipment.id}
                equipment={equipment}
                readingsCount={0}
                canEdit={canEdit}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            ))}
          </div>
        )}

        {isLoadingEquipment && equipmentList.length === 0 && (
          <p className="mt-4 text-center text-sm text-[--color-text-muted]">
            Cargando equipos...
          </p>
        )}
      </div>

      <EquipmentFormDialog
        open={dialog === 'create' || dialog === 'edit'}
        mode={dialog === 'edit' ? 'edit' : 'create'}
        equipment={editingEquipment}
        isLoading={isMutating}
        serverError={formError}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onSubmitCreate={submitCreate}
        onSubmitEdit={submitEdit}
      />

      <DeleteEquipmentDialog
        open={dialog === 'delete'}
        equipment={deletingEquipment}
        readingsCount={deleteReadingsCount}
        isLoadingCount={isLoadingDeleteCount}
        isDeleting={isMutating}
        serverError={deleteError}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
