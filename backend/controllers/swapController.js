import SwapRequest from "../models/SwapRequest.js";
import Item from "../models/Item.js";

export const createSwapRequest = async (req, res) => {
  try {
    const { offeredItem, desiredItem } = req.body;
    const senderId = req.user._id;

    // Validate ownership
    const offeredItemDoc = await Item.findById(offeredItem);
    if (!offeredItemDoc || offeredItemDoc.user.toString() !== senderId.toString()) {
      return res.status(400).json({ message: "Invalid offered item." });
    }

    const desiredItemDoc = await Item.findById(desiredItem).populate("user");
    if (!desiredItemDoc) return res.status(404).json({ message: "Desired item not found." });
    
    const receiverId = desiredItemDoc.user._id;
    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ message: "Cannot swap with yourself." });
    }

    // Check existing requests
    const existingRequest = await SwapRequest.findOne({ offeredItem, desiredItem, status: "pending" });
    if (existingRequest) return res.status(400).json({ message: "Request already exists." });

    // Create request
    const newRequest = await SwapRequest.create({ sender: senderId, receiver: receiverId, offeredItem, desiredItem });
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSwapRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await SwapRequest.find({ $or: [{ sender: userId }, { receiver: userId }] })
      .populate("sender", "fullname")
      .populate("receiver", "fullname")
      .populate("offeredItem")
      .populate("desiredItem");
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptSwapRequest = async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id)
      .populate("offeredItem")
      .populate("desiredItem");
    
    if (!request) return res.status(404).json({ message: "Request not found." });
    if (request.receiver.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Unauthorized." });
    if (request.status !== "pending") return res.status(400).json({ message: "Request not pending." });

    // Swap owners
    const temp = request.offeredItem.user;
    request.offeredItem.user = request.desiredItem.user;
    request.desiredItem.user = temp;

    await request.offeredItem.save();
    await request.desiredItem.save();

    // Cleanup requests
    await SwapRequest.deleteMany({
      $or: [
        { offeredItem: { $in: [request.offeredItem._id, request.desiredItem._id] } },
        { desiredItem: { $in: [request.offeredItem._id, request.desiredItem._id] } }
      ],
      status: "pending"
    });

    res.json({ message: "Swap successful." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'rejected';
    request.message = req.body.message;
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Verify user is either sender or receiver
    const userId = req.user._id.toString();
    if (userId !== request.sender.toString() && userId !== request.receiver.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await request.deleteOne();
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};