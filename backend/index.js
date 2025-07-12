const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const app = express();
app.use(cors());
app.use(express.json());

// Carpeta para uploads
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });
app.use("/uploads", express.static(UPLOADS_DIR));

// Configuración Sequelize SQLite
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./db.sqlite",
  logging: false,
});

// Modelos
const User = sequelize.define("User", {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: "admin" },
});

const Client = sequelize.define("Client", {
  name: { type: DataTypes.STRING, allowNull: false },
  alias: DataTypes.STRING,
  phone: DataTypes.STRING,
  email: DataTypes.STRING,
  notes: DataTypes.TEXT,
});

const Barber = sequelize.define("Barber", {
  name: { type: DataTypes.STRING, allowNull: false },
});

const Cut = sequelize.define("Cut", {
  service: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.STRING, allowNull: false },
  detail: DataTypes.TEXT,
  nota: DataTypes.TEXT,
  metodoPago: DataTypes.STRING,
});

const CutPhoto = sequelize.define("CutPhoto", {
  path: { type: DataTypes.STRING, allowNull: false },
});

// Relaciones
Cut.belongsTo(Client, { foreignKey: "clientId", onDelete: "CASCADE" });
Cut.belongsTo(Barber, { foreignKey: "barberId", onDelete: "CASCADE" });
Client.hasMany(Cut, { foreignKey: "clientId", onDelete: "CASCADE" });
Barber.hasMany(Cut, { foreignKey: "barberId", onDelete: "CASCADE" });
Cut.hasMany(CutPhoto, {
  foreignKey: "cutId",
  as: "photos",
  onDelete: "CASCADE",
});
CutPhoto.belongsTo(Cut, { foreignKey: "cutId" });

// Middleware autenticación JWT
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ error: "Missing token" });
    const token = authHeader.split(" ")[1];
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    if (user.role !== "admin")
      return res.status(403).json({ error: "Access denied" });
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Rutas

// Health Check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "12h" }
    );
    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// Crear usuario (solo admin)
app.post("/api/users", authenticateToken, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Missing data" });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hash, role });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Listar usuarios (solo admin)
app.get("/api/users", authenticateToken, async (req, res) => {
  const users = await User.findAll({
    attributes: ["id", "username", "role"],
    order: [["createdAt", "DESC"]], // Más nuevos primero
  });
  res.json(users);
});

// Obtener usuario por ID (solo admin)
app.get("/api/users/:id", authenticateToken, async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: ["id", "username", "role"],
  });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// Actualizar usuario (solo admin)
app.put("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (username) user.username = username;
    if (role) user.role = role;
    if (password) user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ updated: 1 });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Eliminar usuario (solo admin)
app.delete("/api/users/:id", authenticateToken, async (req, res) => {
  const deleted = await User.destroy({ where: { id: req.params.id } });
  res.json({ deleted });
});

// Proteger todas las rutas siguientes
// Protege usuarios (todo)
app.use("/api/users", authenticateToken);

// Protege cortes (todo)
app.use("/api/cuts", authenticateToken);
app.use("/api/cuts/:id", authenticateToken);
app.use("/api/cuts/:id/photo", authenticateToken);
app.use("/api/cuts/:cutId/photos", authenticateToken);

// Protege clientes (si querés)
app.use("/api/clients", authenticateToken);

// Protege barberos (si querés)
app.use("/api/barbers", authenticateToken);

// CRUD Clientes
app.get("/api/clients", async (req, res) => {
  const { query } = req.query;
  const where = query
    ? { name: { [Sequelize.Op.like]: `%${query}%` } }
    : undefined;
  const clients = await Client.findAll({
    where,
    order: [["createdAt", "DESC"]], // Más nuevos primero
  });
  res.json(clients);
});

app.post("/api/clients", async (req, res) => {
  const client = await Client.create(req.body);
  res.json(client);
});

app.put("/api/clients/:id", async (req, res) => {
  const updated = await Client.update(req.body, {
    where: { id: req.params.id },
  });
  res.json({ updated: updated[0] });
});

app.delete("/api/clients/:id", async (req, res) => {
  const deleted = await Client.destroy({ where: { id: req.params.id } });
  res.json({ deleted });
});

// CRUD Barberos
app.get("/api/barbers", async (req, res) => {
  const barbers = await Barber.findAll({
    order: [["createdAt", "DESC"]],
  });
  res.json(barbers);
});

app.post("/api/barbers", async (req, res) => {
  const barber = await Barber.create(req.body);
  res.json(barber);
});

app.put("/api/barbers/:id", async (req, res) => {
  const updated = await Barber.update(req.body, {
    where: { id: req.params.id },
  });
  res.json({ updated: updated[0] });
});

app.delete("/api/barbers/:id", async (req, res) => {
  const deleted = await Barber.destroy({ where: { id: req.params.id } });
  res.json({ deleted });
});

// CRUD Cortes
app.get("/api/cuts", async (req, res) => {
  const { date, service } = req.query;
  const where = {};
  if (date) where.date = date;
  if (service) where.service = service;

  const cuts = await Cut.findAll({
    where,
    include: [Client, Barber, { model: CutPhoto, as: "photos" }],
    order: [["createdAt", "DESC"]], // Cambiado a createdAt para consistencia
  });
  res.json(cuts);
});

app.post("/api/cuts", async (req, res) => {
  const cut = await Cut.create(req.body);
  res.json(cut);
});

app.put("/api/cuts/:id", async (req, res) => {
  const cut = await Cut.findByPk(req.params.id);
  if (!cut) return res.status(404).json({ error: "Cut not found" });
  await cut.update(req.body);
  res.json({ updated: true });
});

app.delete("/api/cuts/:id", async (req, res) => {
  const deleted = await Cut.destroy({ where: { id: req.params.id } });
  res.json({ deleted });
});

// Manejo de fotos de cortes
app.post("/api/cuts/:id/photo", upload.single("photo"), async (req, res) => {
  const cut = await Cut.findByPk(req.params.id);
  if (!cut) return res.status(404).json({ error: "Cut not found" });
  const photo = await CutPhoto.create({
    cutId: cut.id,
    path: "/uploads/" + req.file.filename,
  });
  res.json(photo);
});

app.delete("/api/cuts/:cutId/photos/:photoId", async (req, res) => {
  const { cutId, photoId } = req.params;
  const photo = await CutPhoto.findOne({ where: { id: photoId, cutId } });
  if (!photo) return res.status(404).json({ error: "Photo not found" });
  const filePath = path.join(__dirname, photo.path);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  await photo.destroy();
  res.json({ deleted: true });
});

// Servir frontend en producción
const pathToBuild = path.join(__dirname, "dist");
if (fs.existsSync(pathToBuild)) {
  app.use(express.static(pathToBuild));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(pathToBuild, "index.html"));
  });
}

// Crear usuario admin inicial
async function createInitialAdmin() {
  const exists = await User.findOne({ where: { username: "admin" } });
  if (!exists) {
    const hash = await bcrypt.hash("admin", 10);
    await User.create({ username: "admin", password: hash, role: "admin" });
    console.log("Admin user created: admin / admin");
  }
}

// Iniciar servidor
const PORT = process.env.PORT || 80;
sequelize
  .sync()
  .then(async () => {
    await createInitialAdmin();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor iniciado en http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error iniciando la base de datos:", err);
  });
