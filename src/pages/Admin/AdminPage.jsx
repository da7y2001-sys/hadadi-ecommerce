import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
//import { Link } from "react-router-dom";
import RiyalSymbol from "../../components/common/RiyalSymbol";
import AdminNotificationBell from "../../components/Admin/AdminNotificationBell";
import { useLanguage } from "../../context/LanguageContext";
import "./AdminPage.css";

function getApiErrorMessage(error, fallbackMessage) {
  const responseData = error.response?.data;

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors.join(" ");
  }

  return responseData?.message || fallbackMessage;
}

function AdminPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadRetryCount, setLoadRetryCount] = useState(0);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    brand: "",
    stock: "",
    image: "",
    sku: "",
    discount: 0,
    isActive: true,
  });

  useEffect(() => {
    let isActive = true;

    api
      .get("/admin/products")
      .then((res) => {
        if (isActive) setProducts(res.data);
      })
      .catch(() => {
        if (isActive) {
          setLoadError("Could not load products. Please try again.");
        }
      })
      .finally(() => {
        if (isActive) setLoadingProducts(false);
      });

    return () => {
      isActive = false;
    };
  }, [loadRetryCount]);

  const handleDelete = async (id) => {
    if (isSubmitting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    setIsSubmitting(true);

    try {
      await api.delete(`/products/${id}`);

      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== id),
      );

      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete product"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await api.patch(
        `/products/${editingProduct._id}`,
        {
          name: editingProduct.name,
          price: Number(editingProduct.price),
          description: editingProduct.description,
          category: editingProduct.category,
          brand: editingProduct.brand,
          stock: Number(editingProduct.stock),
          image: editingProduct.image,
          sku: editingProduct.sku,
          discount: Number(editingProduct.discount),
          isActive: editingProduct.isActive,
        },
      );

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === editingProduct._id ? res.data.product : product,
        ),
      );

      setEditingProduct(null);

      toast.success("Product updated successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update product"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await api.post("/products", newProduct);

      setProducts((prev) => [...prev, res.data.product]);

      setNewProduct({
        name: "",
        price: "",
        description: "",
        category: "",
        brand: "",
        stock: "",
        image: "",
        sku: "",
        discount: 0,
        isActive: true,
      });
      setAddingProduct(false);

      toast.success("Product created successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to create product"));
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="admin-page">
      <div className="admin-page-header admin-page-header-end">
        <AdminNotificationBell />
      </div>

      {loadingProducts && <p>Loading products...</p>}

      {loadError && (
        <div className="admin-error" role="alert">
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => {
              setLoadingProducts(true);
              setLoadError("");
              setLoadRetryCount((count) => count + 1);
            }}
          >
            Try Again
          </button>
        </div>
      )}

      <button onClick={() => setAddingProduct(true)} disabled={isSubmitting}>
        {t("addProductBtn")}
      </button>
      {addingProduct && (
        <form className="add-product-form" onSubmit={handleAddProduct}>
          <h2>Add Product</h2>

          <input
            type="text"
            placeholder="Name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: Number(e.target.value) })
            }
          />
          <input
            type="number"
            placeholder="Discount %"
            min="0"
            max="100"
            step="1"
            value={newProduct.discount}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                discount: e.target.value,
              })
            }
          />
          <input
            type="text"
            placeholder="SKU"
            value={newProduct.sku}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                sku: e.target.value,
              })
            }
          />

          <label>
            <input
              type="checkbox"
              checked={newProduct.isActive}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  isActive: e.target.checked,
                })
              }
            />
            Active
          </label>

          <input
            type="text"
            placeholder="Description"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Category"
            value={newProduct.category}
            onChange={(e) =>
              setNewProduct({ ...newProduct, category: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Brand"
            value={newProduct.brand}
            onChange={(e) =>
              setNewProduct({ ...newProduct, brand: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Stock"
            value={newProduct.stock}
            onChange={(e) =>
              setNewProduct({ ...newProduct, stock: Number(e.target.value) })
            }
          />

          <input
            type="text"
            placeholder="Image URL"
            value={newProduct.image}
            onChange={(e) =>
              setNewProduct({ ...newProduct, image: e.target.value })
            }
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </button>

          <button type="button" onClick={() => setAddingProduct(false)}>
            Cancel
          </button>
        </form>
      )}

      <div className="admin-products">
        <h2>Products</h2>
        {editingProduct && (
          <div className="edit-product-form">
            <h2>Edit Product</h2>

            <input
              type="text"
              placeholder="Product Name"
              value={editingProduct.name}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  name: e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Price"
              min="0"
              step="0.01"
              value={editingProduct.price}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  price: e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Stock"
              min="0"
              step="1"
              value={editingProduct.stock}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  stock: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="SKU"
              value={editingProduct.sku || ""}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  sku: e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Discount %"
              min="0"
              max="100"
              step="1"
              value={editingProduct.discount ?? 0}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  discount: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Description"
              value={editingProduct.description || ""}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  description: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Category"
              value={editingProduct.category || ""}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  category: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Brand"
              value={editingProduct.brand || ""}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  brand: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Image URL"
              value={editingProduct.image || ""}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  image: e.target.value,
                })
              }
            />

            <label>
              <input
                type="checkbox"
                checked={editingProduct.isActive ?? true}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    isActive: e.target.checked,
                  })
                }
              />
              Active
            </label>

            <button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </button>

            <button onClick={() => setEditingProduct(null)}>Cancel</button>
          </div>
        )}
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("colProduct")}</th>
              <th>{t("colPrice")}</th>
              <th>{t("colDiscount")}</th>
              <th>{t("colStock")}</th>
              <th>{t("colStatus")}</th>
              <th>{t("colActions")}</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>{product.price} <RiyalSymbol /></td>

                <td>{product.discount > 0 ? `${product.discount}%` : "-"}</td>

                <td>{product.stock}</td>

                <td>
                  {product.isActive ? (
                    <span className="status-active">{t("statusActive")}</span>
                  ) : (
                    <span className="status-inactive">{t("statusInactive")}</span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => setEditingProduct(product)}
                    disabled={isSubmitting}
                  >
                    {t("btnEdit")}
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={isSubmitting}
                  >
                    {t("btnDelete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPage;
