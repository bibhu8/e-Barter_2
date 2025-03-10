import SwapRequest from "../models/SwapRequest.js";
import Item from "../models/Item.js";
import { io } from "../server.js";
import { createChatFromSwap } from "./chatController.js";

export const createSwapRequest = async (req, res) => {
  try {
    const { offeredItem, desiredItem } = req.body;
    const senderId = req.user._id;

    // Validate ownership
    const offeredItemDoc = await Item.findById(offeredItem);
    if (
      !offeredItemDoc ||
      offeredItemDoc.user.toString() !== senderId.toString()
    ) {
      return res.status(400).json({ message: "Invalid offered item." });
    }

    const desiredItemDoc = await Item.findById(desiredItem).populate("user");
    if (!desiredItemDoc)
      return res.status(404).json({ message: "Desired item not found." });

    const receiverId = desiredItemDoc.user._id;
    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ message: "Cannot swap with yourself." });
    }

    // Check existing requests
    const existingRequest = await SwapRequest.findOne({
      offeredItem,
      desiredItem,
      status: "pending",
    });
    if (existingRequest)
      return res.status(400).json({ message: "Request already exists." });

    // Create request
    const newRequest = await SwapRequest.create({
      sender: senderId,
      receiver: receiverId,
      offeredItem,
      desiredItem,
    });
    const populatedRequest = await SwapRequest.findById(newRequest._id)
      .populate("sender", "fullname")
      .populate("receiver", "fullname")
      .populate("offeredItem")
      .populate("desiredItem")


      io.to(populatedRequest.sender._id.toString()).emit("swapRequest:create", populatedRequest);
      io.to(populatedRequest.receiver._id.toString()).emit("swapRequest:create", populatedRequest);

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSwapRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await SwapRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
      deletedBy: { $nin: [userId] },
      status: { $ne: "deleted" }
    })
      .populate("sender", "fullname")
      .populate("receiver", "fullname")
      .populate("offeredItem")
      .populate("desiredItem");
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*export const acceptSwapRequest = async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id)
      .populate("offeredItem")
      .populate("desiredItem")
      .populate("sender", "fullname")
      .populate("receiver", "fullname");

    if (!request)
      return res.status(404).json({ message: "Request not found." });
    if (request.receiver.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized." });
    if (request.status !== "pending")
      return res.status(400).json({ message: "Request not pending." });

    // Swap owners
    const temp = request.offeredItem.user;
    request.offeredItem.user = request.desiredItem.user;
    request.desiredItem.user = temp;

    await request.offeredItem.save();
    await request.desiredItem.save();

    const updatedOffered = await Item.findById(
      request.offeredItem._id
    ).populate("user");
    const updatedDesired = await Item.findById(
      request.desiredItem._id
    ).populate("user");
    io.emit("item:update", updatedOffered);
    io.emit("item:update", updatedDesired);

    // Cleanup requests
    const pendingRequests = await SwapRequest.find({
      $or: [
        { offeredItem: { $in: [request.offeredItem._id, request.desiredItem._id] } },
        { desiredItem: { $in: [request.offeredItem._id, request.desiredItem._id] } },
      ],
      status: "pending",
    });
    
    // Now delete them
    await SwapRequest.deleteMany({
      _id: { $in: pendingRequests.map(r => r._id) }
    });
    
    // Emit deletion events for each found request
    pendingRequests.forEach((req) => {
      [req.sender, req.receiver].forEach((userId) => {
        io.to(userId.toString()).emit("swapRequest:delete", req._id);
      });
    });
    

    io.emit("swap:accepted", {
      offeredItem: request.offeredItem,
      desiredItem: request.desiredItem,
      requestId: request._id,
    });

    res.json({ message: "Swap successful." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
*/

export const acceptSwapRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const request = await SwapRequest.findById(req.params.id)
      .populate("offeredItem")
      .populate("desiredItem")
      .populate("sender", "fullname")
      .populate("receiver", "fullname");

      console.log(request.receiverId, currentUserId.toString());
    if (!request)
      return res.status(404).json({ message: "Request not found." });
    if (request.receiver._id.toString() !== currentUserId.toString())
      return res.status(403).json({ message: "Unauthorized from accept swap" });
    if (request.status !== "pending")
      return res.status(400).json({ message: "Request not pending." });

    // Mark request as accepted
    request.status = "accepted";
    await request.save();

    // Populate the updated request
    const updatedRequest = await SwapRequest.findById(request._id)
      .populate("sender", "fullname")
      .populate("receiver", "fullname")
      .populate("offeredItem")
      .populate("desiredItem");

    // Notify both parties about the update
    [updatedRequest.sender._id.toString(), updatedRequest.receiver._id.toString()].forEach(userId => {
      io.to(userId).emit("swapRequest:update", updatedRequest);
    });

    // Create a chat room and emit chat:start
    const chat = await createChatFromSwap(request._id);
    io.to(request.sender.toString()).emit("chat:start", { _id: chat._id });
    io.to(request.receiver.toString()).emit("chat:start", { _id: chat._id });

    res.json({ 
      message: "Swap accepted. Redirect to chat.",
      chatId: chat._id 
    });
  } catch (error) {
    console.error("Error accepting swap request:", error);
    res.status(500).json({ message: error.message });
  }
};


export const rejectRequest = async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id)
      .populate("sender", "fullname")
      .populate("receiver", "fullname")
      .populate("offeredItem")
      .populate("desiredItem");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Authorization: Only receiver can reject
    if (request.receiver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only receiver can reject requests" });
    }

    request.status = "rejected";
    if (req.body.message) {
      request.message = req.body.message;
    }
    await request.save();
    
    // Get updated request with populated data
    const updatedRequest = await SwapRequest.findById(request._id)
      .populate("sender", "fullname")
      .populate("receiver", "fullname")
      .populate("offeredItem")
      .populate("desiredItem");

    // Notify both parties with full request data
    [updatedRequest.sender._id.toString(), updatedRequest.receiver._id.toString()].forEach(userId => {
      io.to(userId).emit("swapRequest:update", updatedRequest);
    });

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id);
    const userId = req.user._id.toString();

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Verify user is either sender or receiver
    if (![request.sender.toString(), request.receiver.toString()].includes(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update deletedBy array and get updated document
    const updatedRequest = await SwapRequest.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { deletedBy: userId } },
      { new: true }
    );

    // Emit deletion event only to the current user (deleting user)
    io.to(userId).emit("swapRequest:delete", updatedRequest._id);

    res.json({ 
      message: "Request removed from your view",
      deletedId: updatedRequest._id
    });

  } catch (error) {
    console.error("Delete request error:", error);
    res.status(500).json({ 
      message: error.message || "Failed to delete request" 
    });
  }
};


