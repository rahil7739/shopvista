import { useCallback, useEffect, useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import api from "../../shared/api/client";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("error");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/categories");
      setCategories(data.data);
      setNotice("");
      return true;
    } catch (error) {
      setNotice(error.response?.data?.message || "Unable to load categories.");
      setNoticeType("error");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    api.get("/admin/categories")
      .then(({ data }) => {
        if (active) setCategories(data.data);
      })
      .catch((error) => {
        if (active) {
          setNotice(error.response?.data?.message || "Unable to load categories.");
          setNoticeType("error");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const saveCategory = async (event) => {
    event.preventDefault();
    setNotice("");
    const values = {
      name: editingCategory.name.trim(),
      description: (editingCategory.description || "").trim(),
      active: Boolean(editingCategory.active),
    };

    if (!values.name) {
      setNotice("Enter a category name.");
      setNoticeType("error");
      return;
    }
    if (values.description.length > 2000) {
      setNotice("The description must be 2000 characters or fewer.");
      setNoticeType("error");
      return;
    }
    if (editingCategory.imageFile && !["image/jpeg", "image/png", "image/webp"].includes(editingCategory.imageFile.type)) {
      setNotice("Choose a JPEG, PNG, or WebP image.");
      setNoticeType("error");
      return;
    }
    if (editingCategory.imageFile && editingCategory.imageFile.size > 5 * 1024 * 1024) {
      setNotice("The category image must be 5 MB or smaller.");
      setNoticeType("error");
      return;
    }

    setIsSaving(true);
    setNotice("");
    try {
      const payload = editingCategory.imageFile
        ? Object.entries(values).reduce((formData, [key, value]) => {
          formData.append(key, value);
          return formData;
        }, new FormData())
        : values;

      if (editingCategory.imageFile) payload.append("image", editingCategory.imageFile);

      if (editingCategory.id) {
        if (editingCategory.imageFile) {
          payload.append("_method", "PUT");
          await api.post(`/admin/categories/${editingCategory.id}`, payload);
        } else {
          await api.put(`/admin/categories/${editingCategory.id}`, payload);
        }
      } else {
        await api.post("/admin/categories", payload);
      }
      setEditingCategory(null);
      const refreshed = await loadCategories();
      if (refreshed) {
        setNotice(`Category ${editingCategory.id ? "updated" : "added"} successfully.`);
        setNoticeType("success");
      }
    } catch (error) {
      setNotice(
        Object.values(error.response?.data?.errors || {})[0]?.[0]
          || error.response?.data?.message
          || `Unable to ${editingCategory.id ? "update" : "add"} this category.`,
      );
      setNoticeType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const removeCategory = async (category) => {
    if (!window.confirm(`Delete "${category.name}"? Products in this category will remain uncategorized.`)) return;
    setNotice("");
    try {
      await api.delete(`/admin/categories/${category.id}`);
      if (await loadCategories()) {
        setNotice(`Category "${category.name}" deleted successfully.`);
        setNoticeType("success");
      }
    } catch (error) {
      setNotice(error.response?.data?.message || "Unable to delete this category.");
      setNoticeType("error");
    }
  };

  return (
    <section className="categories-admin-page">
      <div className="page-heading">
        <div><p className="eyebrow">STORE MANAGEMENT</p><h1>Categories</h1><p className="muted-copy">Organize products in the public storefront.</p></div>
        <button className="primary-button add-user-button" type="button" onClick={() => { setNotice(""); setEditingCategory({ name: "", description: "", active: true, image_url: "", imageFile: null }); }}><FaPlus aria-hidden="true" /> Add category</button>
      </div>
      {notice && !editingCategory && <p className={`form-notice ${noticeType === "success" ? "success" : ""}`} role={noticeType === "success" ? "status" : "alert"}>{notice}</p>}
      <section className="panel products-admin-panel">
        <div className="products-admin-heading"><div><h2>Product categories</h2><p className="muted-copy">{categories.length} categories</p></div></div>
        <div className="table-responsive">
          <table className="table custom-table products-admin-table mb-0">
            <thead><tr><th>IMAGE</th><th>CATEGORY</th><th>DESCRIPTION</th><th>PRODUCTS</th><th>STATUS</th><th className="text-end">ACTIONS</th></tr></thead>
            <tbody>
              {loading && <tr><td className="empty-table" colSpan="6">Loading categories...</td></tr>}
              {!loading && categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.image_url
                    ? <img className="category-image-thumb" src={category.image_url} alt="" />
                    : <span className="category-image-placeholder" aria-label="No category image">—</span>}</td>
                  <td><strong>{category.name}</strong></td>
                  <td>{category.description || "—"}</td>
                  <td>{category.products_count ?? 0}</td>
                  <td><span className={`status-badge ${category.active ? "active" : "inactive"}`}>{category.active ? "Active" : "Inactive"}</span></td>
                  <td><div className="table-actions">
                    <button className="action-btn edit-btn" type="button" aria-label={`Edit ${category.name}`} onClick={() => { setNotice(""); setEditingCategory({ ...category, imageFile: null }); }}><FaEdit /></button>
                    <button className="action-btn delete-btn" type="button" aria-label={`Delete ${category.name}`} onClick={() => removeCategory(category)}><FaTrash /></button>
                  </div></td>
                </tr>
              ))}
              {!loading && categories.length === 0 && <tr><td className="empty-table" colSpan="6">No categories yet. Add one to organize your products.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {editingCategory && (
        <div className="custom-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingCategory(null); }}>
          <section className="custom-modal user-modal" role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
            <div className="custom-modal-header"><div><h2 id="category-modal-title">{editingCategory.id ? "Edit category" : "Add category"}</h2><p className="muted-copy">Products can be assigned to this category by name.</p></div><button type="button" aria-label="Close dialog" onClick={() => setEditingCategory(null)}>×</button></div>
            <form className="custom-modal-body user-form" noValidate onSubmit={saveCategory}>
              <label htmlFor="category-name">Category name</label>
              <input id="category-name" value={editingCategory.name} onChange={(event) => setEditingCategory({ ...editingCategory, name: event.target.value })} />
              <label htmlFor="category-description">Description</label>
              <textarea id="category-description" rows="3" value={editingCategory.description || ""} onChange={(event) => setEditingCategory({ ...editingCategory, description: event.target.value })} />
              <label htmlFor="category-image">Category image (JPEG, PNG, WebP; max 5 MB)</label>
              <input id="category-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setEditingCategory({ ...editingCategory, imageFile: event.target.files?.[0] || null })} />
              {editingCategory.imageFile
                ? <p className="muted-copy category-image-selection">Selected: {editingCategory.imageFile.name}</p>
                : editingCategory.image_url && <img className="category-image-preview" src={editingCategory.image_url} alt={`${editingCategory.name} category`} />}
              <label htmlFor="category-status">Status</label>
              <select id="category-status" value={editingCategory.active ? "active" : "inactive"} onChange={(event) => setEditingCategory({ ...editingCategory, active: event.target.value === "active" })}>
                <option value="active">Active — show on storefront</option>
                <option value="inactive">Inactive — hide from storefront</option>
              </select>
              {notice && <p className="form-notice" role="alert">{notice}</p>}
              <div className="user-form-actions"><button className="secondary-button" type="button" onClick={() => setEditingCategory(null)}>Cancel</button><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save category"}</button></div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
};

export default CategoryList;
