import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/client";
import ProductContext from "./productsContext";

const fromApiProduct = (product) => ({
  ...product,
  imageUrl: product.image_url ?? "",
  artStyle: product.art_style ?? "ceramic",
  image_is_uploaded: product.image_is_uploaded ?? false,
});

const toApiProduct = (product) => {
  const values = {
    name: product.name,
    category: product.category,
    description: product.description || "",
    price: Number(product.price),
    image_url: product.imageFile ? "" : product.imageUrl || "",
    art_style: product.artStyle || "ceramic",
    published: String(Boolean(product.published)),
    featured: String(Boolean(product.featured)),
  };

  if (product.image_is_uploaded && product.image_url === product.imageUrl && !product.imageFile) {
    delete values.image_url;
  }

  return values;
};

const makeProductPayload = (product) => {
  const values = toApiProduct(product);
  if (!product.imageFile) return values;

  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => formData.append(key, value));
  formData.append("image", product.imageFile);
  return formData;
};

const ProductProvider = ({ children }) => {
  const { pathname } = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshProducts = useCallback(async (signal) => {
    const isAdminCatalog = pathname === "/admin/products";
    const response = await api.get(isAdminCatalog ? "/admin/products" : "/products", { signal });
    if (!Array.isArray(response.data.data)) {
      throw new Error("The product service returned an invalid response.");
    }

    return response.data.data.map(fromApiProduct);
  }, [pathname]);

  useEffect(() => {
    const controller = new AbortController();
    refreshProducts(controller.signal)
      .then((loadedProducts) => {
        setProducts(loadedProducts);
        setError("");
      })
      .catch((requestError) => {
        if (requestError.code === "ERR_CANCELED") return;
        const message = requestError.response?.data?.message || requestError.message;
        setError(message || "Unable to load products from the server.");
        setProducts([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [refreshProducts]);

  const value = useMemo(() => ({
    products,
    loading,
    error,
    refreshProducts,
    addProduct: async (product) => {
      const response = await api.post("/admin/products", makeProductPayload(product));
      const savedProduct = fromApiProduct(response.data.data);
      setProducts((current) => [savedProduct, ...current]);
      setError("");
      return savedProduct;
    },
    updateProduct: async (product) => {
      const payload = makeProductPayload(product);
      if (product.imageFile) payload.append("_method", "PUT");
      const response = product.imageFile
        ? await api.post(`/admin/products/${product.id}`, payload)
        : await api.put(`/admin/products/${product.id}`, payload);
      const savedProduct = fromApiProduct(response.data.data);
      setProducts((current) => current.map((item) => item.id === savedProduct.id ? savedProduct : item));
      setError("");
      return savedProduct;
    },
    deleteProduct: async (productId) => {
      await api.delete(`/admin/products/${productId}`);
      setProducts((current) => current.filter((product) => product.id !== productId));
      setError("");
    },
  }), [products, loading, error, refreshProducts]);

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export default ProductProvider;
