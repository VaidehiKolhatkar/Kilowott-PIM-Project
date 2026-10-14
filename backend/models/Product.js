
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        sku: { type: String, required: true, unique: true, trim: true },
        category: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        brand: { type: String, default: "" },
        description: { type: String, default: "" },
        imageUrl: { type: String, default: "" },
        attributes: {
            type: Map,
            of: String,
            default: {},
        },
        syncStatus: {
            type: String,
            enum: ["Pending", "Synced"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
