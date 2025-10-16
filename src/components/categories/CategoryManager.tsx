'use client'

import { useState } from 'react'
import { useCategories } from '@/hooks/useCategories'
import { Category, CreateCategoryForm } from '@/types'
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import { LoadingSpinner } from '@/components/ui/loading'
import { generateRandomColor } from '@/utils'

interface CategoryManagerProps {
  onCategorySelect?: (category: Category) => void
  selectedCategory?: Category | null
}

export default function CategoryManager({ onCategorySelect, selectedCategory }: CategoryManagerProps) {
  const { categories, loading, error, addCategory, updateCategory, deleteCategory } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CreateCategoryForm>({
    name: '',
    color: generateRandomColor(),
    icon: '📦'
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData)
      } else {
        await addCategory(formData)
      }
      
      // Reset form
      setFormData({
        name: '',
        color: generateRandomColor(),
        icon: '📦'
      })
      setShowForm(false)
      setEditingCategory(null)
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon
    })
    setShowForm(true)
  }

  const handleDelete = async (category: Category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      try {
        await deleteCategory(category.id)
      } catch (err: any) {
        alert(err.message)
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCategory(null)
    setFormData({
      name: '',
      color: generateRandomColor(),
      icon: '📦'
    })
    setFormError('')
  }

  const commonIcons = ['📦', '🎬', '💼', '🎮', '📰', '🏃', '🎓', '☁️', '💰', '🛒', '🍔', '🚗', '🏠', '💊', '📱', '🎵']

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-chocolate-100">Categories</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-chocolate-900 rounded-lg shadow p-6 border border-gray-200 dark:border-chocolate-700 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-chocolate-100">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-gray-100 dark:hover:bg-chocolate-800 rounded transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-500 dark:text-chocolate-400" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="form-label">
                  Category Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-chocolate-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                  placeholder="e.g., Entertainment"
                  required
                  maxLength={50}
                />
              </div>

              {/* Color */}
              <div>
                <label htmlFor="color" className="form-label">
                  Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, color: generateRandomColor() })}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  >
                    Random Color
                  </button>
                </div>
              </div>
            </div>

            {/* Icon */}
            <div>
              <label className="form-label">Icon</label>
              <div className="grid grid-cols-8 gap-2 mb-3">
                {commonIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`p-2 text-xl text-center rounded border transition-colors ${
                      formData.icon === icon
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400'
                        : 'border-gray-300 dark:border-chocolate-600 hover:bg-gray-50 dark:hover:bg-chocolate-800'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-chocolate-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-chocolate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                placeholder="Or enter custom emoji"
                maxLength={5}
              />
            </div>

            {/* Form Error */}
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{formError}</p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={formLoading}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {formLoading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    {editingCategory ? 'Updating...' : 'Adding...'}
                  </div>
                ) : (
                  editingCategory ? 'Update Category' : 'Add Category'
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-chocolate-100 font-semibold py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`bg-white rounded-lg shadow p-4 border-2 transition-all cursor-pointer hover:shadow-md ${
              selectedCategory?.id === category.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onCategorySelect?.(category)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                  style={{ backgroundColor: category.color }}
                >
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  {category.is_default && (
                    <span className="text-xs text-gray-500">Default</span>
                  )}
                </div>
              </div>
              
              {!category.is_default && (
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(category)
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Edit category"
                  >
                    <FiEdit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(category)
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Delete category"
                  >
                    <FiTrash2 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No categories yet</p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Create Your First Category
            </button>
          )}
        </div>
      )}
    </div>
  )
}