
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const chargerDashboard = async () => {
      try {
        const response = await api.get("/dashboard");
        setStats(response.data);
      } catch (error) {
        console.error(error);
        setErreur("Impossible de charger le Dashboard");
      } finally {
        setLoading(false);
      }
    };

    chargerDashboard();
  }, []);

  if (loading) {
    return <p style={{ padding: 30 }}>Chargement...</p>;
  }

  if (erreur) {
    return <p style={{ padding: 30, color: "red" }}>{erreur}</p>;
  }

  const cartes = [
    {
      titre: "Total voitures",
      valeur: stats.total_voitures,
      icone: "🚗",
    },
    {
      titre: "Voitures en service",
      valeur: stats.voitures_service,
      icone: "✅",
    },
    {
      titre: "Voitures en maintenance",
      valeur: stats.voitures_maintenance,
      icone: "🔧",
    },
    {
      titre: "Total clients",
      valeur: stats.total_clients,
      icone: "👥",
    },
    {
      titre: "Réservations actives",
      valeur: stats.reservations_actives,
      icone: "📅",
    },
    {
      titre: "Contrats actifs",
      valeur: stats.contrats_actifs,
      icone: "📄",
    },
    {
      titre: "Total retours",
      valeur: stats.total_retours,
      icone: "🔄",
    },
    {
      titre: "Total encaissé",
      valeur: `${Number(stats.total_encaisse).toFixed(2)} DH`,
      icone: "💰",
    },
  ];

  return (
    <div style={{ padding: "30px" }}>
      <h1>Dashboard — RentCar Manager</h1>

      <p>Bienvenue dans votre système de gestion de location.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "25px",
        }}
      >
        {cartes.map((carte) => (
          <div
            key={carte.titre}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "22px",
              backgroundColor: "#f9fafb",
            }}
          >
            <div style={{ fontSize: "26px" }}>
              {carte.icone}
            </div>

            <p style={{ color: "#666" }}>
              {carte.titre}
            </p>

            <h2 style={{ marginBottom: 0 }}>
              {carte.valeur}
            </h2>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: "35px" }}>
        Dernières réservations
      </h2>

      <div style={{ overflowX: "auto" }}>
        <table
          border="1"
          cellPadding="12"
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Voiture</th>
              <th>Date début</th>
              <th>Date fin</th>
              <th>Montant</th>
              <th>Statut</th>
            </tr>
          </thead>

          <tbody>
            {stats.dernieres_reservations.map((r) => (
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
                <td>{r.montant_total} DH</td>
                <td>{r.statut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stats.dernieres_reservations.length === 0 && (
        <p>Aucune réservation enregistrée.</p>
      )}

      <h2 style={{ marginTop: "35px" }}>Accès rapide</h2>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <Link to="/voitures">Gérer les voitures</Link>
        <Link to="/clients">Gérer les clients</Link>
        <Link to="/reservations">Réservations</Link>
        <Link to="/contrats">Contrats</Link>
        <Link to="/paiements">Paiements</Link>
        <Link to="/retours">Retours</Link>
      </div>
    </div>
  );
}

export default Dashboard;
