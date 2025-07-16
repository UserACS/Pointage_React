import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Authentification = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post("http://localhost:5001/api/auth/login", formData);
      const { token } = response.data;
      navigate("/tableaudebord", { state: { token } });
      setMessage({ type: "success", text: "Connexion réussie." });
      // Rediriger ou effectuer une action après connexion
    } catch (error) {
      const errMsg = error.response?.data?.message || "Erreur inconnue.";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5, p: 4, boxShadow: 3, borderRadius: 2, bgcolor: "#fff" }}>
        <Typography variant="h5" gutterBottom>
          Connexion
        </Typography>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Mot de passe"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />

          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>

            <Button
              variant="text"
              color="secondary"
              onClick={() => navigate("/inscription")}
            >
              Créer un compte admin
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default Authentification;