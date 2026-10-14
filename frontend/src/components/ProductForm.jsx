import "./ProductForm.css";
import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";

const emptyProduct = {
    name: "",
    sku: "",
    category: "Apparel",
    price: "",
    brand: "",
    description: "",
    imageUrl: "",
    attributes: {
        size: "",
        colour: "",
        material: "",
    },
};

function ProductForm({ product, onSave, onClose }) {
    const [form, setForm] = useState(emptyProduct);

    useEffect(() => {
        if (product) {
            setForm({
                ...emptyProduct,
                ...product,
                price: String(product.price ?? ""),
                attributes: {
                    ...emptyProduct.attributes,
                    ...(product.attributes || {}),
                },
            });
        } else {
            setForm(emptyProduct);
        }
    }, [product]);

    function updateField(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    }

    function updateAttribute(event) {
        const { name, value } = event.target;
        setForm((current) => ({
            ...current,
            attributes: { ...current.attributes, [name]: value },
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        onSave({
            ...form,
            price: Number(form.price),
        });
    }

    return (
        <div className="modal-backdrop" onMouseDown={onClose}>
            <section
                className="product-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="product-form-title"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <header className="modal-header">
                    <div>
                        <h2 id="product-form-title">
                            {product ? "Edit product" : "Add new product"}
                        </h2>
                        <p>Maintain accurate and consistent product information.</p>
                    </div>
                    <button
                        type="button"
                        className="icon-button"
                        onClick={onClose}
                        aria-label="Close form"
                    >
                        <X size={19} />
                    </button>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <label className="form-field">
                            Product name *
                            <input
                                name="name"
                                value={form.name}
                                onChange={updateField}
                                placeholder="e.g. Classic Cotton T-Shirt"
                                required
                            />
                        </label>

                        <label className="form-field">
                            SKU *
                            <input
                                name="sku"
                                value={form.sku}
                                onChange={updateField}
                                placeholder="e.g. TSH-005"
                                required
                            />
                        </label>

                        <label className="form-field">
                            Category *
                            <select
                                name="category"
                                value={form.category}
                                onChange={updateField}
                                required
                            >
                                <option>Apparel</option>
                                <option>Electronics</option>
                                <option>Accessories</option>
                                <option>Home</option>
                                <option>Beauty</option>
                                <option>Sports</option>
                                <option>Other</option>
                            </select>
                        </label>

                        <label className="form-field">
                            Price (₹) *
                            <input
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={updateField}
                                placeholder="799"
                                required
                            />
                        </label>

                        <label className="form-field">
                            Brand
                            <input
                                name="brand"
                                value={form.brand}
                                onChange={updateField}
                                placeholder="Brand name"
                            />
                        </label>

                        <label className="form-field">
                            Image URL
                            <input
                                name="imageUrl"
                                type="url"
                                value={form.imageUrl}
                                onChange={updateField}
                                placeholder="https://example.com/image.jpg"
                            />
                        </label>
                    </div>

                    <label className="form-field description-field">
                        Description
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={updateField}
                            placeholder="Describe the product..."
                            rows={3}
                        />
                    </label>

                    <div className="attributes-section">
                        <h3>Product attributes</h3>
                        <p>These details can vary depending on the product type.</p>

                        <div className="form-grid">
                            <label className="form-field">
                                Size
                                <input
                                    name="size"
                                    value={form.attributes.size}
                                    onChange={updateAttribute}
                                    placeholder="e.g. M, XL"
                                />
                            </label>

                            <label className="form-field">
                                Colour
                                <input
                                    name="colour"
                                    value={form.attributes.colour}
                                    onChange={updateAttribute}
                                    placeholder="e.g. Black"
                                />
                            </label>

                            <label className="form-field">
                                Material
                                <input
                                    name="material"
                                    value={form.attributes.material}
                                    onChange={updateAttribute}
                                    placeholder="e.g. Cotton"
                                />
                            </label>
                        </div>
                    </div>

                    <footer className="modal-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="primary-button">
                            {product ? "Save changes" : "Add product"}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}

export default ProductForm;
