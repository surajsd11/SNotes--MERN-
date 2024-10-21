require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");

mongoose.connect(config.connectionString);

const User = require("./models/user.model");
const Note = require("./models/note.model");

const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const { authenicateToken } = require("./utilities");
const { error } = require("console");

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173', // Specify your frontend's origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

app.get("/", (req, res) => {
  res.json({ data: "hello" });
});

//Create Account
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName && !email && !password) {
    return res
      .status(400)
      .json({ message: "Please provide all the required fields" });
  }

  const isUser = await User.findOne({ email });

  if (isUser) {
    return res.json({
      error: true,
      message: "user already exist",
    });
  }

  const user = new User({
    fullName,
    email,
    password,
  });

  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000m",
  });

  return res.json({
    error: false,
    user,
    accessToken,
    message: "Registration is successful",
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email && !password) {
    return res
      .status(400)
      .json({ message: "Please provide all the required fields" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({
      error: true,
      message: "user does not exist",
    });
  }

  if (user.email == email && user.password == password) {
    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "36000m",
    });

    return res.json({
      error: false,
      accessToken,
      message: "Login is successful",
    });
  } else {
    return res.status(400).json({
      error: true,
      message: "Invalid credentials",
    });
  }
});

//Get User
app.get("/get-user", authenicateToken, async (req, res) => {
  const { user } = req.user;

  const isUser = await User.findOne({ _id: user._id });
  if (!isUser) {
    return res.sendStatus(404);
  }

  return res.json({
    error: false,
    user,
    message: "User is found",
  });
});

//Add Note
app.post("/add-note", authenicateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;
  if (!title && !content) {
    return res
      .status(400)
      .json({ message: "Please provide all the required fields" });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Something went wrong",
    });
  }
});

app.put("/edit-note/:noteId", authenicateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;

  if (!title && !content && !tags) {
    return res.status(400).json({ message: "No changes made" });
  }

  try {
    const note = await Note.findById({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not found",
      });
    }

    if (title) {
      note.title = title;
    }
    if (content) {
      note.content = content;
    }
    if (tags) {
      note.tags = tags;
    }
    if (isPinned) {
      note.isPinned = isPinned;
    }

    await note.save();

    return res.json({
      error: false,
      message: "Note updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Something went wrong",
    });
  }
});

//Get all Note
app.get("/get-all-notes", authenicateToken, async (req, res) => {
  const { user } = req.user;

  try {
    const notes = await Note.find({ userId: user._id }).sort({
      isPinned: -1,
    });

    return res.json({
      error: false,
      notes,
      message: "All notes retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Something went wrong",
    });
  }
});

//Delete Note
app.delete("/delete-note/:noteId", authenicateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not found",
      });
    }

    await Note.deleteOne({ _id: noteId, userId: user._id });

    return res.json({
      error: false,
      message: "Note deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Something went wrong",
    });
  }
});

//Update isPinned value
app.put("/update-note-pinned/:noteId", authenicateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const { user } = req.user;

  try {
    const note = await Note.findById({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not found",
      });
    }

    if (isPinned) {
      note.isPinned = isPinned || false;
    }

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Something went wrong",
    });
  }
});

app.listen(8000);

module.exports = app;
