const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Créer l'utilisateur
    const user = new User({ email, password, role: role || 'user' });
    await user.save();

    // Générer les tokens
    const accessToken = generateAccessToken({ userId: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user._id });

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Générer les tokens
    const accessToken = generateAccessToken({ userId: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user._id });

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const refresh = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Générer un nouveau access token
    const accessToken = generateAccessToken({ userId: user._id, email: user.email });

    res.json({
      accessToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  // Dans une implémentation complète, on pourrait invalider le refresh token
  // en le stockant dans une blacklist. Pour cette implémentation, on retourne juste un succès.
  res.json({ message: 'Logout successful' });
};

module.exports = {
  register,
  login,
  refresh,
  logout
};

