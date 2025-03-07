import Item from "../models/Item.js";
import cloudinary from '../config/cloudinary.js';

export const getItems = async (req, res) => {
  try {
    const items = await Item.find().populate("user", "fullname");
    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getItemsFromOther = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const query = userId ? { user: { $ne: userId } } : {};
    const items = await Item.find(query).populate("user", "fullname");
    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// itemController.js
export const postItem = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Upload to Cloudinary using buffer
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'swap-and-trade' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const newItem = new Item({
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      condition: req.body.condition,
      images: result.secure_url,
      user: req.user.id,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const getItemsByUser = async (req, res) => {
  try {
    const items = await Item.find({ user: req.user._id });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user's items" });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    console.log(item._id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    await item.deleteOne();
    res.json({ message: "Item removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



