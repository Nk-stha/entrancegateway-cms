'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormModal } from '@/components/ui/FormModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { useEntranceTypes } from '@/hooks/useEntranceTypes';
import { entranceTypeService } from '@/services/entranceType.service';
import { toast } from '@/lib/utils/toast';
import type { EntranceType, EntranceTypeFormData } from '@/types/quiz.types';

export default function EntranceTypesPage() {
  const { entranceTypes, loading, refetch } = useEntranceTypes();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEntranceType, setSelectedEntranceType] = useState<EntranceType | null>(null);
  const [formData, setFormData] = useState<EntranceTypeFormData>({
    entranceName: '',
    description: '',
    hasNegativeMarking: false,
    negativeMarkingValue: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = () => {
    setFormData({
      entranceName: '',
      description: '',
      hasNegativeMarking: false,
      negativeMarkingValue: 0,
    });
    setShowCreateModal(true);
  };

  const handleEdit = (entranceType: EntranceType) => {
    setSelectedEntranceType(entranceType);
    setFormData({
      entranceName: entranceType.entranceName,
      description: entranceType.description || '',
      hasNegativeMarking: entranceType.hasNegativeMarking,
      negativeMarkingValue: entranceType.negativeMarkingValue,
    });
    setShowEditModal(true);
  };

  const handleDelete = (entranceType: EntranceType) => {
    setSelectedEntranceType(entranceType);
    setShowDeleteModal(true);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const success = await entranceTypeService.createEntranceType(formData);

    if (success) {
      toast.success('Entrance type created successfully');
      setShowCreateModal(false);
      refetch();
    } else {
      toast.error('Failed to create entrance type');
    }

    setSubmitting(false);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntranceType) return;

    setSubmitting(true);

    const success = await entranceTypeService.updateEntranceType(selectedEntranceType.id, formData);

    if (success) {
      toast.success('Entrance type updated successfully');
      setShowEditModal(false);
      refetch();
    } else {
      toast.error('Failed to update entrance type');
    }

    setSubmitting(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEntranceType) return;

    setDeleting(true);

    const success = await entranceTypeService.deleteEntranceType(selectedEntranceType.id);

    if (success) {
      toast.success('Entrance type deleted successfully');
      setShowDeleteModal(false);
      refetch();
    } else {
      toast.error('Failed to delete entrance type');
    }

    setDeleting(false);
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      className: 'w-20',
    },
    {
      key: 'entranceName',
      label: 'Entrance Name',
    },
    {
      key: 'description',
      label: 'Description',
      render: (entranceType: EntranceType) => (
        <span className="line-clamp-2">{entranceType.description || '-'}</span>
      ),
    },
    {
      key: 'hasNegativeMarking',
      label: 'Negative Marking',
      className: 'w-40',
      render: (entranceType: EntranceType) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
            entranceType.hasNegativeMarking
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {entranceType.hasNegativeMarking ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'negativeMarkingValue',
      label: 'Negative Value',
      className: 'w-32',
      render: (entranceType: EntranceType) =>
        entranceType.hasNegativeMarking ? entranceType.negativeMarkingValue : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'w-40',
      render: (entranceType: EntranceType) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(entranceType)}
            className="px-3 py-1 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-brand-blue)',
              color: 'white',
            }}
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(entranceType)}
            className="px-3 py-1 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-error)',
              color: 'white',
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <EmptyState type="loading" message="Loading entrance types..." />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold font-roboto"
                style={{ color: 'var(--color-brand-navy)' }}
              >
                Entrance Type Management
              </h1>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Manage entrance exam types and marking schemes
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 font-semibold rounded-lg shadow-sm transition-colors text-white"
              style={{ backgroundColor: 'var(--color-brand-blue)' }}
            >
              Add Entrance Type
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <DataTable
              columns={columns}
              data={entranceTypes}
              keyExtractor={(entranceType) => entranceType.id.toString()}
              emptyMessage="No entrance types found"
              mobileCardRender={(entranceType) => (
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{entranceType.entranceName}</p>
                      <p className="text-xs text-gray-500 mt-1">ID: {entranceType.id}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                        entranceType.hasNegativeMarking
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {entranceType.hasNegativeMarking ? 'Negative Marking' : 'No Negative'}
                    </span>
                  </div>
                  {entranceType.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{entranceType.description}</p>
                  )}
                  {entranceType.hasNegativeMarking && (
                    <div className="text-sm">
                      <span className="text-gray-500">Negative Value: </span>
                      <span className="font-semibold text-gray-900">
                        {entranceType.negativeMarkingValue}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(entranceType)}
                      className="flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                      style={{
                        backgroundColor: 'var(--color-brand-blue)',
                        color: 'white',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entranceType)}
                      className="flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                      style={{
                        backgroundColor: 'var(--color-error)',
                        color: 'white',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        <FormModal
          isOpen={showCreateModal}
          title="Create Entrance Type"
          onClose={() => setShowCreateModal(false)}
          size="md"
        >
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <Input
              label="Entrance Name"
              type="text"
              value={formData.entranceName}
              onChange={(e) => setFormData({ ...formData, entranceName: e.target.value })}
              required
              placeholder="e.g., BSc CSIT Entrance"
            />

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description of the entrance exam"
              rows={3}
            />

            <div className="space-y-3">
              <Checkbox
                label="Has Negative Marking"
                checked={formData.hasNegativeMarking}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hasNegativeMarking: e.target.checked,
                    negativeMarkingValue: e.target.checked ? formData.negativeMarkingValue : 0,
                  })
                }
              />

              {formData.hasNegativeMarking && (
                <div className="pl-6">
                  <Input
                    label="Negative Marking Value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.negativeMarkingValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        negativeMarkingValue: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    placeholder="e.g., 0.25"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the value to deduct for each wrong answer (e.g., 0.25 for -0.25 marks)
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 font-semibold rounded-lg transition-colors disabled:opacity-50 text-white"
                style={{ backgroundColor: 'var(--color-brand-blue)' }}
              >
                {submitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </FormModal>

        <FormModal
          isOpen={showEditModal}
          title="Edit Entrance Type"
          onClose={() => setShowEditModal(false)}
          size="md"
        >
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <Input
              label="Entrance Name"
              type="text"
              value={formData.entranceName}
              onChange={(e) => setFormData({ ...formData, entranceName: e.target.value })}
              required
              placeholder="e.g., BSc CSIT Entrance"
            />

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description of the entrance exam"
              rows={3}
            />

            <div className="space-y-3">
              <Checkbox
                label="Has Negative Marking"
                checked={formData.hasNegativeMarking}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hasNegativeMarking: e.target.checked,
                    negativeMarkingValue: e.target.checked ? formData.negativeMarkingValue : 0,
                  })
                }
              />

              {formData.hasNegativeMarking && (
                <div className="pl-6">
                  <Input
                    label="Negative Marking Value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.negativeMarkingValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        negativeMarkingValue: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    placeholder="e.g., 0.25"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the value to deduct for each wrong answer (e.g., 0.25 for -0.25 marks)
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 font-semibold rounded-lg transition-colors disabled:opacity-50 text-white"
                style={{ backgroundColor: 'var(--color-brand-blue)' }}
              >
                {submitting ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </FormModal>

        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Entrance Type"
          message={`Are you sure you want to delete "${selectedEntranceType?.entranceName}"? This action cannot be undone.`}
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
          variant="danger"
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
