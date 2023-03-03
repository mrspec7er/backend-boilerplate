import express from "express";
import {
  createPost,
  deletePost,
  updatePublishPost,
  updateViewCount,
  getDrafPost,
  getSinglePost,
  searchPosts,
} from "../controller/postController";
import {
  verifyUserToken,
  verifyPublisherToken,
} from "../middleware/verifyToken";
import upload from "../middleware/fileInput";

const router = express.Router();

router.post("/post", verifyUserToken, upload.array("image"), createPost);
router.delete("/post/:id", deletePost);
router.get("/post/draf/:id", getDrafPost);
router.get("/post/:id", getSinglePost);
router.get("/post", searchPosts);
router.put("/post/:id", verifyPublisherToken, updatePublishPost);
router.post("/post/view-count/:id", updateViewCount);

export default router;
