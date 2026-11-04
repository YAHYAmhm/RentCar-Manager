
import { useEffect, useState } from "react";
import api from "../services/api";

const conditionsDefaut =
  "Le locataire s'engage à respecter le code de la route, " +
  "à restituer le véhicule à la date prévue et dans un état correct. " +
  "Tout dommage ou retard sera traité selon les conditions de location.";

function Contrats() {
  const [contrats, setContrats] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState({
    reservation_id: "",
    caution: "0",
    conditions: conditionsDefaut,
  });
  const [idModification, setIdModification] = useState(null);
  const [contratImpression, setContratImpression] = useState(null);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  const chargerDonnees = async () => {
    try {
      const [resC, resR] = await Promise.all([
        api.get("/contrats"),
        api.get("/reservations"),
      ]);
      setContrats(resC.data);
      setReservations(resR.data);
    } catch (error) {
      console.error(error);
      setErreur("Erreur de chargement des données");
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  const reservationsDisponibles = reservations.filter(
    (r) =>
      r.statut === "confirmee" &&
      !contrats.some((c) => c.reservation_id === r.id)
  );

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    setMessage("");
    setErreur("");

    try {
      if (idModification !== null) {
        await api.put(`/contrats/${idModification}`, {
          caution: form.caution,
          conditions: form.conditions,
        });
        setMessage("Contrat modifié avec succès !");
      } else {
        await api.post("/contrats", form);
        setMessage("Contrat créé avec succès !");
      }

      setForm({
        reservation_id: "",
        caution: "0",
        conditions: conditionsDefaut,
      });
      setIdModification(null);
      await chargerDonnees();
    } catch (error) {
      const erreurs = error.response?.data?.errors;
      setErreur(
        erreurs
          ? Object.values(erreurs).flat().join(" | ")
          : error.response?.data?.message ||
              "Erreur lors de l'enregistrement"
      );
    }
  };

  const modifier = (c) => {
    setIdModification(c.id);
    setForm({
      reservation_id: String(c.reservation_id),
      caution: String(c.caution),
      conditions: c.conditions ?? "",
    });
    setErreur("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const annuler = async (id) => {
    if (!window.confirm("Annuler ce contrat ?")) return;

    try {
      await api.delete(`/contrats/${id}`);
      await chargerDonnees();
      setContratImpression(null);
      setMessage("Contrat annulé avec succès !");
      setErreur("");

      if (idModification === id) {
        resetForm();
      }
    } catch (error) {
      setErreur("Erreur lors de l'annulation");
    }
  };

  const resetForm = () => {
    setIdModification(null);
    setForm({
      reservation_id: "",
      caution: "0",
      conditions: conditionsDefaut,
    });
  };

  const imprimer = (contrat) => {
    setContratImpression(contrat);
  };

  const lancerImpression = () => {
    window.print();
  };

  return (
    <div className="contrats-page">
      <style>{`
        .contrats-page {
          padding: 30px;
        }

        .contrats-page input,
        .contrats-page select,
        .contrats-page textarea {
          padding: 9px;
          margin: 6px;
        }

        .contrats-page button {
          padding: 9px 14px;
          margin: 4px;
          cursor: pointer;
        }

        .contrats-page table {
          border-collapse: collapse;
          width: 100%;
          margin-top: 20px;
        }

        .contrats-page th,
        .contrats-page td {
          border: 1px solid #ccc;
          padding: 10px;
          text-align: left;
        }

        .contrat-document {
          background: white;
          color: black;
          padding: 35px;
          margin-top: 25px;
          border: 1px solid #ddd;
          max-width: 850px;
        }

        .contrat-document h1 {
          text-align: center;
        }

        .contrat-document h3 {
          border-bottom: 1px solid #aaa;
          padding-bottom: 8px;
        }

        .signature-zone {
          display: flex;
          justify-content: space-between;
          margin-top: 70px;
        }

        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }

          body * {
            visibility: hidden !important;
          }

          #contrat-a-imprimer,
          #contrat-a-imprimer * {
            visibility: visible !important;
          }

          #contrat-a-imprimer {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            border: none;
          }

          .signature-zone {
            break-inside: avoid;
          }
        }
      `}</style>

      <h1>Gestion des contrats</h1>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {erreur && <p style={{ color: "red" }}>{erreur}</p>}

      <h2>
        {idModification !== null
          ? "Modifier un contrat"
          : "Créer un contrat"}
      </h2>

      <form onSubmit={enregistrer}>
        {idModification === null ? (
          <div>
            <label>Réservation confirmée : </label>
            <select
              name="reservation_id"
              value={form.reservation_id}
              onChange={handleChange}
              required
            >
              <option value="">Choisir une réservation</option>
              {reservationsDisponibles.map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.id} - {r.client?.nom} {r.client?.prenom}
                  {" - "}
                  {r.voiture?.marque} {r.voiture?.modele}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p>Réservation #{form.reservation_id}</p>
        )}

        <div>
          <label>Caution (DH) : </label>
          <input
            type="number"
            name="caution"
            min="0"
            step="0.01"
            value={form.caution}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Conditions : </label>
          <textarea
            name="conditions"
            value={form.conditions}
            onChange={handleChange}
            rows="5"
            cols="55"
          />
        </div>

        <button type="submit">
          {idModification !== null ? "Enregistrer" : "Créer contrat"}
        </button>

        {idModification !== null && (
          <button type="button" onClick={resetForm}>
            Annuler modification
          </button>
        )}
      </form>

      <hr />

      <h2>Liste des contrats</h2>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Numéro</th>
              <th>Client</th>
              <th>Voiture</th>
              <th>Montant</th>
              <th>Caution</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contrats.map((c) => (
              <tr key={c.id}>
                <td>{c.numero_contrat}</td>
                <td>
                  {c.reservation?.client?.nom}{" "}
                  {c.reservation?.client?.prenom}
                </td>
                <td>
                  {c.reservation?.voiture?.marque}{" "}
                  {c.reservation?.voiture?.modele}
                </td>
                <td>{c.montant_total} DH</td>
                <td>{c.caution} DH</td>
                <td>{c.statut}</td>
                <td>
                  <button onClick={() => modifier(c)}>
                    Modifier
                  </button>

                  <button onClick={() => imprimer(c)}>
                    Voir / Imprimer
                  </button>

                  {c.statut !== "annule" && (
                    <button onClick={() => annuler(c.id)}>
                      Annuler
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {contrats.length === 0 && <p>Aucun contrat enregistré.</p>}

      {contratImpression && (
        <div>
          <div style={{ marginTop: 20 }}>
            <button onClick={lancerImpression}>
              Imprimer le contrat
            </button>
            <button onClick={() => setContratImpression(null)}>
              Fermer
            </button>
          </div>

          <div
            id="contrat-a-imprimer"
            className="contrat-document"
          >
            <h1>CONTRAT DE LOCATION DE VÉHICULE</h1>

            <p style={{ textAlign: "center" }}>
              N° {contratImpression.numero_contrat}
            </p>

            <p>
              Date de signature : {contratImpression.date_signature}
            </p>

            <h3>1. Informations du locataire</h3>
            <p>
              <strong>Nom complet :</strong>{" "}
              {contratImpression.reservation?.client?.nom}{" "}
              {contratImpression.reservation?.client?.prenom}
            </p>
            <p>
              <strong>CIN :</strong>{" "}
              {contratImpression.reservation?.client?.cin}
            </p>
            <p>
              <strong>Téléphone :</strong>{" "}
              {contratImpression.reservation?.client?.telephone}
            </p>
            <p>
              <strong>Permis :</strong>{" "}
              {contratImpression.reservation?.client?.numero_permis}
            </p>
            <p>
              <strong>Adresse :</strong>{" "}
              {contratImpression.reservation?.client?.adresse || "-"}
            </p>

            <h3>2. Informations du véhicule</h3>
            <p>
              <strong>Marque / Modèle :</strong>{" "}
              {contratImpression.reservation?.voiture?.marque}{" "}
              {contratImpression.reservation?.voiture?.modele}
            </p>
            <p>
              <strong>Immatriculation :</strong>{" "}
              {contratImpression.reservation?.voiture?.immatriculation}
            </p>
            <p>
              <strong>Carburant :</strong>{" "}
              {contratImpression.reservation?.voiture?.carburant}
            </p>

            <h3>3. Durée de location</h3>
            <p>
              <strong>Du :</strong>{" "}
              {contratImpression.reservation?.date_debut}
            </p>
            <p>
              <strong>Au :</strong>{" "}
              {contratImpression.reservation?.date_fin}
            </p>
            <p>
              <strong>Nombre de jours :</strong>{" "}
              {contratImpression.reservation?.nombre_jours}
            </p>

            <h3>4. Conditions financières</h3>
            <p>
              <strong>Prix par jour :</strong>{" "}
              {contratImpression.reservation?.prix_jour} DH
            </p>
            <p>
              <strong>Montant total :</strong>{" "}
              {contratImpression.montant_total} DH
            </p>
            <p>
              <strong>Caution :</strong>{" "}
              {contratImpression.caution} DH
            </p>

            <h3>5. Conditions générales</h3>
            <p style={{ whiteSpace: "pre-wrap" }}>
              {contratImpression.conditions || "-"}
            </p>

            <div className="signature-zone">
              <div>
                <strong>Signature du locataire</strong>
                <p>Lu et approuvé</p>
              </div>
              <div>
                <strong>Signature de l'agence</strong>
                <p>Cachet et signature</p>
              </div>
            </div>

            <p style={{ textAlign: "center", marginTop: 60 }}>
              Document généré par RentCar Manager
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contrats;
