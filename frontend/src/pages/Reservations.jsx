
import { useEffect, useState } from "react";
import api from "../services/api";

const initialReservation = {
  client_id: "",
  voiture_id: "",
  date_debut: "",
  date_fin: "",
  statut: "en_attente",
  remarques: "",
};

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [clients, setClients] = useState([]);
  const [voitures, setVoitures] = useState([]);
  const [form, setForm] = useState({ ...initialReservation });
  const [idModification, setIdModification] = useState(null);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  const chargerDonnees = async () => {
    try {
      const [resR, resC, resV] = await Promise.all([
        api.get("/reservations"),
        api.get("/clients"),
        api.get("/voitures"),
      ]);

      setReservations(resR.data);
      setClients(resC.data);
      setVoitures(resV.data);
    } catch (error) {
      console.error(error);
      setErreur("Erreur de chargement des données");
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculerPrix = () => {
    const voiture = voitures.find(
      (v) => v.id === Number(form.voiture_id)
    );

    if (!voiture || !form.date_debut || !form.date_fin) {
      return null;
    }

    const debut = new Date(form.date_debut + "T00:00:00");
    const fin = new Date(form.date_fin + "T00:00:00");
    const jours = Math.round(
      (fin - debut) / (1000 * 60 * 60 * 24)
    );

    if (jours <= 0) return null;

    return {
      jours,
      total: jours * Number(voiture.prix_jour),
    };
  };

  const prix = calculerPrix();

  const enregistrer = async (e) => {
    e.preventDefault();
    setMessage("");
    setErreur("");

    try {
      if (idModification !== null) {
        await api.put(`/reservations/${idModification}`, form);
        setMessage("Réservation modifiée avec succès !");
      } else {
        const { statut, ...nouvelleReservation } = form;
        await api.post("/reservations", nouvelleReservation);
        setMessage("Réservation ajoutée avec succès !");
      }

      setForm({ ...initialReservation });
      setIdModification(null);
      await chargerDonnees();
    } catch (error) {
      const erreurs = error.response?.data?.errors;

      if (erreurs) {
        setErreur(Object.values(erreurs).flat().join(" | "));
      } else {
        setErreur(
          error.response?.data?.message ||
          "Erreur lors de l'enregistrement"
        );
      }
    }
  };

  const modifier = (r) => {
    setIdModification(r.id);

    setForm({
      client_id: String(r.client_id),
      voiture_id: String(r.voiture_id),
      date_debut: r.date_debut.substring(0, 10),
      date_fin: r.date_fin.substring(0, 10),
      statut: r.statut,
      remarques: r.remarques ?? "",
    });

    setErreur("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const annuler = async (id) => {
    if (!window.confirm("Annuler cette réservation ?")) return;

    try {
      await api.delete(`/reservations/${id}`);
      await chargerDonnees();
      setMessage("Réservation annulée avec succès !");
      setErreur("");

      if (idModification === id) {
        setIdModification(null);
        setForm({ ...initialReservation });
      }
    } catch (error) {
      setErreur("Erreur lors de l'annulation");
    }
  };

  const resetForm = () => {
    setForm({ ...initialReservation });
    setIdModification(null);
    setErreur("");
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Gestion des réservations</h1>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {erreur && <p style={{ color: "red" }}>{erreur}</p>}

      <h2>
        {idModification !== null
          ? "Modifier une réservation"
          : "Nouvelle réservation"}
      </h2>

      <form onSubmit={enregistrer}>
        <div>
          <label>Client : </label>
          <select
            name="client_id"
            value={form.client_id}
            onChange={handleChange}
            required
          >
            <option value="">Choisir un client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom} {c.prenom} - {c.cin}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Voiture : </label>
          <select
            name="voiture_id"
            value={form.voiture_id}
            onChange={handleChange}
            required
          >
            <option value="">Choisir une voiture</option>
            {voitures
              .filter(
                (v) =>
                  v.etat === "en_service" ||
                  String(v.id) === String(form.voiture_id)
              )
              .map((v) => (
                <option key={v.id} value={v.id}>
                  {v.marque} {v.modele} | {Number(v.prix_jour).toFixed(2)} DH/jour
                </option>
              ))}
          </select>
        </div>

        <div>
          <label>Date début : </label>
          <input
            type="date"
            name="date_debut"
            value={form.date_debut}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Date fin : </label>
          <input
            type="date"
            name="date_fin"
            value={form.date_fin}
            onChange={handleChange}
            required
          />
        </div>

        {prix && (
          <p>
            <strong>
              {prix.jours} jour(s) — Total estimé :
              {" "}{prix.total.toFixed(2)} DH
            </strong>
          </p>
        )}

        {idModification !== null && (
          <div>
            <label>Statut : </label>
            <select
              name="statut"
              value={form.statut}
              onChange={handleChange}
            >
              <option value="en_attente">En attente</option>
              <option value="confirmee">Confirmée</option>
              <option value="annulee">Annulée</option>
              <option value="terminee">Terminée</option>
            </select>
          </div>
        )}

        <div>
          <label>Remarques : </label>
          <textarea
            name="remarques"
            value={form.remarques}
            onChange={handleChange}
          />
        </div>

        <button type="submit">
          {idModification !== null ? "Enregistrer" : "Réserver"}
        </button>

        {idModification !== null && (
          <button type="button" onClick={resetForm}>
            Annuler modification
          </button>
        )}
      </form>

      <hr />

      <h2>Liste des réservations</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Client</th>
            <th>Voiture</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Jours</th>
            <th>Total</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {reservations.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>
                {r.client?.nom} {r.client?.prenom}
              </td>
              <td>
                {r.voiture?.marque} {r.voiture?.modele}
              </td>
              <td>{r.date_debut}</td>
              <td>{r.date_fin}</td>
              <td>{r.nombre_jours}</td>
              <td>{r.montant_total} DH</td>
              <td>{r.statut}</td>
              <td>
                <button onClick={() => modifier(r)}>
                  Modifier
                </button>

                {r.statut !== "annulee" && (
                  <button onClick={() => annuler(r.id)}>
                    Annuler
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {reservations.length === 0 && (
        <p>Aucune réservation enregistrée.</p>
      )}
    </div>
  );
}

export default Reservations;
