import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminPage.css";

function AdminPage() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    brand: "",
    stock: "",
    image: "",
  });
  useEffect(() => {
    api.get("/products").then((res) => {
      setProducts(res.data);
    });
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== id),
      );
    } catch (error) {
      console.log("Failed to delete product:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.patch(
        `/products/${editingProduct._id}`,
        {
          name: editingProduct.name,
          price: editingProduct.price,
          stock: editingProduct.stock,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === editingProduct._id ? res.data.product : product,
        ),
      );

      setEditingProduct(null);
    } catch (error) {
      console.log("Failed to update product:", error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await api.post("/products", newProduct, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Product created:", res.data);

      setProducts((prev) => [...prev, res.data.product]);

      setNewProduct({
        name: "",
        price: "",
        description: "",
        category: "",
        brand: "",
        stock: "",
        image: "",
      });
      setAddingProduct(false);
    } catch (error) {
      console.log("Failed to create product:", error);
    }
  };
  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      <button onClick={() => setAddingProduct(true)}>+ Add Product</button>
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

          <button type="submit">Save</button>

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
              value={editingProduct.price}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  price: Number(e.target.value),
                })
              }
            />

            <input
              type="number"
              value={editingProduct.stock}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  stock: Number(e.target.value),
                })
              }
            />

            <button onClick={handleUpdate}>Save</button>

            <button onClick={() => setEditingProduct(null)}>Cancel</button>
          </div>
        )}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.stock}</td>
                <td>
                  <button onClick={() => setEditingProduct(product)}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(product._id)}>
                    Delete
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
