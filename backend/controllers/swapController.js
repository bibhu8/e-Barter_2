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
      .populate("desiredItem");

      console.log("Emitting swapRequest:create to sender:", populatedRequest.sender._id.toString());
      io.to(populatedRequest.sender._id.toString()).emit("swapRequest:create", populatedRequest);
      
      console.log("Emitting swapRequest:create to receiver:", populatedRequest.receiver._id.toString());
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

    // Instead of swapping owners, update the request status to accepted
    request.status = "accepted";
    await request.save();
    
    const chat = await createChatFromSwap(request._id);
/*
// Modify response to include chat ID
res.json({ 
  message: "Swap accepted. Redirect to chat.",
  chatId: chat._id 
}); 

    // Create chat room data
    const chatData = {
      _id: request._id, // Use swap request ID as chat ID
      participants: [request.sender._id, request.receiver._id],
      createdAt: new Date()
    };

    // Emit a chat start event to both the sender and receiver
    io.to(request.sender.toString()).emit("chat:start", chatData);
    io.to(request.receiver.toString()).emit("chat:start", chatData);
*/
       // Emit a chat start event to both the sender and receiver
       req.io.to(request.sender.toString()).emit("chat:start", { _id: chat._id });
       req.io.to(request.receiver.toString()).emit("chat:start", { _id: chat._id });

    res.json({ 
      message: "Swap accepted. Redirect to chat.",
      chatId: request._id 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "rejected";
    request.message = req.body.message;
    await request.save();
    
    // Emit delete event to both parties
    [request.sender].forEach((userId) => {
      io.to(userId.toString()).emit("swapRequest:delete", request._id);
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Verify user is either sender or receiver
    const userId = req.user._id.toString();
    if (
      userId !== request.sender.toString() &&
      userId !== request.receiver.toString()
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await request.deleteOne();
    [request.sender, request.receiver].forEach((userId) => {
      io.to(userId.toString()).emit("swapRequest:delete", request._id);
    });
    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
