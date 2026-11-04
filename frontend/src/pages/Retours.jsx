
import { useEffect, useState } from "react";
import api from "../services/api";

const initialForm = {
  contrat_id: "",
  date_retour: new Date().toLocaleDateString("en-CA"),
  kilometrage_retour: "",
  etat_retour: "bon",
  frais_supplementaires: "0",
  observations: "",
};

function Retours() {
  const [retours, setRetours] = useState([]);
  const [contrats, setContrats] = useState([]);
  const [form, setForm] = useState({ ...initialForm });
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);

  const chargerDonnees = async () => {
    try {
      const [resR, resC] = await Promise.all([
        api.get("/retours"),
        api.get("/contrats"),
      ]);

      setRetours(resR.data);
      setContrats(resC.data);
    } catch (error) {
      console.error(error);
      setErreur("Erreur de chargement des données");
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  const contratsDisponibles = contrats.filter(
    (c) =>
      c.statut === "actif" &&
      !retours.some((r) => r.contrat_id === c.id)
  );

  const contratSelectionne = contrats.find(
    (c) => String(c.id) === String(form.contrat_id)
  );

  const kmDepart =
    contratSelectionne?.reservation?.voiture?.kilometrage ?? null;

  const distance =
    kmDepart !== null && form.kilometrage_retour !== ""
      ? Number(form.kilometrage_retour) - Number(kmDepart)
      : null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "contrat_id"
        ? { kilometrage_retour: "" }
        : {}),
    }));
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    setMessage("");
    setErreur("");

    if (!contratSelectionne) {
      setErreur("Choisir un contrat valide.");
      return;
    }

    if (distance === null || distance < 0) {
      setErreur(
        "Le kilométrage retour doit être supérieur ou égal au départ."
      );
      return;
    }

    setLoading(true);

    try {
      await api.post("/retours", form);

      setMessage("Retour enregistré avec succès !");
      setForm({ ...initialForm });

      await chargerDonnees();
    } catch (error) {
      const erreurs = error.response?.data?.errors;

      setErreur(
        erreurs
          ? Object.values(erreurs).flat().join(" | ")
          : error.response?.data?.message ||
              "Erreur lors de l'enregistrement"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Gestion des retours</h1>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {erreur && <p style={{ color: "red" }}>{erreur}</p>}

      <h2>Enregistrer un retour</h2>

      <form onSubmit={enregistrer}>
        <div>
          <label>Contrat : </label>

          <select
            name="contrat_id"
            value={form.contrat_id}
            onChange={handleChange}
            required
          >
            <option value="">Choisir un contrat</option>

            {contratsDisponibles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.numero_contrat} -{" "}
                {c.reservation?.client?.nom}{" "}
                {c.reservation?.client?.prenom}
                {" - "}
                {c.reservation?.voiture?.marque}{" "}
                {c.reservation?.voiture?.modele}
              </option>
            ))}
          </select>
        </div>

        {contratSelectionne && (
          <div
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              margin: "15px 0",
              maxWidth: "450px",
            }}
          >
            <h3>Informations du véhicule</h3>

            <p>
              Voiture :{" "}
              <strong>
                {contratSelectionne.reservation?.voiture?.marque}{" "}
                {contratSelectionne.reservation?.voiture?.modele}
              </strong>
            </p>

            <p>
              Immatriculation :{" "}
              {contratSelectionne.reservation?.voiture?.immatriculation}
            </p>

            <p>
              Kilométrage actuel :{" "}
              <strong>{kmDepart} km</strong>
            </p>
          </div>
        )}

        <div>
          <label>Date de retour : </label>

          <input
            type="date"
            name="date_retour"
            value={form.date_retour}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Kilométrage retour : </label>

          <input
            type="number"
            name="kilometrage_retour"
            min={kmDepart ?? 0}
            value={form.kilometrage_retour}
            onChange={handleChange}
            required
          />
        </div>

        {distance !== null && distance >= 0 && (
          <p>
            Distance parcourue :{" "}
            <strong>{distance} km</strong>
          </p>
        )}

        <div>
          <label>État du véhicule : </label>

          <select
            name="etat_retour"
            value={form.etat_retour}
            onChange={handleChange}
          >
            <option value="bon">Bon état</option>
            <option value="endommage">Endommagé</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div>
          <label>Frais supplémentaires (DH) : </label>

          <input
            type="number"
            name="frais_supplementaires"
            min="0"
            step="0.01"
            value={form.frais_supplementaires}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Observations : </label>

          <textarea
            name="observations"
            value={form.observations}
            onChange={handleChange}
            placeholder="État du véhicule, dommages, remarques..."
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer retour"}
        </button>
      </form>

      <hr />

      <h2>Historique des retours</h2>

      <div style={{ overflowX: "auto" }}>
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Contrat</th>
              <th>Client</th>
              <th>Voiture</th>
              <th>Date retour</th>
              <th>Km départ</th>
              <th>Km retour</th>
              <th>Distance</th>
              <th>État</th>
              <th>Frais</th>
            </tr>
          </thead>

          <tbody>
            {retours.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.contrat?.numero_contrat}</td>
                <td>
                  {r.contrat?.reservation?.client?.nom}{" "}
                  {r.contrat?.reservation?.client?.prenom}
                </td>
                <td>
                  {r.contrat?.reservation?.voiture?.marque}{" "}
                  {r.contrat?.reservation?.voiture?.modele}
                </td>
                <td>{r.date_retour}</td>
                <td>{r.kilometrage_depart} km</td>
                <td>{r.kilometrage_retour} km</td>
                <td>
                  {r.kilometrage_retour - r.kilometrage_depart} km
                </td>
                <td>{r.etat_retour}</td>
                <td>{r.frais_supplementaires} DH</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {retours.length === 0 && (
        <p>Aucun retour enregistré.</p>
      )}
    </div>
  );
}

export default Retours;
