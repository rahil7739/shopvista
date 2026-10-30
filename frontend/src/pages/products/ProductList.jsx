import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import api from "../../shared/api/client";
import useProducts from "../../shared/products/useProducts";

const emptyProduct = {
  name: "",
  category: "",
  price: "",
  description: "",
  imageUrl: "",
  imageFile: null,
  artStyle: "tote",
  published: true,
  featured: false,
};

const formatPrice = (price) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format(Number(price));

const ProductList = () => {
  const { products, loading, error, addProduct, updateProduct, deleteProduct } = useProducts();
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    api.get("/admin/categories")
      .then(({ data }) => {
        if (active) setCategories(data.data);
      })
      .catch((requestError) => {
        if (active) {
          setCategoriesError(
            requestError.response?.data?.message || "Unable to load categories.",
          );
        }
      })
      .finally(() => {
        if (active) setCategoriesLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const openForm = (product = null) => {
    setEditingProduct(product ? {
      ...product,
      name: product.name || "",
      category: product.category || "",
      description: product.description || "",
      price: String(product.price),
      imageUrl: product.imageUrl || "",
    } : { ...emptyProduct });
    setFormError("");
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    const product = {
      ...editingProduct,
      name: editingProduct.name.trim(),
      category: editingProduct.category.trim(),
      price: editingProduct.price === "" ? Number.NaN : Number(editingProduct.price),
      description: editingProduct.description.trim(),
      imageUrl: editingProduct.imageUrl.trim(),
    };

    if (!product.name || !product.category || !categories.some((category) => category.name === product.category) || !Number.isFinite(product.price) || product.price < 0) {
      setFormError("Add a product name, choose a category, and enter a valid non-negative price.");
      return;
    }

    setIsSaving(true);
    try {
      if (product.id) await updateProduct(product);
      else await addProduct(product);
      setEditingProduct(null);
    } catch (requestError) {
      setFormError(
        Object.values(requestError.response?.data?.errors || {})[0]?.[0]
          || requestError.response?.data?.message
          || "Unable to save this product.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Delete "${product.name}"?`)) {
      try {
        await deleteProduct(product.id);
      } catch (requestError) {
        setFormError(requestError.response?.data?.message || "Unable to delete this product.");
      }
    }
  };

  return (
    <section className="products-admin-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">STORE MANAGEMENT</p>
          <h1>Products</h1>
          <p className="muted-copy">Manage products shown in your public storefront.</p>
        </div>
        <button className="primary-button add-user-button" type="button" onClick={() => openForm()}>
          <FaPlus aria-hidden="true" /> Add product
        </button>
      </div>

      <section className="panel products-admin-panel">
        <div className="products-admin-heading">
          <div><h2>Product catalog</h2><p className="muted-copy">{products.length} products · stored in the database</p></div>
        </div>
        {(error || formError) && !editingProduct && <p className="form-notice products-error" role="alert">{formError || error}</p>}
        <div className="table-responsive">
          <table className="table custom-table products-admin-table mb-0">
            <thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>PRICE</th><th>STOREFRONT</th><th className="text-end">ACTIONS</th></tr></thead>
            <tbody>
              {loading && <tr><td className="empty-table" colSpan="5">Loading products...</td></tr>}
              {!loading && products.map((product) => (
                <tr key={product.id}>
                  <td><div className="admin-product-identity">
                    {product.imageUrl
                      ? <img src={product.imageUrl} alt="" />
                      : <span className={`admin-product-thumb ${product.artStyle}`} aria-hidden="true" />}
                    <div><strong>{product.name}</strong>{product.featured && <span className="featured-label">Featured</span>}</div>
                  </div></td>
                  <td>{product.category}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td><span className={`status-badge ${product.published ? "active" : "inactive"}`}>{product.published ? "Published" : "Hidden"}</span></td>
                  <td><div className="table-actions">
                    <button className="action-btn edit-btn" type="button" aria-label={`Edit ${product.name}`} onClick={() => openForm(product)}><FaEdit /></button>
                    <button className="action-btn delete-btn" type="button" aria-label={`Delete ${product.name}`} onClick={() => handleDelete(product)}><FaTrash /></button>
                  </div></td>
                </tr>
              ))}
              {!loading && products.length === 0 && <tr><td className="empty-table" colSpan="5">No products yet. Add a product to publish it on the website.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {editingProduct && (
        <div className="custom-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingProduct(null); }}>
          <section className="custom-modal product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
            <div className="custom-modal-header">
              <div><h2 id="product-modal-title">{editingProduct.id ? "Edit product" : "Add product"}</h2><p className="muted-copy">Published products appear in the storefront immediately.</p></div>
              <button type="button" aria-label="Close dialog" onClick={() => setEditingProduct(null)}>×</button>
            </div>
            <form className="custom-modal-body product-form" noValidate onSubmit={saveProduct}>
              <label htmlFor="product-name">Product name</label>
              <input id="product-name" value={editingProduct.name} onChange={(event) => setEditingProduct({ ...editingProduct, name: event.target.value })} />
              <div className="product-form-row">
                <div>
                  <label htmlFor="product-category">Category</label>
                  <select id="product-category" value={editingProduct.category} disabled={categoriesLoading || categories.length === 0} onChange={(event) => setEditingProduct({ ...editingProduct, category: event.target.value })}>
                    <option value="">{categoriesLoading ? "Loading categories..." : "Choose a category"}</option>
                    {editingProduct.category && !categories.some((category) => category.name === editingProduct.category)
                      && <option value={editingProduct.category}>{editingProduct.category} (current)</option>}
                    {categories.map((category) => <option key={category.id} value={category.name}>{category.name}{category.active ? "" : " (inactive)"}</option>)}
                  </select>
                </div>
                <div><label htmlFor="product-price">Price (USD)</label><input id="product-price" type="number" value={editingProduct.price} onChange={(event) => setEditingProduct({ ...editingProduct, price: event.target.value })} /></div>
              </div>
              {categoriesError && <p className="form-notice" role="alert">{categoriesError}</p>}
              {!categoriesLoading && !categoriesError && categories.length === 0 && <p className="muted-copy">Create a category before adding products. <Link to="/admin/categories">Manage categories</Link></p>}
              <label htmlFor="product-description">Description</label>
              <textarea id="product-description" rows="3" value={editingProduct.description} onChange={(event) => setEditingProduct({ ...editingProduct, description: event.target.value })} />
              <label htmlFor="product-image">Image URL (optional)</label>
              <input id="product-image" type="url" placeholder="https://example.com/product.jpg" value={editingProduct.imageUrl} onChange={(event) => setEditingProduct({ ...editingProduct, imageUrl: event.target.value })} />
              <label htmlFor="product-image-file">Or upload an image (JPEG, PNG, WebP; max 5 MB)</label>
              <input id="product-image-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setEditingProduct({ ...editingProduct, imageFile: event.target.files?.[0] || null, imageUrl: event.target.files?.[0] ? "" : editingProduct.imageUrl })} />
              <div className="product-form-row product-options">
                <label htmlFor="product-art-style">Placeholder style</label>
                <select id="product-art-style" value={editingProduct.artStyle} onChange={(event) => setEditingProduct({ ...editingProduct, artStyle: event.target.value })}>
                  <option value="tote">Warm</option><option value="headphones">Sage</option><option value="ceramic">Natural</option>
                </select>
              </div>
              <label className="product-check"><input type="checkbox" checked={editingProduct.published} onChange={(event) => setEditingProduct({ ...editingProduct, published: event.target.checked })} /> Show on public website</label>
              <label className="product-check"><input type="checkbox" checked={editingProduct.featured} onChange={(event) => setEditingProduct({ ...editingProduct, featured: event.target.checked })} /> Mark as featured</label>
              {formError && <p className="form-notice" role="alert">{formError}</p>}
              <div className="user-form-actions"><button className="secondary-button" type="button" onClick={() => setEditingProduct(null)}>Cancel</button><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save product"}</button></div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
};

export default ProductList;
