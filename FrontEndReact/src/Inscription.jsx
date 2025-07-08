import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem, Backdrop,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";

const Inscription = () => {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    password: "",
    role: "administrateur",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post("http://localhost:5001/api/auth/register", formData);
      setMessage({ type: "success", text: response.data.message });
      setFormData({ nom: "", email: "", password: "", role: "administrateur" });
       setTimeout(() => {
        navigate("/");
      }, 2500);
    } catch (error) {
      const errMsg = error.response?.data?.message || "Erreur inconnue.";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setLoading(false);
    }
  };
  const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;

  const handleKeyPress = (e) => {
    const allowed = /[0-9+\-\s()]/;
    const isControlKey = ["Backspace", "Delete", "ArrowLeft", "ArrowRight"].includes(e.key);
    
    if (!allowed.test(e.key) && !isControlKey ) {
      e.preventDefault();
    }
  };

  const formatPhone = (value) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, "");

    // Example formatting logic (basic): insert space every 2–3 digits after country code
    let formatted = cleaned;

    if (formatted.startsWith("+")) {
      const countryCode = formatted.slice(0, 3); // e.g. +33 or +12
      const rest = formatted.slice(3).replace(/\D/g, "");
      const chunks = rest.match(/.{1,2}/g) || [];
      formatted = countryCode + " " + chunks.join(" ");
    } else {
      const chunks = formatted.match(/.{1,2}/g) || [];
      formatted = chunks.join(" ");
    }

    return formatted.trim();
  };

  const handleChangePhoneNumber = (e) => {
    const raw = e.target.value;
    const formatted = formatPhone(raw);
    
    var error = !phoneRegex.test(formatted);
    
    setFormData({ ...formData, [e.target.name]: formatted });
    setError(error);
  };

  return (
     <>
      {/* 🔄 Fullscreen loading animation */}
      <Backdrop open={loading} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box textAlign="center">
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Création du compte en cours...
          </Typography>
        </Box>
      </Backdrop>
      <Container maxWidth="sm">
        <Box sx={{ mt: 5, p: 4, boxShadow: 3, borderRadius: 2, bgcolor: "#fff" }}>
          <Typography variant="h5" gutterBottom>
            Enregistrement Administrateur
          </Typography>

          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              margin="normal"
              required
            />
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
            <TextField
            label="Numéro international"
            variant="outlined"
            fullWidth
            value={formData.phone}
            onChange={handleChangePhoneNumber}
            onKeyDown={handleKeyPress}
            error={error}
            helperText={error ? "Format invalide. Exemple : +33 6 12 34 56 78" : ""}
            inputProps={{
              inputMode: 'tel',
              title: "Format attendu : +33 6 12 34 56 78 ou similaire",
              maxLength: 20,
            }}
            name ="phone"
            required
          />

            <TextField
              fullWidth
              select
              label="Rôle"
              name="role"
              value={formData.role}
              onChange={handleChange}
              margin="normal"
              required
            >
            <MenuItem value="administrateur">Administrateur</MenuItem>
            </TextField>

            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? "Enregistrement..." : "S'inscrire"}
              </Button>
            </Box>
          </form>
        </Box>
      </Container>
    </>
  );
};

export default Inscription;