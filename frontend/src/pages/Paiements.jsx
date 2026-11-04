
import { useEffect, useState } from "react";
import api from "../services/api";

const initialForm = {
  contrat_id: "",
  montant: "",
  mode_paiement: "especes",
  date_paiement: new Date().toLocaleDateString("en-CA"),
  reference: "",
  remarques: "",
};

function Paiements() {
  const [paiements, setPaiements] = useState([]);
  const [contrats, setContrats] = useState([]);
  const [form, setForm] = useState({ ...initialForm });
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);

  const chargerDonnees = async () => {
    try {
      const [resP, resC] = await Promise.all([
        api.get("/paiements"),
        api.get("/contrats"),
      ]);

      setPaiements(resP.data);
      setContrats(resC.data);
    } catch (error) {
      console.error(error);
      setErreur("Erreur de chargement des données");
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerResume = async (contratId) => {
    if (!contratId) {
      setResume(null);
      return;
    }

    try {
      const response = await api.get(
        `/contrats/${contratId}/resume-paiement`
      );
      setResume(response.data);
    } catch (error) {
      console.error(error);
      setResume(null);
      setErreur("Impossible de charger le résumé financier");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "contrat_id") {
      setResume(null);
      setErreur("");
      chargerResume(value);
    }
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    setMessage("");
    setErreur("");

    if (!resume) {
      setErreur("Choisir un contrat valide");
      return;
    }

    if (
      Number(form.montant) <= 0 ||
      Number(form.montant) > Number(resume.reste_a_payer)
    ) {
      setErreur("Montant invalide ou supérieur au reste à payer");
      return;
    }

    setLoading(true);

    try {
      await api.post("/paiements", form);

      setMessage("Paiement enregistré avec succès !");

      const contratId = form.contrat_id;

      setForm({
        ...initialForm,
        contrat_id: contratId,
        montant: "",
      });

      await chargerDonnees();
      await chargerResume(contratId);
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

  const formatMontant = (valeur) => {
    return Number(valeur || 0).toFixed(2) + " DH";
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Gestion des paiements</h1>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {erreur && <p style={{ color: "red" }}>{erreur}</p>}

      <h2>Nouveau paiement</h2>

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

            {contrats
              .filter((c) => c.statut === "actif")
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.numero_contrat} -{" "}
                  {c.reservation?.client?.nom}{" "}
                  {c.reservation?.client?.prenom}
                </option>
              ))}
          </select>
        </div>

        {resume && (
          <div
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              margin: "15px 0",
              maxWidth: "450px",
            }}
          >
            <h3>Résumé financier</h3>

            <p>
              Montant total :{" "}
              <strong>
                {formatMontant(resume.montant_total)}
              </strong>
            </p>

            <p>
              Montant payé :{" "}
              <strong>
                {formatMontant(resume.montant_paye)}
              </strong>
            </p>

            <p>
              Reste à payer :{" "}
              <strong>
                {formatMontant(resume.reste_a_payer)}
              </strong>
            </p>

            <p>
              Statut : <strong>{resume.statut_paiement}</strong>
            </p>
          </div>
        )}

        <div>
          <label>Montant (DH) : </label>

          <input
            type="number"
            name="montant"
            min="0.01"
            step="0.01"
            max={resume?.reste_a_payer || undefined}
            value={form.montant}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Mode de paiement : </label>

          <select
            name="mode_paiement"
            value={form.mode_paiement}
            onChange={handleChange}
          >
            <option value="especes">Espèces</option>
            <option value="carte">Carte bancaire</option>
            <option value="virement">Virement</option>
            <option value="cheque">Chèque</option>
          </select>
        </div>

        <div>
          <label>Date de paiement : </label>

          <input
            type="date"
            name="date_paiement"
            value={form.date_paiement}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Référence : </label>

          <input
            type="text"
            name="reference"
            placeholder="Ex: VIR-001"
            value={form.reference}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Remarques : </label>

          <textarea
            name="remarques"
            value={form.remarques}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            !resume ||
            Number(resume.reste_a_payer) <= 0
          }
        >
          {loading ? "Enregistrement..." : "Enregistrer paiement"}
        </button>
      </form>

      <hr />

      <h2>Historique des paiements</h2>

      <div style={{ overflowX: "auto" }}>
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Contrat</th>
              <th>Client</th>
              <th>Montant</th>
              <th>Mode</th>
              <th>Date</th>
              <th>Référence</th>
            </tr>
          </thead>

          <tbody>
            {paiements.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.contrat?.numero_contrat}</td>
                <td>
                  {p.contrat?.reservation?.client?.nom}{" "}
                  {p.contrat?.reservation?.client?.prenom}
                </td>
                <td>{formatMontant(p.montant)}</td>
                <td>{p.mode_paiement}</td>
                <td>{p.date_paiement}</td>
                <td>{p.reference || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paiements.length === 0 && (
        <p>Aucun paiement enregistré.</p>
      )}
    </div>
  );
}

export default Paiements;
