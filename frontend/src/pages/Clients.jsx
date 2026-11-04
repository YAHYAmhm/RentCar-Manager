
import { useEffect, useState } from "react";
import api from "../services/api";

const initialClient = {
  nom: "",
  prenom: "",
  cin: "",
  telephone: "",
  email: "",
  adresse: "",
  numero_permis: "",
  date_naissance: "",
};

function Clients() {
  const [clients, setClients] = useState([]);
  const [client, setClient] = useState(initialClient);
  const [idModification, setIdModification] = useState(null);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  const chargerClients = async () => {
    try {
      const response = await api.get("/clients");
      setClients(response.data);
    } catch (error) {
      console.log(error);
      setErreur("Erreur de chargement des clients");
    }
  };

  useEffect(() => {
    chargerClients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const enregistrerClient = async (e) => {
    e.preventDefault();
    setMessage("");
    setErreur("");

    try {
      if (idModification !== null) {
        await api.put(`/clients/${idModification}`, client);
        setMessage("Client modifié avec succès !");
      } else {
        await api.post("/clients", client);
        setMessage("Client ajouté avec succès !");
      }

      setClient({ ...initialClient });
      setIdModification(null);
      await chargerClients();
    } catch (error) {
      console.log(error.response?.data);
      const erreurs = error.response?.data?.errors;

      if (erreurs) {
        setErreur(Object.values(erreurs).flat().join(" | "));
      } else {
        setErreur("Erreur lors de l'enregistrement");
      }
    }
  };

  const modifierClient = (c) => {
    setIdModification(c.id);

    setClient({
      nom: c.nom,
      prenom: c.prenom,
      cin: c.cin,
      telephone: c.telephone,
      email: c.email ?? "",
      adresse: c.adresse ?? "",
      numero_permis: c.numero_permis,
      date_naissance: c.date_naissance ?? "",
    });

    setMessage("");
    setErreur("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const supprimerClient = async (id) => {
    if (!window.confirm("Supprimer ce client ?")) return;

    try {
      await api.delete(`/clients/${id}`);
      await chargerClients();

      if (idModification === id) {
        setIdModification(null);
        setClient({ ...initialClient });
      }

      setMessage("Client supprimé avec succès !");
      setErreur("");
    } catch (error) {
      console.log(error);
      setErreur("Erreur lors de la suppression");
    }
  };

  const annulerModification = () => {
    setIdModification(null);
    setClient({ ...initialClient });
    setErreur("");
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Gestion des clients</h1>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {erreur && <p style={{ color: "red" }}>{erreur}</p>}

      <h2>
        {idModification !== null
          ? "Modifier un client"
          : "Ajouter un client"}
      </h2>

      <form onSubmit={enregistrerClient}>
        <input
          name="nom"
          placeholder="Nom"
          value={client.nom}
          onChange={handleChange}
          required
        />

        <input
          name="prenom"
          placeholder="Prénom"
          value={client.prenom}
          onChange={handleChange}
          required
        />

        <input
          name="cin"
          placeholder="CIN"
          value={client.cin}
          onChange={handleChange}
          required
        />

        <input
          name="telephone"
          placeholder="Téléphone"
          value={client.telephone}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={client.email}
          onChange={handleChange}
        />

        <input
          name="adresse"
          placeholder="Adresse"
          value={client.adresse}
          onChange={handleChange}
        />

        <input
          name="numero_permis"
          placeholder="Numéro de permis"
          value={client.numero_permis}
          onChange={handleChange}
          required
        />

        <label>
          Date de naissance :
          <input
            type="date"
            name="date_naissance"
            value={client.date_naissance}
            onChange={handleChange}
          />
        </label>

        <button type="submit">
          {idModification !== null ? "Enregistrer" : "Ajouter"}
        </button>

        {idModification !== null && (
          <button type="button" onClick={annulerModification}>
            Annuler
          </button>
        )}
      </form>

      <hr />

      <h2>Liste des clients</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>CIN</th>
            <th>Téléphone</th>
            <th>Permis</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {clients.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nom}</td>
              <td>{c.prenom}</td>
              <td>{c.cin}</td>
              <td>{c.telephone}</td>
              <td>{c.numero_permis}</td>
              <td>
                <button
                  type="button"
                  onClick={() => modifierClient(c)}
                >
                  Modifier
                </button>

                <button
                  type="button"
                  onClick={() => supprimerClient(c.id)}
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {clients.length === 0 && <p>Aucun client enregistré.</p>}
    </div>
  );
}

export default Clients;
