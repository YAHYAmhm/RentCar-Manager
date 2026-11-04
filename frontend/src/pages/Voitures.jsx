
import { useEffect, useState } from "react";
import {
  Plus, Pencil, Trash2, Upload, X,
  CarFront, Fuel, Gauge, Settings2, Users,
  ImagePlus, Search
} from "lucide-react";
import api from "../services/api";
import "./Voitures.css";

const API_URL = "http://127.0.0.1:8000";

const initialForm = {
  marque: "",
  modele: "",
  immatriculation: "",
  annee: new Date().getFullYear(),
  couleur: "",
  carburant: "Diesel",
  boite_vitesse: "Manuelle",
  places: 5,
  kilometrage: 0,
  prix_jour: "",
  etat: "en_service",
  description: "",
};

const photoUrl = (path) =>
  path ? `${API_URL}/storage/${path}` : null;

export default function Voitures() {
  const [voitures, setVoitures] = useState([]);
  const [form, setForm] = useState({ ...initialForm });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  const charger = async () => {
    try {
      const res = await api.get("/voitures");
      setVoitures(res.data);
    } catch {
      setErreur("Impossible de charger les voitures.");
    }
  };

  useEffect(() => {
    charger();
  }, []);

  useEffect(() => {
    if (!photo) return;
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const ouvrirAjout = () => {
    setEditing(null);
    setForm({ ...initialForm });
    setPhoto(null);
    setPreview(null);
    setErreur("");
    setModalOpen(true);
  };

  const ouvrirModification = (v) => {
    setEditing(v);
    setForm({
      marque: v.marque ?? "",
      modele: v.modele ?? "",
      immatriculation: v.immatriculation ?? "",
      annee: v.annee ?? new Date().getFullYear(),
      couleur: v.couleur ?? "",
      carburant: v.carburant ?? "Diesel",
      boite_vitesse: v.boite_vitesse ?? "Manuelle",
      places: v.places ?? 5,
      kilometrage: v.kilometrage ?? 0,
      prix_jour: v.prix_jour ?? "",
      etat: v.etat ?? "en_service",
      description: v.description ?? "",
    });
    setPhoto(null);
    setPreview(photoUrl(v.photo));
    setErreur("");
    setModalOpen(true);
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErreur("");

    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value ?? "");
    });

    if (photo) data.append("photo", photo);

    try {
      if (editing) {
        data.append("_method", "PUT");
        await api.post(`/voitures/${editing.id}`, data);
      } else {
        await api.post("/voitures", data);
      }

      setModalOpen(false);
      setPhoto(null);
      setPreview(null);
      await charger();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setErreur(
        errors
          ? Object.values(errors).flat().join(" | ")
          : err.response?.data?.message || "Erreur d'enregistrement"
      );
    } finally {
      setLoading(false);
    }
  };

  const supprimer = async (id) => {
    if (!window.confirm("Supprimer cette voiture ?")) return;

    try {
      await api.delete(`/voitures/${id}`);
      await charger();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Suppression impossible : voiture liée à des réservations."
      );
    }
  };

  const voituresFiltrees = voitures.filter((v) =>
    `${v.marque} ${v.modele} ${v.immatriculation}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="fleet-page">
      <div className="fleet-heading">
        <div>
          <span className="fleet-eyebrow">FLEET MANAGEMENT</span>
          <h1>Notre flotte</h1>
          <p>Gérez votre catalogue de véhicules.</p>
        </div>

        <button className="fleet-add" onClick={ouvrirAjout}>
          <Plus size={18} /> Ajouter un véhicule
        </button>
      </div>

      <div className="fleet-toolbar">
        <div className="fleet-search">
          <Search size={19} />
          <input
            type="search"
            placeholder="Rechercher une voiture..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span>{voituresFiltrees.length} véhicules</span>
      </div>

      <div className="fleet-grid">
        {voituresFiltrees.map((v) => (
          <article className="vehicle-card" key={v.id}>
            <div className="vehicle-image">
              {v.photo ? (
                <img
                  src={photoUrl(v.photo)}
                  alt={`${v.marque} ${v.modele}`}
                />
              ) : (
                <div className="vehicle-placeholder">
                  <CarFront size={48} />
                  <span>Photo indisponible</span>
                </div>
              )}

              <span className={`vehicle-status status-${v.etat}`}>
                {v.etat === "en_service"
                  ? "En service"
                  : v.etat === "en_maintenance"
                  ? "Maintenance"
                  : "Hors service"}
              </span>
            </div>

            <div className="vehicle-body">
              <div className="vehicle-title">
                <div>
                  <small>{v.marque}</small>
                  <h3>{v.modele}</h3>
                </div>
                <div className="vehicle-price">
                  <strong>{Number(v.prix_jour).toFixed(0)} DH</strong>
                  <span>/ jour</span>
                </div>
              </div>

              <div className="vehicle-specs">
                <span><Fuel size={15} /> {v.carburant}</span>
                <span><Settings2 size={15} /> {v.boite_vitesse}</span>
                <span><Users size={15} /> {v.places} places</span>
                <span><Gauge size={15} /> {v.kilometrage} km</span>
              </div>

              <div className="vehicle-bottom">
                <span>{v.immatriculation}</span>
                <div className="vehicle-actions">
                  <button onClick={() => ouvrirModification(v)} title="Modifier">
                    <Pencil size={17} />
                  </button>
                  <button onClick={() => supprimer(v.id)} title="Supprimer">
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {voituresFiltrees.length === 0 && (
        <div className="fleet-empty">
          <CarFront size={36} />
          <h3>Aucun véhicule trouvé</h3>
          <p>Ajoutez une voiture ou modifiez votre recherche.</p>
        </div>
      )}

      {modalOpen && (
        <div className="fleet-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="fleet-modal"
            role="dialog"
            aria-modal="true"
            aria-label={editing ? "Modifier le véhicule" : "Ajouter un véhicule"}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="fleet-modal-header">
              <div>
                <span className="fleet-eyebrow">VEHICLE DETAILS</span>
                <h2>{editing ? "Modifier le véhicule" : "Nouveau véhicule"}</h2>
              </div>
              <button
                className="fleet-close"
                onClick={() => setModalOpen(false)}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={enregistrer} className="fleet-form">
              <label className="fleet-upload">
                {preview ? (
                  <img src={preview} alt="Aperçu du véhicule" />
                ) : (
                  <div className="fleet-upload-empty">
                    <ImagePlus size={32} />
                    <strong>Ajouter une photo</strong>
                    <span>JPG, PNG ou WEBP — 5 Mo max.</span>
                  </div>
                )}
                <div className="fleet-upload-action">
                  <Upload size={16} />
                  {preview ? "Changer la photo" : "Choisir une photo"}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      setErreur("Photo trop grande (max 5 Mo).");
                      return;
                    }
                    setErreur("");
                    setPhoto(file);
                  }}
                />
              </label>

              <div className="fleet-fields">
                {[
                  ["marque", "Marque"],
                  ["modele", "Modèle"],
                  ["immatriculation", "Immatriculation"],
                  ["annee", "Année", "number"],
                  ["couleur", "Couleur"],
                  ["places", "Places", "number"],
                  ["kilometrage", "Kilométrage", "number"],
                  ["prix_jour", "Prix / jour (DH)", "number"],
                ].map(([name, label, type = "text"]) => (
                  <div className="fleet-field" key={name}>
                    <label htmlFor={name}>{label}</label>
                    <input
                      id={name}
                      name={name}
                      type={type}
                      step={name === "prix_jour" ? "0.01" : undefined}
                      value={form[name]}
                      onChange={handleChange}
                      required={!["couleur"].includes(name)}
                    />
                  </div>
                ))}

                <div className="fleet-field">
                  <label>Carburant</label>
                  <select name="carburant" value={form.carburant} onChange={handleChange}>
                    <option>Diesel</option>
                    <option>Essence</option>
                    <option>Hybride</option>
                    <option>Électrique</option>
                  </select>
                </div>

                <div className="fleet-field">
                  <label>Boîte de vitesse</label>
                  <select name="boite_vitesse" value={form.boite_vitesse} onChange={handleChange}>
                    <option>Manuelle</option>
                    <option>Automatique</option>
                  </select>
                </div>

                <div className="fleet-field">
                  <label>État</label>
                  <select name="etat" value={form.etat} onChange={handleChange}>
                    <option value="en_service">En service</option>
                    <option value="en_maintenance">Maintenance</option>
                    <option value="hors_service">Hors service</option>
                  </select>
                </div>

                <div className="fleet-field fleet-full">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>

              {erreur && <p className="fleet-error">{erreur}</p>}

              <div className="fleet-form-actions">
                <button type="button" onClick={() => setModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? "Enregistrement..." : editing ? "Enregistrer" : "Ajouter le véhicule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
