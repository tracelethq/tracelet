import express from "express";
import multer from "multer";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

function usersHandler(req: express.Request, res: express.Response) {
  res.json({
    users: [
      { id: "1", name: "Alice", email: "alice@example.com" },
      { id: "2", name: "Bob", email: "bob@example.com" },
    ],
  });
}

function userByIdHandler(req: express.Request, res: express.Response) {
  const user = { id: req.params.id, name: "Alice", email: "alice@example.com" };
  res.json(user);
}

function userPostsHandler(req: express.Request, res: express.Response) {
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const offset = Number(req.query.offset) || 0;
  res.json({
    posts: [
      { id: "1", title: "First post", userId: req.params.id },
      { id: "2", title: "Second post", userId: req.params.id },
    ].slice(offset, offset + limit),
  });
}

function createUserPostHandler(req: express.Request, res: express.Response) {
  const { title, body } = req.body ?? {};
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "title is required" });
  }
  console.log(req.files);
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length < 1 || files.length > 4) {
    return res.status(400).json({
      error: "1 to 4 image files are required (field name: images)",
    });
  }
  const post = {
    id: String(Date.now()),
    title,
    body: (body as string) ?? "",
    userId: req.params.id,
    images: files.map((f) => ({ originalname: f.originalname, size: f.size, mimetype: f.mimetype })),
  };
  res.status(201).json(post);
}

function userSettingsHandler(req: express.Request, res: express.Response) {
  res.json({ theme: "dark", notifications: true });
}

function updateUserHandler(req: express.Request, res: express.Response) {
  const { name, email } = req.body ?? {};
  res.json({
    id: req.params.id,
    name: name ?? "Alice",
    email: email ?? "alice@example.com",
  });
}

router.get("/", usersHandler);
router.get("/:id", userByIdHandler);
router.get("/:id/posts", userPostsHandler);
router.post(
  "/:id/posts",
  upload.array("images", 4),
  createUserPostHandler
);
router.get("/:id/settings", userSettingsHandler);
router.patch("/:id", updateUserHandler);

export { router as userRoutes };