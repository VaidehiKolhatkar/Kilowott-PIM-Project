import ProductForm from "./components/ProductForm";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Tags,
  Plug,
  Search,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  ChevronDown,
  Boxes,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";
// import { sampleProducts } from "./data/sampleProduct";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load products");
        return response.json();
      })
      .then((data) => {
        setProducts(data.map((product) => ({
          ...product,
          id: product._id,
        })));
      })
      .catch((error) => console.error("Error loading products:", error));
  }, []);

  const categories = [
    "All categories",
    ...new Set(products.map((p) => p.category)),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All categories" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  const syncedCount = products.filter(
    (p) => p.syncStatus === "Synced"
  ).length;


  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${id}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete product");
      }

      setProducts((current) => current.filter((p) => p.id !== id));
    } catch (error) {
      alert(error.message);
    }
  }



  async function handleSave(productData) {
    try {
      const isEditing = Boolean(editingProduct);

      const response = await fetch(
        isEditing
          ? `http://localhost:5000/api/products/${editingProduct.id}`
          : "http://localhost:5000/api/products",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...productData,
            syncStatus: "Pending",
          }),
        }
      );

      const savedProduct = await response.json();

      if (!response.ok) {
        throw new Error(savedProduct.message || "Failed to save product");
      }

      if (isEditing) {
        setProducts((current) =>
          current.map((p) =>
            p.id === editingProduct.id
              ? { ...savedProduct, id: savedProduct._id }
              : p
          )
        );
      } else {
        setProducts((current) => [
          ...current,
          { ...savedProduct, id: savedProduct._id },
        ]);
      }

      setFormOpen(false);
      setEditingProduct(null);
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleSync() {
    let synced = 0;
    let failed = 0;

    for (const product of products) {
      try {
        const checkResponse = await fetch(
          `http://localhost:4000/wp-json/wc/v3/products?sku=${encodeURIComponent(product.sku)}`
        );

        if (!checkResponse.ok) {
          throw new Error("Could not check product");
        }

        const existingProducts = await checkResponse.json();

        const wooProduct = {
          name: product.name,
          sku: product.sku,
          regular_price: String(product.price),
          description: product.description || "",
          categories: [],
          attributes: Object.entries(product.attributes || {}).map(
            ([name, option]) => ({
              name,
              options: [String(option)],
            })
          ),
        };

        const syncResponse = await fetch(
          existingProducts.length
            ? `http://localhost:4000/wp-json/wc/v3/products/${existingProducts[0].id}`
            : "http://localhost:4000/wp-json/wc/v3/products",
          {
            method: existingProducts.length ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(wooProduct),
          }
        );

        if (!syncResponse.ok) {
          throw new Error("Product sync failed");
        }

        const statusResponse = await fetch(
          `http://localhost:5000/api/products/${product.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ syncStatus: "Synced" }),
          }
        );

        if (!statusResponse.ok) {
          throw new Error("Could not update sync status");
        }

        synced++;
      } catch (error) {
        console.error(`Failed to sync ${product.name}:`, error);
        failed++;
      }
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/products"
      );

      if (!response.ok) {
        throw new Error("Could not reload products");
      }

      const data = await response.json();

      setProducts(
        data.map((product) => ({
          ...product,
          id: product._id,
        }))
      );
    } catch (error) {
      console.error("Could not refresh products:", error);
    }

    alert(
      `Mock WooCommerce sync finished!\nSuccessful: ${synced}\nFailed: ${failed}`
    );
  }


  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Boxes size={23} /></div>
          <div>
            <h2>Catalogly</h2>
            <span>PRODUCT MANAGEMENT</span>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav>
          <a className="nav-item active" href="#dashboard">
            <LayoutDashboard size={19} /> Dashboard
          </a>
          <a className="nav-item" href="#products">
            <Package size={19} /> Products
          </a>
          <a className="nav-item" href="#attributes">
            <Tags size={19} /> Attributes
          </a>
          <a className="nav-item" href="#integrations">
            <Plug size={19} /> Integrations
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="connection-dot" />
          <div>
            <strong>WooCommerce</strong>
            <span>Demo mode</span>
          </div>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">WORKSPACE / OVERVIEW</p>
            <h1>Product Dashboard</h1>
            <p className="subtitle">
              Manage your catalog and keep product data consistent.
            </p>
          </div>
          <button className="sync-button" onClick={handleSync}>
            <RefreshCw size={17} /> Sync to WooCommerce
          </button>
        </header>

        <section className="stats-grid">
          <StatCard
            title="Total products"
            value={products.length}
            note="Products in your catalog"
            icon={<Package size={21} />}
            color="purple"
          />
          <StatCard
            title="Categories"
            value={new Set(products.map((p) => p.category)).size}
            note="Product categories"
            icon={<Tags size={21} />}
            color="blue"
          />
          <StatCard
            title="Synced products"
            value={syncedCount}
            note="Marked as synchronized"
            icon={<CheckCircle2 size={21} />}
            color="green"
          />
          <StatCard
            title="Pending sync"
            value={products.length - syncedCount}
            note="Awaiting synchronization"
            icon={<Clock3 size={21} />}
            color="orange"
          />
        </section>

        <section className="catalog-panel" id="products">
          <div className="panel-heading">
            <div>
              <h2>Product catalog</h2>
              <p>Manage your products, pricing, and attributes.</p>
            </div>
            <button
              className="primary-button"
              onClick={() => {
                setEditingProduct(null);
                setFormOpen(true);
              }}
            >
              <Plus size={18} /> Add product
            </button>
          </div>

          <div className="toolbar">
            <div className="search-box">
              <Search size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products or SKU..."
              />
            </div>
            <div className="select-wrap">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <ChevronDown size={16} />
            </div>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>SKU</th>
                  <th>CATEGORY</th>
                  <th>PRICE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        <div className="product-thumbnail">
                          <Package size={20} />
                        </div>
                        <div>
                          <strong>{product.name}</strong>
                          <span>{product.brand}</span>
                        </div>
                      </div>
                    </td>
                    <td className="sku">{product.sku}</td>
                    <td>{product.category}</td>
                    <td className="price">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span
                        className={`status ${product.syncStatus === "Synced"
                          ? "status-synced"
                          : "status-pending"
                          } `}
                      >
                        {product.syncStatus === "Synced" ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <AlertCircle size={14} />
                        )}
                        {product.syncStatus}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="icon-button"
                          title="Edit"
                          onClick={() => {
                            setEditingProduct(product);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-button delete-button"
                          title="Delete"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      No products found. Try another search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            Showing {filteredProducts.length} of {products.length} products
            <span>Catalogly · Demo workspace</span>
          </div>
        </section>

        <footer className="footer">
          <span>Catalogly © 2026</span>
          <span>Product data management, simplified.</span>
        </footer>
        {formOpen && (
          <ProductForm
            product={editingProduct}
            onSave={handleSave}
            onClose={() => {
              setFormOpen(false);
              setEditingProduct(null);
            }}
          />
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, note, icon, color }) {
  return (
    <div className="stat-card">
      <div className={`stat - icon ${color} `}>{icon}</div>
      <p>{title}</p>
      <h2>{value}</h2>
      <span>{note}</span>
    </div>
  );
}

export default App;
