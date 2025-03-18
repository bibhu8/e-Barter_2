import Item from "../models/Item.js";
import cloudinary from '../config/cloudinary.js';
import { io } from "../server.js";

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
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    // Upload each file to Cloudinary
    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'swap-and-trade' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);

    const newItem = new Item({
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      bookType: req.body.bookType,
      images: imageUrls, // now storing an array of URLs
      user: req.user.id, // or req.user._id depending on your user model
    });

    await newItem.save();
    const populatedItem = await Item.findById(newItem._id).populate("user", "fullname");
    io.emit('item:create', populatedItem);
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
    io.emit('item:delete', req.params.id);
    res.json({ message: "Item removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("user", "fullname");
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




