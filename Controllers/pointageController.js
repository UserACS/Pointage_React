const Pointage = require('../models/Pointage');
const Employe = require('../models/Employe');

// Pointer via empreinte
exports.enregistrerPointage = async (req, res) => {
  const { empreinte_hash, type } = req.body;
  if (!empreinte_hash || !type) {
    return res.status(400).json({ message: 'Code empreinte et type requis.' });
  }
  try {
    const employe = await Employe.findOne({ empreinte_hash });
    if (!employe) return res.status(404).json({ message: 'Employé non trouvé' });
    // Empêcher double pointage du même type le même jour
    const aujourdHui = new Date().toISOString().slice(0, 10);
    const pointageExistant = await Pointage.findOne({
      employe: employe._id,
      type,
      date: {
        $gte: new Date(aujourdHui + 'T00:00:00.000Z'),
        $lt: new Date(aujourdHui + 'T23:59:59.999Z')
      }
    });
    if (pointageExistant) {
      return res.status(400).json({ message: `Déjà pointé (${type}) aujourd’hui.` });
    }
    const pointage = new Pointage({ employe: employe._id, empreinte_hash, type });
    await pointage.save();
    res.status(201).json(pointage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Voir ses propres pointages
exports.listerMesPointages = async (req, res) => {
  try {
    const employeId = req.user.userId;
    const pointages = await Pointage.find({ employe: employeId }).sort({ date: 1 });
    res.json(pointages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lister les pointages d'un employé
exports.listerPointages = async (req, res) => {
  try {
    const pointages = await Pointage.find({ employe: req.params.employeId }).sort({ date: 1 });
    res.json(pointages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Calcul du temps de travail journalier
exports.calculerTempsTravail = async (req, res) => {
  try {
    const aujourdHui = new Date().toISOString().slice(0, 10);
    const pointages = await Pointage.find({
      employe: req.params.employeId,
      date: {
        $gte: new Date(aujourdHui + 'T00:00:00.000Z'),
        $lt: new Date(aujourdHui + 'T23:59:59.999Z')
      }
    }).sort({ date: 1 });

    let totalMs = 0;
    for (let i = 0; i < pointages.length; i += 2) {
      if (pointages[i] && pointages[i + 1]) {
        totalMs += pointages[i + 1].date - pointages[i].date;
      }
    }
    const heures = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    const secondes = Math.floor((totalMs % 60000) / 1000);

    res.json({ heures, minutes, secondes, totalMs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};